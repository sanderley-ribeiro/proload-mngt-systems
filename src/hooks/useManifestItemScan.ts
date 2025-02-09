
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ManifestData, ManifestItem } from "./useManifestData";

export function useManifestItemScan(manifestId: string) {
  const queryClient = useQueryClient();

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, scannedAt }: { itemId: string; scannedAt: string[] }) => {
      const { data, error } = await supabase
        .from("shipping_manifest_items")
        .update({ scanned_at: scannedAt })
        .eq("id", itemId)
        .select();

      if (error) {
        console.error("Error updating item:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manifest", manifestId] });
    },
    onError: (error) => {
      console.error("Error updating item:", error);
      toast.error("Erro ao atualizar item");
    }
  });

  const handleScanItem = (item: ManifestItem) => {
    const currentScans = item.scanned_at || [];
    const scannedCount = currentScans.length;

    if (scannedCount >= item.quantity) {
      toast.error("Quantidade máxima atingida");
      return;
    }

    const newScans = [...currentScans, new Date().toISOString()];
    console.log("Atualizando scans para:", newScans); // Log para debug

    queryClient.setQueryData(["manifest", manifestId], (oldData: ManifestData | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        items: oldData.items.map((i) => {
          if (i.id === item.id) {
            return {
              ...i,
              scanned_at: newScans,
            };
          }
          return i;
        }),
      };
    });

    updateItemMutation.mutate({
      itemId: item.id,
      scannedAt: newScans,
    });

    const newCount = scannedCount + 1;
    toast.success(`${item.product.name}: ${newCount}/${item.quantity} escaneados`);
  };

  return { handleScanItem };
}
