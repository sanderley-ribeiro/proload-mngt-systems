
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  unit: string;
}

interface Movement {
  id: string;
  type: "input" | "output";
  quantity: number;
  date: string;
  notes: string;
  products: {
    name: string;
    unit: string;
  };
}

export default function ProductMovement() {
  const [isLoading, setIsLoading] = useState(false);
  const [movementType, setMovementType] = useState<"input" | "output">("input");
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, unit")
        .order("name");
      
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: recentMovements } = useQuery({
    queryKey: ["recent-movements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_movements")
        .select(`
          id,
          type,
          quantity,
          date,
          notes,
          products (
            name,
            unit
          )
        `)
        .order('date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Movement[];
    },
  });

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'product_movements'
        },
        () => {
          // Invalidate and refetch when new movement is added
          queryClient.invalidateQueries({ queryKey: ["recent-movements"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      product_id: formData.get("product_id") as string,
      type: movementType,
      quantity: Number(formData.get("quantity")),
      notes: formData.get("notes") as string,
    };

    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("product_movements").insert({
        ...data,
        created_by: profile.user.id,
      });
      
      if (error) throw error;

      toast({
        title: "Movimento registrado com sucesso!",
      });
      
      formRef.current?.reset();
      setMovementType("input"); // Reset movement type to default
    } catch (error: any) {
      toast({
        title: "Erro ao registrar movimento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="product_id">Produto</Label>
          <Select name="product_id" required>
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

        <div className="grid gap-2">
          <Label>Tipo de Movimento</Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={movementType === "input" ? "default" : "outline"}
              onClick={() => setMovementType("input")}
            >
              Entrada
            </Button>
            <Button
              type="button"
              variant={movementType === "output" ? "default" : "outline"}
              onClick={() => setMovementType("output")}
            >
              Saída
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantidade</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="0.01"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" name="notes" />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrar Movimento"}
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Últimas Movimentações</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMovements?.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>
                    {format(new Date(movement.date), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {movement.products.name} ({movement.products.unit})
                  </TableCell>
                  <TableCell>
                    {movement.type === "input" ? "Entrada" : "Saída"}
                  </TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>{movement.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
