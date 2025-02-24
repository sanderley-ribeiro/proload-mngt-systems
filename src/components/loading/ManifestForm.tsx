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

  const { data: products } = useQuery({
    queryKey: ["products-with-stock"],
    queryFn: async () => {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, unit")
        .order("name");
      
      if (productsError) throw productsError;

      const productsWithStock = await Promise.all(products.map(async (product) => {
        const { data: position } = await supabase
          .rpc('get_oldest_position', {
            p_product_id: product.id
          })
          .single();

        return { 
          ...product, 
          warehouse_floor: position?.floor,
          warehouse_position: position?.position_number,
          stock: position?.available_quantity || 0
        };
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

      const { data: manifest, error: manifestError } = await supabase
        .from("shipping_manifests")
        .insert({
          driver_name: formData.get("driver_name") as string,
          client_name: formData.get("client_name") as string,
          vehicle_plate: formData.get("vehicle_plate") as string,
          created_by: profile.user.id,
          number: '0',
        })
        .select()
        .single();

      if (manifestError) throw manifestError;

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

      queryClient.invalidateQueries({ queryKey: ["manifests"] });

      toast({
        title: "Romaneio criado com sucesso!",
      });

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

      if (!product.warehouse_floor || !product.warehouse_position) {
        toast({
          title: "Produto indisponível",
          description: `Não há posição disponível para o produto ${product.name}`,
          variant: "destructive",
        });
        return;
      }

      newItems[index] = {
        ...item,
        productId: value as string,
        warehouse_floor: product.warehouse_floor,
        warehouse_position: product.warehouse_position,
        quantity: item.quantity || 0,
      };
    } else if (field === "quantity") {
      const product = products?.find(p => p.id === item.productId);
      
      if (product && Number(value) > (product.stock || 0)) {
        toast({
          title: "Quantidade indisponível",
          description: `O produto ${product.name} possui apenas ${product.stock} unidades em estoque na posição ${product.warehouse_floor}-${product.warehouse_position}.`,
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
