
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ShippingManifest {
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

export function useManifests() {
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
      refetch();
    } catch (error) {
      console.error("Error deleting manifest:", error);
      toast.error("Erro ao excluir romaneio");
    }
  };

  const handleDeleteEmptyManifests = async (manifests: ShippingManifest[]) => {
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

  return {
    manifests,
    isLoading,
    handleDelete,
    handleDeleteEmptyManifests,
  };
}

export const formatProductList = (items: ShippingManifest["items"]) => {
  return items.map((item) => item.product.name).join(", ");
};

export const getTotalQuantity = (items: ShippingManifest["items"]) => {
  return items.reduce((total, item) => total + item.quantity, 0);
};
