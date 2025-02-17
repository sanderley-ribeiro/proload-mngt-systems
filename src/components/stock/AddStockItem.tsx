
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Mock de produtos para demonstração
const mockProducts = [
  { id: "1", name: "Produto 1" },
  { id: "2", name: "Produto 2" },
  { id: "3", name: "Produto 3" },
];

export function AddStockItem() {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddItem = () => {
    setIsLoading(true);
    try {
      // Simulando adição ao estoque
      setTimeout(() => {
        toast.success("Produto adicionado ao estoque com sucesso!");
        setProductId("");
        setQuantity("");
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast.error("Erro ao adicionar produto ao estoque");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Produto</label>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um produto" />
          </SelectTrigger>
          <SelectContent>
            {mockProducts.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Quantidade</label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
        />
      </div>

      <Button 
        onClick={handleAddItem}
        disabled={!productId || !quantity || isLoading}
      >
        {isLoading ? "Adicionando..." : "Adicionar ao Estoque"}
      </Button>
    </div>
  );
}
