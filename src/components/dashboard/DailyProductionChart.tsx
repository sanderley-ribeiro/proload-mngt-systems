
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interface que define a estrutura dos dados de produção
interface DadosProducao {
  data: string;        // Data formatada para exibição
  produto: string;     // Nome do produto
  total: number;       // Quantidade total produzida
}

export const DailyProductionChart = () => {
  // Hook do React Query para buscar os dados de produção
  const { data: dadosProducao, isLoading: carregandoDados } = useQuery({
    queryKey: ["daily-production"],
    queryFn: async () => {
      console.log("Buscando dados de produção...");
      
      // Busca os dados da view de produção diária no Supabase
      const { data, error } = await supabase
        .from("daily_production_view")
        .select(`
          production_date,
          total_production,
          product:products(name)
        `)
        .order('production_date', { ascending: true });

      // Se houver erro na busca, lança o erro
      if (error) {
        console.error("Erro ao buscar dados de produção:", error);
        throw error;
      }

      console.log("Dados brutos de produção:", data);
      
      // Se não houver dados, retorna array vazio
      if (!data || data.length === 0) {
        console.log("Nenhum dado de produção encontrado");
        return [];
      }

      // Cria um mapa de datas únicas para agrupar produções do mesmo dia
      const producaoDiaria = data.reduce((acumulador: Record<string, DadosProducao>, atual: any) => {
        const dataFormatada = format(new Date(atual.production_date), 'dd/MM', { locale: ptBR });
        
        if (!acumulador[dataFormatada]) {
          // Se a data ainda não existe no acumulador, cria um novo registro
          acumulador[dataFormatada] = {
            data: dataFormatada,
            produto: atual.product.name,
            total: Number(atual.total_production)
          };
        } else {
          // Se a data já existe, soma a produção ao total existente
          acumulador[dataFormatada].total += Number(atual.total_production);
        }
        return acumulador;
      }, {});

      // Converte o mapa em array para uso no gráfico
      const dadosFormatados = Object.values(producaoDiaria);
      console.log("Dados de produção formatados:", dadosFormatados);
      return dadosFormatados;
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
            // Exibe mensagem de carregamento enquanto os dados são buscados
            <div className="h-full flex items-center justify-center">
              Carregando dados de produção...
            </div>
          ) : dadosProducao && dadosProducao.length > 0 ? (
            // Renderiza o gráfico quando houver dados
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
                {/* Configuração do tooltip que aparece ao passar o mouse sobre as barras */}
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
                {/* Configuração das barras do gráfico */}
                <Bar 
                  dataKey="total" 
                  fill="#22c55e" 
                  name="Quantidade Produzida"
                  barSize={40}
                >
                  {/* Configuração das labels que aparecem acima e abaixo das barras */}
                  <LabelList 
                    content={({ x, y, value, width, height }) => {
                      const indice = Math.floor(Number(x) / Number(width));
                      const nomeProduto = dadosProducao[indice]?.produto;
                      return (
                        <g>
                          {/* Label com o valor numérico acima da barra */}
                          <text
                            x={Number(x) + Number(width) / 2}
                            y={Number(y) - 10}
                            fill="#374151"
                            textAnchor="middle"
                            fontSize={12}
                          >
                            {value?.toLocaleString()}
                          </text>
                          {/* Label com o nome do produto abaixo da barra */}
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
            // Mensagem quando não houver dados para exibir
            <div className="h-full flex items-center justify-center">
              Nenhum dado de produção encontrado.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
