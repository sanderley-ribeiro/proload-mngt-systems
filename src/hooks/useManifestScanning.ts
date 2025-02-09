
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useBarcodeScan } from "./useBarcodeScan";
import { useManifestData } from "./useManifestData";
import { useManifestItemScan } from "./useManifestItemScan";
import { useManifestComplete } from "./useManifestComplete";

export function useManifestScanning(manifestId: string) {
  const [isComplete, setIsComplete] = useState(false);
  const { data: manifest, isLoading } = useManifestData(manifestId);
  const { handleScanItem } = useManifestItemScan(manifestId);
  const { completeManifestMutation } = useManifestComplete(manifestId);

  const handleBarcodeScan = useCallback((scannedBarcode: string) => {
    if (!manifest) return;

    const item = manifest.items.find((item) => item.product_id === scannedBarcode);

    if (!item) {
      toast.error("Produto não encontrado no romaneio");
      return;
    }

    handleScanItem(item);
  }, [manifest, handleScanItem]);

  useBarcodeScan(handleBarcodeScan);

  useEffect(() => {
    if (!manifest) return;

    const allItemsComplete = manifest.items.every((item) => {
      const scannedCount = item.scanned_at?.length || 0;
      return scannedCount >= item.quantity;
    });

    setIsComplete(allItemsComplete);
  }, [manifest]);

  const handleComplete = useCallback(() => {
    if (!isComplete) {
      toast.error("Todos os produtos precisam ser escaneados antes de finalizar");
      return;
    }
    completeManifestMutation.mutate();
  }, [isComplete, completeManifestMutation]);

  return {
    manifest,
    isLoading,
    isComplete,
    handleComplete,
    handleScanItem: (itemId: string) => {
      if (!manifest) return;
      const item = manifest.items.find((item) => item.id === itemId);
      if (item) handleScanItem(item);
    },
  };
}
