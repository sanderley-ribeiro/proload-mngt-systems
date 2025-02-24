
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface ManifestItem {
  id: string;
  product_id: string;
  quantity: number;
  scanned_at: string[] | null;
  warehouse_floor: string | null;
  warehouse_position: number | null;
  product: {
    name: string;
    unit: string;
  };
}

interface ManifestItemsTableProps {
  items: ManifestItem[];
  isComplete: boolean;
  status: string;
  onComplete: () => void;
  onScanItem: (itemId: string) => void;
}

export function ManifestItemsTable({ 
  items, 
  isComplete, 
  status, 
  onComplete,
  onScanItem 
}: ManifestItemsTableProps) {
  const isCompleted = status === 'finalizado';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Produtos do Romaneio</CardTitle>
        {isCompleted && (
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Finalizado
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Posição</TableHead>
              <TableHead className="text-right">Escaneado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Último Escaneamento</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const scannedQuantity = item.scanned_at?.length || 0;
              const isItemComplete = scannedQuantity >= item.quantity;
              const lastScan = item.scanned_at?.length 
                ? new Date(item.scanned_at[item.scanned_at.length - 1]).toLocaleString('pt-BR')
                : '-';
              const position = item.warehouse_floor && item.warehouse_position 
                ? `${item.warehouse_floor}-${item.warehouse_position}`
                : '-';

              return (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{item.product.unit}</TableCell>
                  <TableCell>{position}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span
                      className={
                        isItemComplete ? "text-green-600" : "text-red-600"
                      }
                    >
                      {scannedQuantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                  <TableCell>{lastScan}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (isItemComplete) {
                          toast.error("Quantidade máxima atingida");
                          return;
                        }
                        onScanItem(item.id);
                      }}
                      disabled={isItemComplete || isCompleted}
                    >
                      Adicionar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="mt-6">
          <Button 
            disabled={!isComplete || isCompleted}
            onClick={onComplete}
            className={isCompleted ? "hidden" : ""}
          >
            Finalizar Romaneio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
