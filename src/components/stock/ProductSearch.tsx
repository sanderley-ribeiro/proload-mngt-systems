
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
import type { WarehouseOccupation } from "@/types/warehouse";

export function ProductSearch() {
  const [search, setSearch] = useState("");

  const { data: products, isLoading } = useQuery<WarehouseOccupation[]>({
    queryKey: ["warehouse-occupation-report", search],
    queryFn: async () => {
      const query = supabase
        .from("warehouse_occupation_report")
        .select("*")
        .order("product_name");

      if (search) {
        query.ilike("product_name", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar produto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="border rounded-lg">
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
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
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
