
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
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  unit: string;
  stock?: number;
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
                    {product.name} ({product.unit}) - Disponível: {product.available_quantity || 0}
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
              onChange={(e) => onUpdate(index, "quantity", parseFloat(e.target.value) || 0)}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="grid gap-2">
            <Label>Posição</Label>
            {item.warehouse_floor && item.warehouse_position ? (
              <Badge className="h-10 flex items-center justify-center">
                {item.warehouse_floor}-{item.warehouse_position}
              </Badge>
            ) : (
              <Badge variant="outline" className="h-10 flex items-center justify-center">
                Não definida
              </Badge>
            )}
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
