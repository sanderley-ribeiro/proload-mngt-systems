
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

interface Product {
  id: string;
  name: string;
  barcode: string;
  unit: string;
  created_at: string;
}

export default function ProductForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const productName = formData.get("name") as string;

    try {
      // Verificar se já existe um produto com o mesmo nome
      if (products.some(p => p.name === productName)) {
        toast.error("Já existe um produto cadastrado com este nome");
        return;
      }

      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: productName,
        barcode: formData.get("barcode") as string,
        unit: formData.get("unit") as string,
        created_at: new Date().toISOString(),
      };

      setProducts(prev => [newProduct, ...prev]);
      toast.success("Produto cadastrado com sucesso!");
      e.currentTarget.reset();
    } catch (error: any) {
      toast.error("Erro ao cadastrar produto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (productId: string) => {
    try {
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success("Produto excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir produto");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

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
            {products.map((product) => (
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
