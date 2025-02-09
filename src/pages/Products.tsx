
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductForm from "@/components/products/ProductForm";
import { Package } from "lucide-react";

const Products = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 border-b pb-6">
        <Package className="w-8 h-8 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Produtos
        </h1>
      </div>
      
      <Tabs defaultValue="register" className="space-y-6">
        <TabsList className="w-full sm:w-auto bg-card border">
          <TabsTrigger 
            value="register"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Cadastro de Produtos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="animate-fade-in">
          <Card className="border-2 border-muted bg-gradient-to-b from-card to-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Cadastro de Produtos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Preencha os dados abaixo para cadastrar um novo produto
              </p>
            </CardHeader>
            <CardContent>
              <ProductForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;
