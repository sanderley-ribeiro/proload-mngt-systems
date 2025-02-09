
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StockData {
  name: string;
  quantidade: number;
}

interface ProductionData {
  date: string;
  product: string;
  total: number;
}

const Dashboard = () => {
  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ["stock-levels"],
    queryFn: async () => {
      const { data: products, error } = await supabase
        .from("products")
        .select(`
          name,
          product_movements (
            type,
            quantity
          )
        `);

      if (error) throw error;

      return products.map((product: any) => {
        const stockLevel = product.product_movements?.reduce((acc: number, movement: any) => {
          return movement.type === 'input' 
            ? acc + Number(movement.quantity)
            : acc - Number(movement.quantity);
        }, 0) || 0;

        return {
          name: product.name,
          quantidade: stockLevel
        };
      });
    },
  });

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Estoque Atual</TabsTrigger>
          <TabsTrigger value="production">Produção Diária</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
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
        </TabsContent>

        <TabsContent value="production">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

