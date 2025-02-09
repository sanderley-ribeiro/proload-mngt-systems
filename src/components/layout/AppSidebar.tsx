
import { LayoutDashboard, Package, Factory, Truck, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebarContext,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { useMobile } from "@/hooks/use-mobile";

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
    title: "Relatório",
    path: "/report",
    icon: FileText,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const isMobile = useMobile();
  const { setCollapsed } = useSidebarContext();

  const handleItemClick = () => {
    if (isMobile) {
      setCollapsed(true);
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
