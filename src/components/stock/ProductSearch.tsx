
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export function ProductSearch() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Use o hook useRef para criar uma função debounce que não muda entre os renders
  const handleSearchChange = debounce((value: string) => {
    setDebouncedSearch(value);
  }, 300);

  const { data: products, isLoading } = useQuery<WarehouseOccupation[]>({
    queryKey: ["warehouse-occupation-report", debouncedSearch],
    queryFn: async () => {
      console.log("Fetching warehouse occupation data with search:", debouncedSearch);
      
      const query = supabase
        .from("warehouse_occupation_report")
        .select("id, product_id, product_name, quantity, floor, position_number, entry_date")
        .order("product_name");

      if (debouncedSearch) {
        query.ilike("product_name", `%${debouncedSearch}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching warehouse occupation data:", error);
        throw error;
      }

      console.log("Warehouse occupation data received:", data);
      return data.map(item => ({
        ...item,
        floor: item.floor || "N/A",
      }));
    },
    staleTime: 30000, // 30 segundos
    gcTime: 60000, // 1 minuto (substitui cacheTime que está obsoleto)
  });

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
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              products?.map((item) => (
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
