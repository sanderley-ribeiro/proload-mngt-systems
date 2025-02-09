
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  barcode: string;
  unit: string;
  created_at: string;
}

export default function ProductForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const productName = formData.get("name") as string;

    try {
      // Check if a product with the same name already exists
      const { data: existingProducts, error: searchError } = await supabase
        .from("products")
        .select("name")
        .eq("name", productName);

      if (searchError) throw searchError;

      if (existingProducts && existingProducts.length > 0) {
        toast({
          title: "Erro ao cadastrar produto",
          description: "Já existe um produto cadastrado com este nome",
          variant: "destructive",
        });
        return;
      }

      const data = {
        name: productName,
        barcode: formData.get("barcode") as string,
        unit: formData.get("unit") as string,
      };

      const { error: insertError } = await supabase.from("products").insert(data);
      if (insertError) throw insertError;

      toast({
        title: "Produto cadastrado com sucesso!",
      });
      
      // Invalidate products query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["products"] });
      
      e.currentTarget.reset();
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar produto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      // First check if the product is being used in any shipping manifest
      const { data: manifestItems, error: checkError } = await supabase
        .from("shipping_manifest_items")
        .select("id")
        .eq("product_id", productId)
        .limit(1);

      if (checkError) throw checkError;

      if (manifestItems && manifestItems.length > 0) {
        toast({
          title: "Não é possível excluir o produto",
          description: "Este produto está sendo utilizado em um ou mais romaneios e não pode ser excluído.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Produto excluído com sucesso!",
      });

      // Refresh the products list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome do Produto</Label>
          <Input id="name" name="name" required />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="barcode">Código de Barras</Label>
          <Input id="barcode" name="barcode" required />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="unit">Unidade de Medida</Label>
          <Input id="unit" name="unit" placeholder="ex: kg, litros, unidades" required />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Cadastrando..." : "Cadastrar Produto"}
        </Button>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Código de Barras</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.barcode}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>
                  {formatDate(product.created_at)}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    onClick={() => {
                      // TODO: Implement edit functionality
                      toast({
                        title: "Em breve",
                        description: "Funcionalidade de edição será implementada em breve",
                      });
                    }}
                    size="icon"
                    variant="ghost"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(product.id)}
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
