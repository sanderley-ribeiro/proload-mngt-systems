
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
}

interface ManifestItemProps {
  index: number;
  item: {
    productId: string;
    quantity: number;
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
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-[1fr,120px,40px]">
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
