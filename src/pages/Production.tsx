
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductMovement from "@/components/products/ProductMovement";
import { Suspense } from "react";

const Production = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Produção</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Entrada/Saída de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Carregando...</div>}>
            <ProductMovement />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default Production;
