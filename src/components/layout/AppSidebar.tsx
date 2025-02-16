
import { LayoutDashboard, Package, Factory, Truck, FileText, Box, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const menuItems = [
  {
    title: "Painel",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Produtos",
    path: "/products",
    icon: Package,
  },
  {
    title: "Produção",
    path: "/production",
    icon: Factory,
  },
  {
    title: "Carregamento",
    path: "/loading",
    icon: Truck,
  },
  {
    title: "Estoque",
    path: "/stock",
    icon: Box,
  },
  {
    title: "Relatório",
    path: "/report",
    icon: FileText,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleItemClick = () => {
    if (isMobile) {
      const sidebarButton = document.querySelector('[data-sidebar="trigger"]') as HTMLButtonElement;
      if (sidebarButton) {
        sidebarButton.click();
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Erro ao realizar logout");
    }
  };

  return (
    <Sidebar className="bg-background border-r shadow-lg">
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground">Sistema de Gerenciamento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    className="hover:bg-accent focus:bg-accent"
                  >
                    <Link 
                      to={item.path} 
                      className="flex items-center gap-2 p-2 rounded-md transition-colors duration-200"
                      onClick={handleItemClick}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 hover:bg-accent focus:bg-accent"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
