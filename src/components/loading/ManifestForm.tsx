
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ManifestFormHeader from "./ManifestFormHeader";
import ManifestItem from "./ManifestItem";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  unit: string;
  stock?: number;
  warehouse_floor?: string;
  warehouse_position?: number;
  available_quantity?: number;
}

interface ManifestItem {
  productId: string;
  quantity: number;
  warehouse_floor?: string;
  warehouse_position?: number;
}

interface ManifestFormProps {
  manifestId?: string;
}

export default function ManifestForm({ manifestId }: ManifestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<ManifestItem[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);

  // Query para buscar produtos com seus saldos em estoque e posições
  const { data: products } = useQuery({
    queryKey: ["products-with-stock"],
    queryFn: async () => {
      console.log("Buscando produtos com posições mais antigas");
      
      // Primeiro, busca todos os produtos
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, unit")
        .order("name");
      
      if (productsError) throw productsError;

      // Para cada produto, busca a posição mais antiga e quantidade disponível
      const productsWithStock = await Promise.all(products.map(async (product) => {
        const { data: position } = await supabase
          .rpc('get_oldest_position', {
            p_product_id: product.id
          })
          .single();

        console.log(`Produto ${product.name}, posição mais antiga:`, position);

        return { 
          ...product, 
          warehouse_floor: position?.floor,
          warehouse_position: position?.position_number,
          available_quantity: position?.available_quantity || 0,
          stock: position?.available_quantity || 0
        };
      }));

      // Filtra apenas produtos que têm estoque disponível
      const availableProducts = productsWithStock.filter(p => p.stock && p.stock > 0 && p.warehouse_floor && p.warehouse_position);
      
      console.log("Produtos disponíveis em estoque:", availableProducts);
      return availableProducts as Product[];
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error("Usuário não autenticado");

      // Validar se há itens no romaneio
      if (items.length === 0) {
        throw new Error("Adicione pelo menos um produto ao romaneio");
      }

      // Criar o romaneio
      const { data: manifest, error: manifestError } = await supabase
        .from("shipping_manifests")
        .insert({
          driver_name: formData.get("driver_name") as string,
          client_name: formData.get("client_name") as string,
          vehicle_plate: formData.get("vehicle_plate") as string,
          created_by: profile.user.id,
          number: '0', // O número será gerado automaticamente pelo trigger
        })
        .select()
        .single();

      if (manifestError) throw manifestError;

      console.log("Romaneio criado:", manifest);

      // Inserir os itens do romaneio com suas posições
      const { data: insertedItems, error: itemsError } = await supabase
        .from("shipping_manifest_items")
        .insert(
          items.map(item => ({
            manifest_id: manifest.id,
            product_id: item.productId,
            quantity: item.quantity,
            warehouse_floor: item.warehouse_floor,
            warehouse_position: item.warehouse_position,
          }))
        )
        .select();

      if (itemsError) throw itemsError;

      console.log("Itens inseridos no romaneio");

      // Criar movimentos de estoque para cada item e atualizar warehouse_occupation_report
      const stockMovements = items.map(item => {
        const product = products?.find(p => p.id === item.productId);
        console.log(`Criando movimento de saída para produto ${product?.name} na posição ${item.warehouse_floor}-${item.warehouse_position}`);
        
        return {
          product_id: item.productId,
          type: 'output',
          quantity: -Math.abs(item.quantity), // Garantir que a quantidade seja negativa para saídas
          created_by: profile.user.id,
          floor: item.warehouse_floor,
          position_number: item.warehouse_position,
          notes: `Reserva para romaneio #${manifest.number}`
        };
      });

      // Inserir todos os movimentos de estoque
      const { error: movementError } = await supabase
        .from('product_movements')
        .insert(stockMovements);

      if (movementError) {
        console.error("Error creating stock movements:", movementError);
        throw movementError;
      }

      // Atualizar explicitamente as posições do warehouse_occupation_report
      for (const item of items) {
        const product = products?.find(p => p.id === item.productId);
        
        // Chama a função RPC para atualizar a quantidade na posição específica
        const { error: updateError } = await supabase
          .rpc('update_warehouse_position_quantity', {
            p_product_id: item.productId,
            p_floor: item.warehouse_floor,
            p_position: item.warehouse_position,
            p_quantity: -Math.abs(item.quantity) // Garantir que a quantidade seja negativa para saídas
          });
        
        if (updateError) {
          console.error(`Error updating warehouse position for product ${item.productId}:`, updateError);
          throw updateError;
        }
        
        console.log(`Posição do armazém atualizada: produto ${product?.name}, posição ${item.warehouse_floor}-${item.warehouse_position}, quantidade -${item.quantity}`);
      }

      // Invalidar a query para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["manifests"] });
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] }); 
      queryClient.invalidateQueries({ queryKey: ["products-with-stock"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-occupation-report"] });

      toast({
        title: "Romaneio criado com sucesso!",
        description: "Os produtos foram reservados no estoque."
      });
      
      // Limpar o formulário usando a referência
      if (formRef.current) {
        formRef.current.reset();
      }
      setItems([]);
      
    } catch (error: any) {
      console.error("Erro ao criar romaneio:", error);
      toast({
        title: "Erro ao criar romaneio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ManifestItem, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === "productId") {
      const product = products?.find(p => p.id === value);
      if (!product) return;

      // Se não houver posição disponível, não permitir adicionar
      if (!product.warehouse_floor || !product.warehouse_position) {
        toast({
          title: "Produto indisponível",
          description: `Não há posição disponível para o produto ${product.name}`,
          variant: "destructive",
        });
        return;
      }

      console.log(`Selecionando produto ${product.name} na posição ${product.warehouse_floor}-${product.warehouse_position}`);

      newItems[index] = {
        ...item,
        productId: value as string,
        warehouse_floor: product.warehouse_floor,
        warehouse_position: product.warehouse_position,
        quantity: item.quantity || 0,
      };
    } else if (field === "quantity") {
      const product = products?.find(p => p.id === item.productId);
      
      if (product && Number(value) > (product.available_quantity || 0)) {
        toast({
          title: "Quantidade indisponível",
          description: `O produto ${product.name} possui apenas ${product.available_quantity} unidades em estoque na posição ${product.warehouse_floor}-${product.warehouse_position}.`,
          variant: "destructive",
        });
        return;
      }

      newItems[index] = {
        ...item,
        quantity: Number(value),
      };
    }

    setItems(newItems);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <ManifestFormHeader disabled={isLoading} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Produtos</Label>
          <Button type="button" variant="outline" onClick={addItem}>
            Adicionar Produto
          </Button>
        </div>

        {items.map((item, index) => (
          <ManifestItem
            key={index}
            index={index}
            item={item}
            products={products}
            onUpdate={updateItem}
            onRemove={removeItem}
          />
        ))}
      </div>

      <Button type="submit" disabled={isLoading || items.length === 0}>
        {isLoading ? "Criando..." : "Criar Romaneio"}
      </Button>
    </form>
  );
}
