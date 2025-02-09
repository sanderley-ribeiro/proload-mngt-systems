
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

interface ManifestItem {
  id: string;
  product_id: string;
  quantity: number;
  scanned_at: string[];
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
}

export function ManifestItemsTable({ 
  items, 
  isComplete, 
  status, 
  onComplete 
}: ManifestItemsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Escaneado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Último Escaneamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const scannedQuantity = item.scanned_at?.length || 0;
              const isItemComplete = scannedQuantity >= item.quantity;
              const lastScan = item.scanned_at?.length 
                ? new Date(item.scanned_at[item.scanned_at.length - 1]).toLocaleString()
                : '-';

              return (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{item.product.unit}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        isItemComplete ? "text-green-600" : "text-red-600"
                      }
                    >
                      {scannedQuantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell>{lastScan}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="mt-6">
          <Button 
            disabled={!isComplete || status === 'completed'} 
            onClick={onComplete}
          >
            Finalizar Romaneio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
