
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockLevelsChart } from "@/components/dashboard/StockLevelsChart";
import { DailyProductionChart } from "@/components/dashboard/DailyProductionChart";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const Dashboard = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-full"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Estoque Atual</TabsTrigger>
          <TabsTrigger value="production">Produção Diária</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <StockLevelsChart />
        </TabsContent>

        <TabsContent value="production">
          <DailyProductionChart />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
