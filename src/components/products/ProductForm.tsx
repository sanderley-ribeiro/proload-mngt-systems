
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  barcode: string;
  unit: string;
  created_at: string;
}

export default function ProductForm() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { user, session } = useAuth();

  console.log("Auth state:", { user, session });

  const { data: products, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      console.log("Fetching products with session:", session);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      console.log("Products fetched:", data);
      return data;
    },
    enabled: !!session, // Alterado para verificar a sessão ao invés de apenas o user
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!session) {
      toast.error("Você precisa estar autenticado para cadastrar produtos");
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const productName = formData.get("name") as string;

    try {
      console.log("Current session:", session);
      console.log("Checking for existing products with name:", productName);
      
      const { data: existingProducts, error: searchError } = await supabase
        .from("products")
        .select("name")
        .eq("name", productName);

      if (searchError) {
        console.error("Error checking existing products:", searchError);
        throw searchError;
      }

      if (existingProducts && existingProducts.length > 0) {
        toast.error("Já existe um produto cadastrado com este nome");
        return;
      }

      const productData = {
        name: productName,
        barcode: formData.get("barcode") as string,
        unit: formData.get("unit") as string,
      };

      console.log("Inserting new product:", productData);
      const { error: insertError } = await supabase
        .from("products")
        .insert(productData);

      if (insertError) {
        console.error("Error inserting product:", insertError);
        throw insertError;
      }

      toast.success("Produto cadastrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      e.currentTarget.reset();
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error(`Erro ao cadastrar produto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!session) {
      toast.error("Você precisa estar autenticado para excluir produtos");
      return;
    }

    try {
      console.log("Current session:", session);
      console.log("Checking manifest items for product:", productId);
      
      const { data: manifestItems, error: checkError } = await supabase
        .from("shipping_manifest_items")
        .select("id")
        .eq("product_id", productId)
        .limit(1);

      if (checkError) {
        console.error("Error checking manifest items:", checkError);
        throw checkError;
      }

      if (manifestItems && manifestItems.length > 0) {
        toast.error(
          "Este produto está sendo utilizado em um ou mais romaneios e não pode ser excluído."
        );
        return;
      }

      console.log("Deleting product:", productId);
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        console.error("Error deleting product:", error);
        throw error;
      }

      toast.success("Produto excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error: any) {
      console.error("Error in handleDelete:", error);
      toast.error(`Erro ao excluir produto: ${error.message}`);
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

  if (isError) {
    return (
      <div className="text-center p-4 text-red-500">
        Erro ao carregar produtos. Por favor, tente novamente.
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center p-4 text-red-500">
        Você precisa estar autenticado para acessar esta página.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input id="name" name="name" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="barcode">Código de Barras</Label>
            <Input id="barcode" name="barcode" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Unidade de Medida</Label>
            <Input id="unit" name="unit" placeholder="ex: kg, litros, unidades" required />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
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
                <TableCell>{formatDate(product.created_at)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    onClick={() => {
                      toast.message("Funcionalidade de edição será implementada em breve");
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
