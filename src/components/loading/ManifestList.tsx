
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
}

export default function ManifestList() {
  const navigate = useNavigate();
  const { data: manifests, isLoading } = useQuery({
    queryKey: ["manifests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping_manifests")
        .select("*")
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
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Finalizado";
      case "pending":
        return "Em Aberto";
      default:
        return status;
    }
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
              <TableCell>
                <Badge variant={getStatusColor(manifest.status)}>
                  {getStatusText(manifest.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {manifest.status === "pending" && (
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
