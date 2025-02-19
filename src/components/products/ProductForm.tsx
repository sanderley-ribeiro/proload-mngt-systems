
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  unit: string;
  created_at: string;
}

export default function ProductForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data: products, isError } = useQuery<Product[]>({
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const productName = formData.get("name") as string;
    const unit = formData.get("unit") as string;

    try {
      const { data: existingProducts } = await supabase
        .from("products")
        .select("id")
        .eq("name", productName)
        .limit(1);

      if (existingProducts && existingProducts.length > 0) {
        toast.error("Já existe um produto cadastrado com este nome");
        return;
      }

      const { error } = await supabase
        .from("products")
        .insert([{ name: productName, unit }]);

      if (error) throw error;

      toast.success("Produto cadastrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      e.currentTarget.reset();
    } catch (error: any) {
      toast.error("Erro ao cadastrar produto: " + error.message);
      console.error("Erro ao cadastrar produto:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct) return;

    const formData = new FormData(e.currentTarget);
    const newName = formData.get("edit-name") as string;
    const newUnit = formData.get("edit-unit") as string;

    try {
      // Verifica se já existe outro produto com o mesmo nome
      const { data: existingProducts } = await supabase
        .from("products")
        .select("id")
        .eq("name", newName)
        .neq("id", editingProduct.id)
        .limit(1);

      if (existingProducts && existingProducts.length > 0) {
        toast.error("Já existe outro produto cadastrado com este nome");
        return;
      }

      const { error } = await supabase
        .from("products")
        .update({ name: newName, unit: newUnit })
        .eq("id", editingProduct.id);

      if (error) throw error;

      toast.success("Produto atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
    } catch (error: any) {
      toast.error("Erro ao atualizar produto: " + error.message);
      console.error("Erro ao atualizar produto:", error);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      console.log("Deletando produto:", productId);

      const { data: movements, error: movementsError } = await supabase
        .from("product_movements")
        .select("id")
        .eq("product_id", productId)
        .limit(1);

      if (movementsError) {
        console.error("Erro ao verificar movimentações:", movementsError);
        throw movementsError;
      }

      if (movements && movements.length > 0) {
        toast.error("Não é possível excluir um produto que já possui movimentações");
        return;
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        console.error("Erro ao deletar:", error);
        throw error;
      }

      // Atualiza o cache local imediatamente
      queryClient.setQueryData<Product[]>(["products"], (oldData) => {
        return oldData?.filter(product => product.id !== productId) ?? [];
      });

      // Invalida a query para buscar dados atualizados do servidor
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      
      toast.success("Produto excluído com sucesso!");
    } catch (error: any) {
      console.error("Erro completo:", error);
      toast.error("Erro ao excluir produto: " + error.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isError) {
    return (
      <div className="text-center py-4 text-red-600">
        Erro ao carregar produtos. Por favor, recarregue a página.
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
              <TableHead>Unidade</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{formatDate(product.created_at)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    onClick={() => setEditingProduct(product)}
                    size="icon"
                    variant="ghost"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o produto "{product.name}"? Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(product.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {!products?.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Nenhum produto cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Produto</Label>
                <Input 
                  id="edit-name" 
                  name="edit-name" 
                  defaultValue={editingProduct?.name}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unidade de Medida</Label>
                <Input 
                  id="edit-unit" 
                  name="edit-unit" 
                  defaultValue={editingProduct?.unit}
                  placeholder="ex: kg, litros, unidades" 
                  required 
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
