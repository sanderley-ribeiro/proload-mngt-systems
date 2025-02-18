
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Product {
  id: string;
  name: string;
  unit: string;
}

export function AddStockItem() {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: products } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, unit")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddItem = async () => {
    if (!productId || !quantity) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      // Get the current user's ID from the session
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from("product_movements")
        .insert({
          product_id: productId,
          type: "input",
          quantity: Number(quantity),
          created_by: user.id
        });

      if (error) throw error;

      toast.success("Produto adicionado ao estoque com sucesso!");
      setProductId("");
      setQuantity("");
      
      // Atualizar os dados em todas as visualizações relevantes
      queryClient.invalidateQueries({ queryKey: ["warehouse-occupation-report"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
    } catch (error: any) {
      toast.error("Erro ao adicionar produto ao estoque: " + error.message);
      console.error("Erro ao adicionar produto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Produto</label>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um produto" />
          </SelectTrigger>
          <SelectContent>
            {products?.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} ({product.unit})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Quantidade</label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          step="0.01"
        />
      </div>

      <Button 
        onClick={handleAddItem}
        disabled={!productId || !quantity || isLoading}
        className="w-full"
      >
        {isLoading ? "Adicionando..." : "Adicionar ao Estoque"}
      </Button>
    </div>
  );
}
