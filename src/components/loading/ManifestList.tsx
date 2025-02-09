
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ShippingManifest {
  id: string;
  created_at: string;
  driver_name: string;
  client_name: string;
  number: string;
  status: string;
  items: {
    quantity: number;
    product: {
      name: string;
    };
  }[];
}

export default function ManifestList() {
  const navigate = useNavigate();
  const { data: manifests, isLoading } = useQuery({
    queryKey: ["manifests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping_manifests")
        .select(`
          *,
          items:shipping_manifest_items(
            quantity,
            product:products(
              name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ShippingManifest[];
    },
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finalizado":
        return "default";
      case "em aberto":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "finalizado":
        return "Finalizado";
      case "em aberto":
        return "Em Aberto";
      default:
        return status;
    }
  };

  const formatProductList = (items: ShippingManifest["items"]) => {
    return items.map((item) => item.product.name).join(", ");
  };

  const getTotalQuantity = (items: ShippingManifest["items"]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Produtos</TableHead>
            <TableHead>Quantidade Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {manifests?.map((manifest) => (
            <TableRow key={manifest.id}>
              <TableCell>{manifest.number}</TableCell>
              <TableCell>
                {new Date(manifest.created_at).toLocaleString("pt-BR")}
              </TableCell>
              <TableCell>{manifest.driver_name}</TableCell>
              <TableCell>{manifest.client_name}</TableCell>
              <TableCell>{formatProductList(manifest.items)}</TableCell>
              <TableCell>{getTotalQuantity(manifest.items)}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(manifest.status)}>
                  {getStatusText(manifest.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {manifest.status === "em aberto" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/loading/${manifest.id}/scan`)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
