
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProductionData {
  date: string;
  product: string;
  total: number;
}

export const DailyProductionChart = () => {
  const { data: productionData, isLoading: productionLoading } = useQuery({
    queryKey: ["daily-production"],
    queryFn: async () => {
      console.log("Fetching production data...");
      
      const { data, error } = await supabase
        .from("daily_production_view")
        .select(`
          production_date,
          total_production,
          product:products(name)
        `)
        .order('production_date', { ascending: true });

      if (error) {
        console.error("Error fetching production data:", error);
        throw error;
      }

      console.log("Raw production data:", data);
      
      // Se não houver dados, retornar array vazio
      if (!data || data.length === 0) {
        console.log("No production data found");
        return [];
      }

      // Criar um mapa de datas únicas para agrupar produções do mesmo dia
      const dailyProduction = data.reduce((acc: any, curr: any) => {
        const date = format(new Date(curr.production_date), 'dd/MM', { locale: ptBR });
        if (!acc[date]) {
          acc[date] = {
            date,
            product: curr.product.name,
            total: Number(curr.total_production)
          };
        } else {
          acc[date].total += Number(curr.total_production);
        }
        return acc;
      }, {});

      const formattedData = Object.values(dailyProduction);
      console.log("Formatted production data:", formattedData);
      return formattedData;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produção Diária por Produto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {productionLoading ? (
            <div className="h-full flex items-center justify-center">
              Carregando dados de produção...
            </div>
          ) : productionData && productionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={productionData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  angle={0}
                  interval={0}
                />
                <YAxis />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border border-gray-200 rounded shadow">
                        <p className="font-medium">{payload[0].payload.product}</p>
                        <p>Data: {payload[0].payload.date}</p>
                        <p>Quantidade: {payload[0].value?.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Bar 
                  dataKey="total" 
                  fill="#22c55e" 
                  name="Quantidade Produzida"
                  barSize={40}
                >
                  <LabelList 
                    content={({ x, y, value, width, height }) => {
                      const index = Math.floor(Number(x) / Number(width));
                      const productName = productionData[index]?.product;
                      return (
                        <g>
                          <text
                            x={Number(x) + Number(width) / 2}
                            y={Number(y) - 10}
                            fill="#374151"
                            textAnchor="middle"
                            fontSize={12}
                          >
                            {value?.toLocaleString()}
                          </text>
                          <text
                            x={Number(x) + Number(width) / 2}
                            y={Number(y) + Number(height) + 15}
                            fill="#374151"
                            textAnchor="middle"
                            fontSize={10}
                          >
                            {productName}
                          </text>
                        </g>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              Nenhum dado de produção encontrado.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
