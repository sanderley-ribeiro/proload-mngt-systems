
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ManifestFormHeader from "./ManifestFormHeader";
import ManifestItem from "./ManifestItem";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  name: string;
  unit: string;
  stock?: number;
}

interface ManifestItem {
  productId: string;
  quantity: number;
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

  // Query para buscar produtos com seus saldos em estoque
  const { data: products } = useQuery({
    queryKey: ["products-with-stock"],
    queryFn: async () => {
      // Primeiro, busca todos os produtos
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, unit")
        .order("name");
      
      if (productsError) throw productsError;

      // Para cada produto, calcula o saldo em estoque
      const productsWithStock = await Promise.all(products.map(async (product) => {
        const { data: movements } = await supabase
          .from("product_movements")
          .select("type, quantity")
          .eq("product_id", product.id);

        // Calcula o saldo somando entradas e subtraindo saídas
        const stock = movements?.reduce((acc, movement) => {
          return movement.type === "input" 
            ? acc + Number(movement.quantity) 
            : acc - Number(movement.quantity);
        }, 0) || 0;

        return { ...product, stock };
      }));

      return productsWithStock as Product[];
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error("Usuário não autenticado");

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

      // Inserir os itens do romaneio
      const { error: itemsError } = await supabase
        .from("shipping_manifest_items")
        .insert(
          items.map(item => ({
            manifest_id: manifest.id,
            product_id: item.productId,
            quantity: item.quantity,
          }))
        );

      if (itemsError) throw itemsError;

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
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Se estiver atualizando a quantidade, verifica o saldo em estoque
    if (field === "quantity") {
      const item = newItems[index];
      const product = products?.find(p => p.id === item.productId);
      
      if (product && Number(value) > (product.stock || 0)) {
        toast({
          title: "Quantidade indisponível",
          description: `O produto ${product.name} possui apenas ${product.stock} unidades em estoque.`,
          variant: "destructive",
        });
        return;
      }
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
