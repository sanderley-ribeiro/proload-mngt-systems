import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DadosProducao {
  data: string;
  produto: string;
  total: number;
}

export const DailyProductionChart = () => {
  const { data: dadosProducao, isLoading: carregandoDados } = useQuery({
    queryKey: ["daily-production"],
    queryFn: async () => {
      console.log("Using movements data for production chart...");
      
      const { data, error } = await supabase
        .from("all_stock_movements_view")
        .select("*")
        .eq('movement_type', 'input')
        .order('movement_date', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        return [];
      }

      const producaoDiaria = data.reduce((acc: Record<string, any>, atual) => {
        const dataFormatada = format(new Date(atual.movement_date), 'dd/MM', { locale: ptBR });
        
        if (!acc[dataFormatada]) {
          acc[dataFormatada] = {
            data: dataFormatada,
            produto: atual.product_name,
            total: Number(atual.quantity)
          };
        } else {
          acc[dataFormatada].total += Number(atual.quantity);
        }
        return acc;
      }, {});

      return Object.values(producaoDiaria);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produção Diária por Produto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {carregandoDados ? (
            <div className="h-full flex items-center justify-center">
              Carregando dados de produção...
            </div>
          ) : dadosProducao && dadosProducao.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={dadosProducao} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="data"
                  angle={0}
                  interval={0}
                />
                <YAxis />
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border border-gray-200 rounded shadow">
                        <p className="font-medium">{payload[0].payload.produto}</p>
                        <p>Data: {payload[0].payload.data}</p>
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
                      const indice = Math.floor(Number(x) / Number(width));
                      const nomeProduto = dadosProducao[indice]?.produto;
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
                            {nomeProduto}
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
