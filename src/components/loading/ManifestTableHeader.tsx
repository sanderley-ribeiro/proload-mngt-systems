
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ManifestTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nº</TableHead>
        <TableHead>Data/Hora</TableHead>
        <TableHead>Motorista</TableHead>
        <TableHead>Cliente</TableHead>
        <TableHead>Produtos</TableHead>
        <TableHead>Quantidade Total</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="w-[150px]">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
}
