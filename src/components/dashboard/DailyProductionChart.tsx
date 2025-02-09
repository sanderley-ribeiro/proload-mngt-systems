
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
      const { data, error } = await supabase
        .from("daily_production_view")
        .select(`
          production_date,
          total_production,
          product:products(name)
        `)
        .order('production_date', { ascending: false })
        .limit(2);

      if (error) throw error;

      return data.map((item: any) => ({
        date: format(new Date(item.production_date), 'dd/MM', { locale: ptBR }),
        product: item.product.name,
        total: Number(item.total_production)
      }));
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
