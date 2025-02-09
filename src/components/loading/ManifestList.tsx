
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
import { FileText, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
  const { data: manifests, isLoading, refetch } = useQuery({
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

  const handleDelete = async (manifestId: string, status: string) => {
    if (status !== 'em aberto') {
      toast.error("Apenas romaneios em aberto podem ser excluídos");
      return;
    }

    try {
      // First delete the manifest items
      const { error: itemsError } = await supabase
        .from("shipping_manifest_items")
        .delete()
        .eq("manifest_id", manifestId);

      if (itemsError) throw itemsError;

      // Then delete the manifest
      const { error: manifestError } = await supabase
        .from("shipping_manifests")
        .delete()
        .eq("id", manifestId);

      if (manifestError) throw manifestError;

      toast.success("Romaneio excluído com sucesso");
      refetch(); // Refresh the list
    } catch (error) {
      console.error("Error deleting manifest:", error);
      toast.error("Erro ao excluir romaneio");
    }
  };

  const handleDeleteEmptyManifests = async () => {
    if (!manifests) return;

    const emptyManifests = manifests.filter(
      (manifest) => getTotalQuantity(manifest.items) === 0 && manifest.status === 'em aberto'
    );

    if (emptyManifests.length === 0) {
      toast.info("Não há romaneios vazios para excluir");
      return;
    }

    try {
      for (const manifest of emptyManifests) {
        // Delete manifest items first
        const { error: itemsError } = await supabase
          .from("shipping_manifest_items")
          .delete()
          .eq("manifest_id", manifest.id);

        if (itemsError) throw itemsError;

        // Then delete the manifest
        const { error: manifestError } = await supabase
          .from("shipping_manifests")
          .delete()
          .eq("id", manifest.id);

        if (manifestError) throw manifestError;
      }

      toast.success(`${emptyManifests.length} romaneio(s) vazio(s) excluído(s) com sucesso`);
      refetch();
    } catch (error) {
      console.error("Error deleting empty manifests:", error);
      toast.error("Erro ao excluir romaneios vazios");
    }
  };

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

  const hasEmptyManifests = manifests?.some(
    (manifest) => getTotalQuantity(manifest.items) === 0 && manifest.status === 'em aberto'
  );

  // Filter out manifests with zero quantity and finalized status from the display
  const displayManifests = manifests?.filter(manifest => 
    getTotalQuantity(manifest.items) > 0 && manifest.status !== 'finalizado'
  );

  return (
    <div className="space-y-4">
      {hasEmptyManifests && (
        <div className="flex justify-end">
          <Button 
            variant="destructive" 
            onClick={handleDeleteEmptyManifests}
          >
            Excluir Romaneios Vazios
          </Button>
        </div>
      )}
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
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayManifests?.map((manifest) => (
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
              <TableCell className="flex gap-2">
                {manifest.status === "em aberto" && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/loading/${manifest.id}/scan`)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(manifest.id, manifest.status)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
