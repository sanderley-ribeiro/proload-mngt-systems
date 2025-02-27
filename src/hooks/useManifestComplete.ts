
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
      
      // Primeiro, obter os dados do romaneio com os itens antes de finalizar
      const { data: manifestData, error: fetchError } = await supabase
        .from("shipping_manifests")
        .select(`
          id,
          number,
          shipping_manifest_items (
            id,
            quantity,
            product_id,
            warehouse_floor,
            warehouse_position,
            product:products (
              name
            )
          )
        `)
        .eq("id", manifestId)
        .single();

      if (fetchError) {
        console.error("Error fetching manifest data:", fetchError);
        throw fetchError;
      }

      // Atualizar o status do romaneio para finalizado
      const { data, error } = await supabase
        .from("shipping_manifests")
        .update({ status: "finalizado" })
        .eq("id", manifestId)
        .select()
        .single();

      if (error) {
        console.error("Error finalizing manifest:", error);
        throw error;
      }

      console.log("Manifest finalized successfully:", data);
      
      // Obter o usuário logado
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) throw new Error("Usuário não autenticado");
      
      // Para cada item do romaneio, efetuar a saída definitiva do estoque
      for (const item of manifestData.shipping_manifest_items) {
        console.log(`Processando item do romaneio: ${item.product.name}, quantidade: ${item.quantity}, posição: ${item.warehouse_floor}-${item.warehouse_position}`);
        
        try {
          // 1. Atualizar as movimentações de estoque existentes (reservas)
          await supabase
            .from('product_movements')
            .update({
              notes: `Saída para romaneio #${manifestData.number} (finalizado)`
            })
            .eq('product_id', item.product_id)
            .eq('floor', item.warehouse_floor)
            .eq('position_number', item.warehouse_position)
            .eq('notes', 'Reserva para romaneio (em criação)')
            .eq('created_by', profile.user.id);
            
          console.log(`Movimentações de estoque atualizadas para o item ${item.product.name}`);
          
          // 2. Chamar função RPC do banco de dados para atualizar diretamente a quantidade na posição
          // Esta é uma abordagem mais direta e garante que a view warehouse_occupation_report seja atualizada
          const { data: resultRPC, error: errorRPC } = await supabase.rpc(
            'update_warehouse_position_quantity',
            {
              p_product_id: item.product_id,
              p_floor: item.warehouse_floor,
              p_position: item.warehouse_position,
              p_quantity: -item.quantity  // Valor negativo para reduzir o estoque
            }
          );
          
          if (errorRPC) {
            console.error("Erro ao atualizar posição:", errorRPC);
            throw errorRPC;
          }
          
          console.log(`Quantidade atualizada na posição ${item.warehouse_floor}-${item.warehouse_position} para o produto ${item.product.name}`);
        } catch (error) {
          console.error(`Erro ao processar item ${item.product.name}:`, error);
          throw error;
        }
      }
      
      return manifestData;
    },
    onSuccess: (data) => {
      // Create a summary message of products that were in the manifest
      const productSummary = data.shipping_manifest_items
        .map(item => `${item.product.name}: ${item.quantity} (${item.warehouse_floor}-${item.warehouse_position})`)
        .join(', ');
      
      toast.success(`Romaneio #${data.number} finalizado com sucesso`, {
        description: `Produtos no romaneio: ${productSummary}`
      });

      // Invalidar todas as queries relevantes para forçar a atualização dos dados
      queryClient.invalidateQueries({ queryKey: ["manifests"] });
      queryClient.invalidateQueries({ queryKey: ["manifest", manifestId] });
      queryClient.invalidateQueries({ queryKey: ["stock-levels"] }); 
      queryClient.invalidateQueries({ queryKey: ["products-with-stock"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-occupation-report"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-stock-levels"] });
      
      // Aguardar um pouco para garantir que os dados sejam atualizados antes de navegar
      setTimeout(() => {
        navigate("/loading");
      }, 1500);
    },
    onError: (error) => {
      console.error("Error in completeManifestMutation:", error);
      toast.error("Erro ao finalizar romaneio");
    }
  });

  return { completeManifestMutation };
}
