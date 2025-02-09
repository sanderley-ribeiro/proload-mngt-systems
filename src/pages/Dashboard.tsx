
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockLevelsChart } from "@/components/dashboard/StockLevelsChart";
import { DailyProductionChart } from "@/components/dashboard/DailyProductionChart";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>

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
