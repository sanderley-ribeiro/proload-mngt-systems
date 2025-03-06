
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useManifestComplete(manifestId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const completeManifestMutation = useMutation({
    mutationFn: async () => {
      console.log("Attempting to finalize manifest:", manifestId);
      
      // First, get the manifest data with items and product info
      const { data, error } = await supabase
        .from("shipping_manifests")
        .update({ status: "finalizado" })
        .eq("id", manifestId)
        .select(`
          number,
          shipping_manifest_items (
            quantity,
            product_id,
            warehouse_floor,
            warehouse_position,
            product:products (
              name
            )
          )
        `)
        .single();

      if (error) {
        console.error("Error finalizing manifest:", error);
        throw error;
      }

      // Get user profile for the movement creation
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error("Usuário não autenticado");

      // Como os produtos já foram reservados na criação do romaneio,
      // aqui apenas registramos que o romaneio foi finalizado sem fazer novas movimentações de estoque
      console.log("Manifest finalized successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      // Create a summary message of products that were deducted from stock
      const productSummary = data.shipping_manifest_items
        .map(item => `${item.product.name}: ${item.quantity} (${item.warehouse_floor}-${item.warehouse_position})`)
        .join(', ');
      
      toast.success(`Romaneio #${data.number} finalizado.`, {
        description: `Produtos: ${productSummary}`
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["manifests"] });
      queryClient.invalidateQueries({ queryKey: ["manifest", manifestId] });
      
      // Aguardar um pouco para garantir que os dados sejam atualizados antes de navegar
      setTimeout(() => {
        navigate("/loading");
      }, 1000);
    },
    onError: (error) => {
      console.error("Error in completeManifestMutation:", error);
      toast.error("Erro ao finalizar romaneio");
    }
  });

  return { completeManifestMutation };
}
