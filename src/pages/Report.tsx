
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductReport from "@/components/products/ProductReport";

const Report = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Relatório</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Movimentação</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductReport />
        </CardContent>
      </Card>
    </div>
  );
};

export default Report;
