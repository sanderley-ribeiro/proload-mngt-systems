
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
      return data;
    },
    onSuccess: () => {
      toast.success("Romaneio finalizado com sucesso");
      // Invalidate both the manifest list and the specific manifest queries
      queryClient.invalidateQueries({ queryKey: ["manifests"] });
      queryClient.invalidateQueries({ queryKey: ["manifest", manifestId] });
      navigate("/loading");
    },
    onError: (error) => {
      console.error("Error in completeManifestMutation:", error);
      toast.error("Erro ao finalizar romaneio");
    }
  });

  return { completeManifestMutation };
}
