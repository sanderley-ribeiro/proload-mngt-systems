
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Trash2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserProfileProps {
  profile: any;
  onEdit: (profile: any) => void;
}

export function UserProfile({ profile, onEdit }: UserProfileProps) {
  const queryClient = useQueryClient();

  const deleteProfileMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profile.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Perfil excluído com sucesso");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir perfil: ${error.message}`);
    },
  });

  const permissions = profile.user_permissions?.map((p: any) => p.permission) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{profile.name || "Sem nome"}</span>
          {profile.is_admin && (
            <ShieldCheck className="h-5 w-5 text-blue-500" />
          )}
        </CardTitle>
        <CardDescription>Criado em: {new Date(profile.created_at).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {permissions.map((permission: string) => (
              <Badge key={permission} variant="secondary">
                {permission}
              </Badge>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(profile)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir perfil</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteProfileMutation.mutate()}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
