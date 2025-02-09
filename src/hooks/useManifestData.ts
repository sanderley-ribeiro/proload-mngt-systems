
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        .single();

      if (manifestError) throw manifestError;

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

      if (itemsError) throw itemsError;

      return {
        ...manifestData,
        items: itemsData,
      } as ManifestData;
    },
  });
}

export type { ManifestData, ManifestItem };
