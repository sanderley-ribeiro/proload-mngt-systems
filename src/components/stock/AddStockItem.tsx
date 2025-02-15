
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { useAuth } from "@/contexts/AuthContext";

export function AddStockItem() {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { mutate: addItem, isPending } = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) {
        throw new Error("Usuário não autenticado");
      }

      // Primeiro, encontrar a melhor posição usando a função do banco
      const { data: positionId, error: positionError } = await supabase
        .rpc("find_best_position", { product_id: productId });

      if (positionError) throw positionError;

      // Depois, inserir a ocupação
      const { error: occupationError } = await supabase
        .from("warehouse_occupations")
        .insert({
          position_id: positionId,
          product_id: productId,
          quantity: parseInt(quantity),
          created_by: session.user.id
        });

      if (occupationError) throw occupationError;
    },
    onSuccess: () => {
      toast.success("Produto adicionado ao estoque com sucesso!");
      setProductId("");
      setQuantity("");
      queryClient.invalidateQueries({ queryKey: ["warehouse-positions"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-products"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-movements"] });
    },
    onError: (error) => {
      toast.error("Erro ao adicionar produto ao estoque");
      console.error(error);
    },
  });

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
                {product.name}
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
        />
      </div>

      <Button 
        onClick={() => addItem()}
        disabled={!productId || !quantity || isPending}
      >
        Adicionar ao Estoque
      </Button>
    </div>
  );
}
