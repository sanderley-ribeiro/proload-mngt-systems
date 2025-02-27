
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface StockData {
  name: string;
  quantidade: number;
}

export const StockLevelsChart = () => {
  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ["warehouse-stock-levels"],
    queryFn: async () => {
      console.log("Fetching warehouse stock levels data...");
      
      // Buscar o estoque agregado do warehouse_occupation_report
      const { data: warehouseData, error } = await supabase
        .from("warehouse_occupation_report")
        .select(`
          product_name,
          quantity
        `);

      if (error) {
        console.error("Error fetching warehouse data:", error);
        throw error;
      }

      console.log("Warehouse data received:", warehouseData);

      // Agrupar quantidades por produto
      const stockByProduct = warehouseData.reduce((acc: { [key: string]: number }, item) => {
        if (!item.product_name) return acc;
        acc[item.product_name] = (acc[item.product_name] || 0) + Number(item.quantity || 0);
        return acc;
      }, {});

      // Converter para o formato esperado pelo gráfico
      const formattedData = Object.entries(stockByProduct).map(([name, quantity]) => ({
        name,
        quantidade: quantity
      }));

      console.log("Formatted stock data:", formattedData);
      return formattedData;
    },
    // Configurações para garantir que os dados sejam atualizados frequentemente
    staleTime: 0, // Dados são sempre considerados obsoletos
    cacheTime: 0, // Não manter em cache
    refetchOnMount: true, // Refazer a consulta quando o componente for montado
    refetchOnWindowFocus: true, // Refazer a consulta quando a janela obtiver foco
    refetchInterval: 5000, // Refazer a consulta a cada 5 segundos
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estoque Atual de Produto Acabado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {stockLoading ? (
            <div className="h-full flex items-center justify-center">
              Carregando dados do estoque...
            </div>
          ) : stockData && stockData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="quantidade" 
                  fill="#4f46e5" 
                  name="Quantidade em Estoque"
                  barSize={40}
                >
                  <LabelList 
                    dataKey="quantidade" 
                    position="top" 
                    fill="#374151"
                    formatter={(value: number) => value.toLocaleString()}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              Nenhum produto encontrado no estoque.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
