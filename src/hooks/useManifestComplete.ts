
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useManifestComplete(manifestId: string) {
  const navigate = useNavigate();

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

  return { completeManifestMutation };
}
