
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarehouseMap } from "@/components/stock/WarehouseMap";
import { ProductSearch } from "@/components/stock/ProductSearch";
import { StockMovements } from "@/components/stock/StockMovements";
import { AddStockItem } from "@/components/stock/AddStockItem";

const Stock = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Controle de Estoque</h1>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map">Mapa do Armazém</TabsTrigger>
          <TabsTrigger value="search">Buscar Produtos</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="add">Adicionar Item</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <WarehouseMap />
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <ProductSearch />
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <StockMovements />
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <AddStockItem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stock;
