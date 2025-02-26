
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ManifestItem {
  id: string;
  quantity: number;
  scanned_at: string[] | null;
  product: {
    id: string;
    name: string;
    unit: string;
  };
  warehouse_floor: string | null;
  warehouse_position: number | null;
}

export interface Manifest {
  id: string;
  number: string;
  client_name: string;
  driver_name: string;
  vehicle_plate: string;
  status: string;
  created_at: string;
  items: ManifestItem[];
}

export function useManifestData(manifestId: string | undefined) {
  return useQuery({
    queryKey: ["manifest", manifestId],
    queryFn: async () => {
      if (!manifestId) throw new Error("ID do romaneio não informado");

      const { data, error } = await supabase
        .from("shipping_manifests")
        .select(`
          id,
          number,
          client_name,
          driver_name,
          vehicle_plate,
          status,
          created_at,
          items:shipping_manifest_items(
            id,
            quantity,
            scanned_at,
            warehouse_floor,
            warehouse_position,
            product:products(
              id,
              name,
              unit
            )
          )
        `)
        .eq("id", manifestId)
        .single();

      if (error) throw error;
      return data as Manifest;
    },
    enabled: !!manifestId,
  });
}
