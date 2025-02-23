
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

      // Create stock output movements for each item
      const stockMovements = data.shipping_manifest_items.map(item => ({
        product_id: item.product_id,
        type: 'output',
        quantity: item.quantity,
        created_by: profile.user.id,
        notes: `Saída por romaneio #${data.number}`
      }));

      // Insert all stock movements
      const { error: movementError } = await supabase
        .from('product_movements')
        .insert(stockMovements);

      if (movementError) {
        console.error("Error creating stock movements:", movementError);
        throw movementError;
      }

      console.log("Manifest finalized successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      // Create a summary message of products that were deducted from stock
      const productSummary = data.shipping_manifest_items
        .map(item => `${item.product.name}: ${item.quantity}`)
        .join(', ');
      
      toast.success(`Romaneio #${data.number} finalizado e estoque atualizado.`, {
        description: `Produtos deduzidos: ${productSummary}`
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["manifests"] });
      queryClient.invalidateQueries({ queryKey: ["manifest", manifestId] });
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] }); // Refresh dashboard stock data
      navigate("/loading");
    },
    onError: (error) => {
      console.error("Error in completeManifestMutation:", error);
      toast.error("Erro ao finalizar romaneio");
    }
  });

  return { completeManifestMutation };
}
