
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
      
      // Apenas atualiza o status do romaneio para finalizado
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

      console.log("Manifest finalized successfully:", data);
      
      // Atualiza as notas das movimentações de saída para refletir o romaneio finalizado
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error("Usuário não autenticado");
      
      // Atualiza as notas das movimentações de estoque para refletir o número do romaneio
      for (const item of data.shipping_manifest_items) {
        await supabase
          .from('product_movements')
          .update({
            notes: `Saída para romaneio #${data.number} (finalizado)`
          })
          .eq('product_id', item.product_id)
          .eq('floor', item.warehouse_floor)
          .eq('position_number', item.warehouse_position)
          .eq('notes', 'Reserva para romaneio (em criação)')
          .is('created_by', profile.user.id);
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Create a summary message of products that were in the manifest
      const productSummary = data.shipping_manifest_items
        .map(item => `${item.product.name}: ${item.quantity} (${item.warehouse_floor}-${item.warehouse_position})`)
        .join(', ');
      
      toast.success(`Romaneio #${data.number} finalizado.`, {
        description: `Produtos no romaneio: ${productSummary}`
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["manifests"] });
      queryClient.invalidateQueries({ queryKey: ["manifest", manifestId] });
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] }); 
      queryClient.invalidateQueries({ queryKey: ["products-with-stock"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-occupation-report"] });
      
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
