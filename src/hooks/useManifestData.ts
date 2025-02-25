
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ManifestItem {
  id: string;
  product_id: string;
  quantity: number;
  scanned_at: string[] | null;
  warehouse_floor: string | null;
  warehouse_position: number | null;
  product: {
    name: string;
    unit: string;
  };
}

interface ManifestData {
  id: string;
  number: string;
  client_name: string;
  driver_name: string;
  vehicle_plate: string;
  items: ManifestItem[];
  status: string;
}

export function useManifestData(manifestId: string) {
  const navigate = useNavigate();

  return useQuery({
    queryKey: ["manifest", manifestId],
    queryFn: async () => {
      // Validate manifest ID format before making the request
      if (!manifestId || manifestId.length !== 36) {
        console.error("Invalid manifest ID format:", manifestId);
        toast.error("ID do romaneio inválido");
        navigate("/loading");
        throw new Error("ID do romaneio inválido");
      }

      try {
        // Get manifest data with items including warehouse position information
        const { data: manifestData, error: manifestError } = await supabase
          .from("shipping_manifests")
          .select(`
            id,
            number,
            client_name,
            driver_name,
            vehicle_plate,
            status,
            items:shipping_manifest_items(
              id,
              product_id,
              quantity,
              scanned_at,
              warehouse_floor,
              warehouse_position,
              product:products(
                name,
                unit
              )
            )
          `)
          .eq("id", manifestId)
          .single();

        if (manifestError) {
          console.error("Erro ao buscar romaneio:", manifestError);
          toast.error("Erro ao buscar romaneio");
          navigate("/loading");
          throw manifestError;
        }

        if (!manifestData) {
          console.error("Romaneio não encontrado:", manifestId);
          toast.error("Romaneio não encontrado");
          navigate("/loading");
          throw new Error("Romaneio não encontrado");
        }

        return manifestData as ManifestData;
      } catch (error) {
        console.error("Erro ao processar requisição:", error);
        toast.error("Erro ao buscar dados do romaneio");
        navigate("/loading");
        throw error;
      }
    },
    retry: false,
    retryOnMount: false,
  });
}

export type { ManifestData, ManifestItem };
