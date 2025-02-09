
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Products = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Interface de Gerenciamento de Produtos Em Breve
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
