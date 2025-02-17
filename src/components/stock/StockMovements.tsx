
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
import type { StockMovement } from "@/types/warehouse";

export function StockMovements() {
  const { data: movements, isLoading } = useQuery<StockMovement[]>({
    queryKey: ["stock-movements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("all_stock_movements_view")
        .select("*");
      // No need to add order as it's handled by the view's FIFO ordering

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
            <TableHead>Tipo</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Posição</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Observações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements?.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>
                {new Date(movement.movement_date).toLocaleString()}
              </TableCell>
              <TableCell>
                {movement.product_name} ({movement.product_unit})
              </TableCell>
              <TableCell>
                {movement.movement_type === 'input' ? 'Entrada' : 'Saída'}
              </TableCell>
              <TableCell>{movement.quantity}</TableCell>
              <TableCell>
                {movement.floor && movement.position_number 
                  ? `${movement.floor}-${movement.position_number}`
                  : 'N/A'}
              </TableCell>
              <TableCell>{movement.created_by_name || 'N/A'}</TableCell>
              <TableCell>{movement.notes || '-'}</TableCell>
            </TableRow>
          ))}
          {!movements?.length && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                Nenhuma movimentação encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
