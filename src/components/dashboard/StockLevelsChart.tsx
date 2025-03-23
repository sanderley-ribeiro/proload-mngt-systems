
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";

interface StockData {
  name: string;
  quantidade: number;
}

// Dados fictícios para o gráfico
const mockStockData: StockData[] = [
  { name: "Produto A", quantidade: 120 },
  { name: "Produto B", quantidade: 85 },
  { name: "Produto C", quantidade: 200 },
  { name: "Produto D", quantidade: 45 },
  { name: "Produto E", quantidade: 150 },
];

export const StockLevelsChart = () => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setStockData(mockStockData);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estoque Atual de Produto Acabado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {isLoading ? (
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
}
