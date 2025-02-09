
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useManifestScanning(manifestId: string) {
  const [barcode, setBarcode] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: manifest, isLoading } = useQuery({
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

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, scannedAt }: { itemId: string; scannedAt: string[] }) => {
      const { data, error } = await supabase
        .from("shipping_manifest_items")
        .update({ scanned_at: scannedAt })
        .eq("id", itemId)
        .select();

      if (error) throw error;
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

  const completeManifestMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("shipping_manifests")
        .update({ status: "completed" })
        .eq("id", manifestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Romaneio finalizado com sucesso");
      navigate("/loading");
    },
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && barcode) {
        handleBarcodeScan(barcode);
        setBarcode("");
      } else if (e.key.length === 1) {
        setBarcode((prev) => prev + e.key);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [barcode]);

  useEffect(() => {
    if (!manifest) return;

    const allItemsComplete = manifest.items.every((item) => {
      return (item.scanned_at?.length || 0) >= item.quantity;
    });

    setIsComplete(allItemsComplete);
  }, [manifest]);

  const handleBarcodeScan = (scannedBarcode: string) => {
    if (!manifest) return;

    const item = manifest.items.find((item) => item.product_id === scannedBarcode);

    if (!item) {
      toast.error("Produto não encontrado no romaneio");
      return;
    }

    handleScanItem(item.id);
  };

  const handleScanItem = (itemId: string) => {
    if (!manifest) return;

    const item = manifest.items.find((item) => item.id === itemId);
    if (!item) return;

    const currentScans = item.scanned_at || [];
    if (currentScans.length >= item.quantity) {
      toast.error("Quantidade máxima atingida");
      return;
    }

    const newScans = [...currentScans, new Date().toISOString()];
    
    // Optimistically update the UI before making the API call
    queryClient.setQueryData(["manifest", manifestId], (oldData: ManifestData | undefined) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        items: oldData.items.map(i => 
          i.id === itemId 
            ? { ...i, scanned_at: newScans }
            : i
        )
      };
    });

    // Make the API call to update the database
    updateItemMutation.mutate({
      itemId: item.id,
      scannedAt: newScans,
    });

    toast.success(`${item.product.name} adicionado com sucesso`);
  };

  const handleComplete = () => {
    if (!isComplete) {
      toast.error("Todos os produtos precisam ser escaneados antes de finalizar");
      return;
    }
    completeManifestMutation.mutate();
  };

  return {
    manifest,
    isLoading,
    isComplete,
    handleComplete,
    handleScanItem,
  };
}
