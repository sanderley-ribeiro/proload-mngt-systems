
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
  const { data: products, refetch: refetchProducts } = useQuery({
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

  // Função para reservar o estoque quando um item é adicionado ao romaneio
  const reserveStock = async (productId: string, floor: string, position: number, quantity: number) => {
    try {
      console.log(`Reservando ${quantity} unidades do produto ${productId} na posição ${floor}-${position}`);
      
      // Get user profile for the movement creation
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error("Usuário não autenticado");

      // Criar um movimento de saída para reservar o estoque
      const { error: movementError } = await supabase
        .from('product_movements')
        .insert({
          product_id: productId,
          type: 'output',
          quantity: -Math.abs(quantity), // Garantir que a quantidade seja negativa para saídas
          created_by: profile.user.id,
          floor: floor,
          position_number: position,
          notes: `Reserva para romaneio (em criação)`
        });

      if (movementError) throw movementError;

      // Atualizar explicitamente a posição do warehouse_occupation_report
      const { error: updateError } = await supabase
        .rpc('update_warehouse_position_quantity', {
          p_product_id: productId,
          p_floor: floor,
          p_position: position,
          p_quantity: -Math.abs(quantity) // Garantir que a quantidade seja negativa para saídas
        });
      
      if (updateError) throw updateError;

      console.log(`Estoque reservado com sucesso: produto ${productId}, posição ${floor}-${position}, quantidade -${quantity}`);
      
      // Atualizar as queries para refletir as mudanças
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
      queryClient.invalidateQueries({ queryKey: ["products-with-stock"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-occupation-report"] });
      
      return true;
    } catch (error) {
      console.error("Erro ao reservar estoque:", error);
      return false;
    }
  };

  // Função para liberar o estoque quando um item é removido do romaneio
  const releaseStock = async (productId: string, floor: string, position: number, quantity: number) => {
    try {
      console.log(`Liberando ${quantity} unidades do produto ${productId} na posição ${floor}-${position}`);
      
      // Get user profile for the movement creation
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error("Usuário não autenticado");

      // Criar um movimento de entrada para liberar o estoque
      const { error: movementError } = await supabase
        .from('product_movements')
        .insert({
          product_id: productId,
          type: 'input',
          quantity: Math.abs(quantity), // Garantir que a quantidade seja positiva para entradas
          created_by: profile.user.id,
          floor: floor,
          position_number: position,
          notes: `Liberação de reserva de romaneio (cancelado)`
        });

      if (movementError) throw movementError;

      // Atualizar explicitamente a posição do warehouse_occupation_report
      const { error: updateError } = await supabase
        .rpc('update_warehouse_position_quantity', {
          p_product_id: productId,
          p_floor: floor,
          p_position: position,
          p_quantity: Math.abs(quantity) // Garantir que a quantidade seja positiva para entradas
        });
      
      if (updateError) throw updateError;

      console.log(`Estoque liberado com sucesso: produto ${productId}, posição ${floor}-${position}, quantidade +${quantity}`);
      
      // Atualizar as queries para refletir as mudanças
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
      queryClient.invalidateQueries({ queryKey: ["products-with-stock"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-occupation-report"] });
      
      return true;
    } catch (error) {
      console.error("Erro ao liberar estoque:", error);
      return false;
    }
  };

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
      const { error: itemsError } = await supabase
        .from("shipping_manifest_items")
        .insert(
          items.map(item => ({
            manifest_id: manifest.id,
            product_id: item.productId,
            quantity: item.quantity,
            warehouse_floor: item.warehouse_floor,
            warehouse_position: item.warehouse_position,
          }))
        );

      if (itemsError) throw itemsError;

      console.log("Itens inseridos no romaneio");

      // Invalidar a query para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["manifests"] });

      toast({
        title: "Romaneio criado com sucesso!",
      });
      
      // Limpar o formulário usando a referência
      if (formRef.current) {
        formRef.current.reset();
      }
      setItems([]);
      
    } catch (error: any) {
      console.error("Erro ao criar romaneio:", error);
      
      // Se houver erro, liberar todas as reservas de estoque
      for (const item of items) {
        if (item.warehouse_floor && item.warehouse_position) {
          await releaseStock(item.productId, item.warehouse_floor, item.warehouse_position, item.quantity);
        }
      }
      
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

  const removeItem = async (index: number) => {
    const itemToRemove = items[index];
    
    // Se o item já tinha estoque reservado, liberar o estoque
    if (itemToRemove.productId && itemToRemove.quantity > 0 && 
        itemToRemove.warehouse_floor && itemToRemove.warehouse_position) {
      const success = await releaseStock(
        itemToRemove.productId, 
        itemToRemove.warehouse_floor, 
        itemToRemove.warehouse_position, 
        itemToRemove.quantity
      );
      
      if (!success) {
        toast({
          title: "Erro ao liberar estoque",
          description: "Não foi possível liberar o estoque reservado para este item.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setItems(items.filter((_, i) => i !== index));
    
    // Atualizar a lista de produtos disponíveis
    refetchProducts();
  };

  const updateItem = async (index: number, field: keyof ManifestItem, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];
    
    // Se estamos mudando o produto e já tínhamos um produto com quantidade, liberar o estoque anterior
    if (field === "productId" && item.productId && item.quantity > 0 && 
        item.warehouse_floor && item.warehouse_position) {
      await releaseStock(
        item.productId, 
        item.warehouse_floor, 
        item.warehouse_position, 
        item.quantity
      );
    }
    
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
      
      if (!product) return;
      
      // Se estamos diminuindo a quantidade, liberar a diferença
      if (item.quantity > Number(value) && item.warehouse_floor && item.warehouse_position) {
        const quantityDiff = item.quantity - Number(value);
        await releaseStock(
          item.productId, 
          item.warehouse_floor, 
          item.warehouse_position, 
          quantityDiff
        );
      }
      
      // Se estamos aumentando a quantidade, verificar disponibilidade e reservar a diferença
      if (item.quantity < Number(value)) {
        const quantityDiff = Number(value) - item.quantity;
        
        if (product.available_quantity && quantityDiff > product.available_quantity) {
          toast({
            title: "Quantidade indisponível",
            description: `O produto ${product.name} possui apenas ${product.available_quantity} unidades em estoque na posição ${product.warehouse_floor}-${product.warehouse_position}.`,
            variant: "destructive",
          });
          return;
        }
        
        // Reservar a diferença de estoque
        if (product.warehouse_floor && product.warehouse_position) {
          const success = await reserveStock(
            item.productId,
            product.warehouse_floor,
            product.warehouse_position,
            quantityDiff
          );
          
          if (!success) {
            toast({
              title: "Erro ao reservar estoque",
              description: "Não foi possível reservar o estoque para este item.",
              variant: "destructive",
            });
            return;
          }
        }
      }

      newItems[index] = {
        ...item,
        quantity: Number(value),
      };
    }

    setItems(newItems);
    
    // Atualizar a lista de produtos disponíveis
    refetchProducts();
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
