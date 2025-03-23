
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

interface DadosProducao {
  data: string;
  produto: string;
  total: number;
}

// Dados fictícios para o gráfico
const mockDadosProducao: DadosProducao[] = [
  { data: "01/03", produto: "Produto A", total: 120 },
  { data: "02/03", produto: "Produto B", total: 85 },
  { data: "03/03", produto: "Produto C", total: 200 },
  { data: "04/03", produto: "Produto D", total: 45 },
  { data: "05/03", produto: "Produto E", total: 150 },
];

export const DailyProductionChart = () => {
  const [dadosProducao, setDadosProducao] = useState<DadosProducao[]>([]);
  const [carregandoDados, setCarregandoDados] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setDadosProducao(mockDadosProducao);
      setCarregandoDados(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
