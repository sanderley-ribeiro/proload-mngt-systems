
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProductInfo {
  name: string;
  unit: string;
}

interface Product {
  id: string;
  name: string;
  unit: string;
}

interface Movement {
  id: string;
  type: "input" | "output";
  quantity: number;
  date: string;
  notes: string;
  products: ProductInfo;
}

export default function ProductReport() {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState(
    format(new Date().setHours(0, 0, 0, 0), "yyyy-MM-dd'T'HH:mm")
  );
  const [endDate, setEndDate] = useState(
    format(new Date().setHours(23, 59, 59, 999), "yyyy-MM-dd'T'HH:mm")
  );
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [filter, setFilter] = useState({
    startDate,
    endDate,
    productId: selectedProductId
  });

  // Fetch products for the dropdown
  const { data: products } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, unit")
        .order("name");

      if (error) {
        toast.error("Erro ao carregar produtos");
        throw error;
      }
      
      return data;
    },
  });

  const { data: movements, isLoading } = useQuery<Movement[]>({
    queryKey: ["movements", filter.startDate, filter.endDate, filter.productId],
    queryFn: async () => {
      console.log("Fetching movements with dates:", filter.startDate, filter.endDate);
      
      let query = supabase
        .from("product_movements")
        .select(`
          id,
          type,
          quantity,
          date,
          notes,
          products (
            name,
            unit
          )
        `)
        .gte("date", filter.startDate)
        .lte("date", filter.endDate)
        .order("date", { ascending: false });

      // Add product filter if a product is selected
      if (filter.productId) {
        query = query.eq("product_id", filter.productId);
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Erro ao carregar movimentações");
        throw error;
      }
      
      return data as Movement[];
    },
  });

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'product_movements'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["movements"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleFilter = () => {
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("A data inicial não pode ser maior que a data final");
      return;
    }
    
    setFilter({
      startDate,
      endDate,
      productId: selectedProductId
    });
    
    toast.success("Filtro aplicado com sucesso");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="start_date">Data Inicial</Label>
          <Input
            type="datetime-local"
            id="start_date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="end_date">Data Final</Label>
          <Input
            type="datetime-local"
            id="end_date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="product">Produto</Label>
          <Select
            value={selectedProductId}
            onValueChange={setSelectedProductId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os produtos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os produtos</SelectItem>
              {products?.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} ({product.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={handleFilter}
        className="w-full md:w-auto"
      >
        Filtrar Movimentações
      </Button>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements?.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell>
                  {format(new Date(movement.date), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {movement.products.name} ({movement.products.unit})
                </TableCell>
                <TableCell>
                  {movement.type === "input" ? "Entrada" : "Saída"}
                </TableCell>
                <TableCell>{movement.quantity}</TableCell>
                <TableCell>{movement.notes}</TableCell>
              </TableRow>
            ))}
            {!movements?.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Nenhuma movimentação encontrada no período selecionado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
