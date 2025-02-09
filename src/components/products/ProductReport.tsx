
import { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface ProductInfo {
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
  const [startDate, setStartDate] = useState(
    format(new Date().setHours(0, 0, 0, 0), "yyyy-MM-dd'T'HH:mm")
  );
  const [endDate, setEndDate] = useState(
    format(new Date().setHours(23, 59, 59, 999), "yyyy-MM-dd'T'HH:mm")
  );

  const { data: movements } = useQuery<Movement[]>({
    queryKey: ["movements", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as Movement[];
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

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
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
