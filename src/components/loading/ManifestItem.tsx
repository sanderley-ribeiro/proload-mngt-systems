
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  unit: string;
  warehouse_floor?: string;
  warehouse_position?: number;
  available_quantity?: number;
}

interface ManifestItemProps {
  index: number;
  item: {
    productId: string;
    quantity: number;
    warehouse_floor?: string;
    warehouse_position?: number;
  };
  products?: Product[];
  onUpdate: (index: number, field: "productId" | "quantity", value: string | number) => void;
  onRemove: (index: number) => void;
}

export default function ManifestItem({ 
  index, 
  item, 
  products, 
  onUpdate, 
  onRemove 
}: ManifestItemProps) {
  const selectedProduct = products?.find(p => p.id === item.productId);
  const position = selectedProduct?.warehouse_floor && selectedProduct?.warehouse_position
    ? `${selectedProduct.warehouse_floor}-${selectedProduct.warehouse_position}`
    : 'Sem posição';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-[1fr,120px,150px,40px]">
          <div className="grid gap-2">
            <Label>Produto</Label>
            <Select
              value={item.productId}
              onValueChange={(value) => onUpdate(index, "productId", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Quantidade</Label>
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => onUpdate(index, "quantity", parseFloat(e.target.value))}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="grid gap-2">
            <Label>Posição</Label>
            <div className="h-10 px-3 py-2 rounded-md border bg-muted text-sm">
              {position}
            </div>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
