
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { WarehouseOccupation } from "@/types/warehouse";
import { debounce } from 'lodash';
import { toast } from "sonner";

// Mock data para exibir na interface sem backend
const mockProducts: WarehouseOccupation[] = [
  {
    id: "1",
    product_id: "p1",
    product_name: "Produto A",
    quantity: 120,
    floor: "A",
    position_number: 5,
    entry_date: new Date().toISOString(),
    stored_by: "Usuário 1"
  },
  {
    id: "2",
    product_id: "p2",
    product_name: "Produto B",
    quantity: 85,
    floor: "B",
    position_number: 12,
    entry_date: new Date().toISOString(),
    stored_by: "Usuário 2"
  },
  {
    id: "3",
    product_id: "p3",
    product_name: "Produto C",
    quantity: 200,
    floor: "A",
    position_number: 8,
    entry_date: new Date().toISOString(),
    stored_by: "Usuário 1"
  },
  {
    id: "4",
    product_id: "p4",
    product_name: "Produto D",
    quantity: 45,
    floor: "C",
    position_number: 3,
    entry_date: new Date().toISOString(),
    stored_by: "Usuário 3"
  },
  {
    id: "5",
    product_id: "p5",
    product_name: "Produto E",
    quantity: 150,
    floor: "B",
    position_number: 9,
    entry_date: new Date().toISOString(),
    stored_by: "Usuário 2"
  }
];

export function ProductSearch() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<WarehouseOccupation[]>(mockProducts);

  // Use debounce para evitar muitas buscas
  const handleSearchChange = debounce((value: string) => {
    setDebouncedSearch(value);
    
    // Simulando uma busca com delay para parecer real
    setIsLoading(true);
    setTimeout(() => {
      try {
        if (!value) {
          setProducts(mockProducts);
        } else {
          const filteredProducts = mockProducts.filter(product => 
            product.product_name.toLowerCase().includes(value.toLowerCase())
          );
          setProducts(filteredProducts);
        }
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar produtos:", err);
        setError("Erro ao buscar produtos");
        toast.error("Erro ao buscar produtos");
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, 300);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar produto..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          handleSearchChange(e.target.value);
        }}
        className="max-w-md"
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Erro ao carregar dados: {error}</p>
          <p className="text-sm">Por favor, tente novamente mais tarde ou contacte o suporte.</p>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Andar</TableHead>
              <TableHead>Posição</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Data de Entrada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Esqueletos para exibir durante o carregamento
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              products.map((item) => (
                <TableRow key={`${item.product_id}-${item.position_number}`}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.floor}</TableCell>
                  <TableCell>{item.position_number}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {new Date(item.entry_date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
