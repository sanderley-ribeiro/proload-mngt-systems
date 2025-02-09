
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ManifestItem {
  id: string;
  product_id: string;
  quantity: number;
  scanned_at: string[] | null;
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
      const { data: manifestData, error: manifestError } = await supabase
        .from("shipping_manifests")
        .select(`
          id,
          number,
          client_name,
          driver_name,
          vehicle_plate,
          status
        `)
        .eq("id", manifestId)
        .maybeSingle();

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

      const { data: itemsData, error: itemsError } = await supabase
        .from("shipping_manifest_items")
        .select(`
          id,
          product_id,
          quantity,
          scanned_at,
          product:products(
            name,
            unit
          )
        `)
        .eq("manifest_id", manifestId);

      if (itemsError) {
        console.error("Erro ao buscar itens do romaneio:", itemsError);
        toast.error("Erro ao buscar itens do romaneio");
        throw itemsError;
      }

      return {
        ...manifestData,
        items: itemsData,
      } as ManifestData;
    },
  });
}

export type { ManifestData, ManifestItem };
