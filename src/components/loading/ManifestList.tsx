
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

interface ShippingManifest {
  id: string;
  created_at: string;
  driver_name: string;
  client_name: string;
}

export default function ManifestList() {
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

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {manifests?.map((manifest) => (
            <TableRow key={manifest.id}>
              <TableCell>
                {new Date(manifest.created_at).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell>{manifest.driver_name}</TableCell>
              <TableCell>{manifest.client_name}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <FileText className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
