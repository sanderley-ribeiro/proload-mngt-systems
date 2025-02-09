
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface StockData {
  name: string;
  quantidade: number;
}

const Dashboard = () => {
  const { data: stockData, isLoading } = useQuery({
    queryKey: ["stock-levels"],
    queryFn: async () => {
      // Get all products with their current stock levels
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

      // Calculate current stock for each product
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>

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
    </div>
  );
};

export default Dashboard;
