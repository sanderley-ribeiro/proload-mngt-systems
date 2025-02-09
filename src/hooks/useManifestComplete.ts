
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useManifestComplete(manifestId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const completeManifestMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("shipping_manifests")
        .update({ status: "completed" })
        .eq("id", manifestId)
        .select()
        .maybeSingle(); // Alterado de .single() para .maybeSingle()

      if (error) throw error;
      if (!data) throw new Error("Romaneio não encontrado");
      
      return data;
    },
    onSuccess: () => {
      toast.success("Romaneio finalizado com sucesso");
      // Atualiza o cache do React Query
      queryClient.invalidateQueries({ queryKey: ["manifest", manifestId] });
      navigate("/loading");
    },
    onError: (error) => {
      console.error("Erro ao finalizar romaneio:", error);
      toast.error("Erro ao finalizar romaneio");
    }
  });

  return { completeManifestMutation };
}
