
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StockMovements() {
  const { data: movements, isLoading } = useQuery({
    queryKey: ["warehouse-occupation-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warehouse_occupation_report")
        .select("*")
        .order("entry_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Carregando movimentações...</div>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Posição</TableHead>
            <TableHead>Responsável</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements?.map((movement) => (
            <TableRow key={`${movement.product_id}-${movement.position_number}-${movement.entry_date}`}>
              <TableCell>
                {new Date(movement.entry_date).toLocaleString()}
              </TableCell>
              <TableCell>{movement.product_name}</TableCell>
              <TableCell>{movement.quantity}</TableCell>
              <TableCell>
                {movement.floor}-{movement.position_number}
              </TableCell>
              <TableCell>{movement.stored_by}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
