
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/components/users/UserProfile";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ProfileDialog } from "@/components/users/ProfileDialog";

interface Profile {
  id: string;
  name: string | null;
  is_admin: boolean;
  created_at: string;
  user_permissions: { permission: string }[];
}

export default function Users() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Verificar se o usuário atual é admin
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user?.id)
        .single();
      return data?.is_admin || false;
    },
  });

  // Buscar todos os perfis se for admin
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_permissions (
            permission
          )
        `);
      if (error) throw error;
      return data as Profile[];
    },
    enabled: isAdmin,
  });

  if (checkingAdmin) {
    return <div>Carregando...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingProfile(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {isLoading ? (
        <div>Carregando perfis...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles?.map((profile) => (
            <UserProfile
              key={profile.id}
              profile={profile}
              onEdit={handleEditProfile}
            />
          ))}
        </div>
      )}

      <ProfileDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        profile={editingProfile}
      />
    </div>
  );
}
