
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string | null;
  is_admin: boolean;
  user_permissions: { permission: string }[];
}

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: Profile | null;
}

const PERMISSIONS = [
  { value: "dashboard", label: "Dashboard" },
  { value: "stock", label: "Estoque" },
  { value: "products", label: "Produtos" },
  { value: "loading", label: "Romaneios" },
  { value: "reports", label: "Relatórios" },
  { value: "users_admin", label: "Administração de Usuários" },
] as const;

type Permission = typeof PERMISSIONS[number]["value"];

export function ProfileDialog({ open, onOpenChange, profile }: ProfileDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (profile) {
      setSelectedPermissions(
        profile.user_permissions
          .map((p) => p.permission as Permission)
          .filter((p): p is Permission => 
            PERMISSIONS.map(perm => perm.value).includes(p)
          )
      );
    } else {
      setSelectedPermissions([]);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const isAdmin = formData.get("is_admin") === "on";

    try {
      let profileId = profile?.id;

      // Se não for edição, criar novo usuário
      if (!profile) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.get("email") as string,
          password: password,
        });

        if (authError) throw authError;
        profileId = authData.user?.id;
      }

      if (!profileId) throw new Error("ID do perfil não encontrado");

      // Atualizar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: profileId,
          name,
          is_admin: isAdmin,
        });

      if (profileError) throw profileError;

      // Remover permissões antigas
      if (selectedPermissions.length > 0) {
        const { error: deleteError } = await supabase
          .from("user_permissions")
          .delete()
          .eq("profile_id", profileId);

        if (deleteError) throw deleteError;

        // Inserir novas permissões
        const permissionsData = selectedPermissions.map(permission => ({
          profile_id: profileId,
          permission: permission,
        }));

        const { error: insertError } = await supabase
          .from("user_permissions")
          .insert(permissionsData);

        if (insertError) throw insertError;
      }

      toast.success(
        profile ? "Perfil atualizado com sucesso" : "Perfil criado com sucesso"
      );
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {profile ? "Editar Perfil" : "Novo Perfil"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              defaultValue={profile?.name || ""}
              required
            />
          </div>

          {!profile && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
              />
            </div>
          )}

          {!profile && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required={!profile}
                minLength={6}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_admin"
              name="is_admin"
              defaultChecked={profile?.is_admin}
            />
            <Label htmlFor="is_admin">Administrador</Label>
          </div>

          <div className="space-y-2">
            <Label>Permissões</Label>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSIONS.map((permission) => (
                <div key={permission.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission.value}
                    checked={selectedPermissions.includes(permission.value)}
                    onCheckedChange={(checked) => {
                      setSelectedPermissions(
                        checked
                          ? [...selectedPermissions, permission.value]
                          : selectedPermissions.filter((p) => p !== permission.value)
                      );
                    }}
                  />
                  <Label htmlFor={permission.value}>{permission.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
