
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarehouseMap } from "@/components/stock/WarehouseMap";
import { ProductSearch } from "@/components/stock/ProductSearch";
import { StockMovements } from "@/components/stock/StockMovements";
import { AddStockItem } from "@/components/stock/AddStockItem";
import { useIsMobile } from "@/hooks/use-mobile";

const Stock = () => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Controle de Estoque</h1>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="w-full h-auto flex flex-wrap gap-2 md:h-10 md:flex-nowrap">
          <TabsTrigger value="map" className="flex-1">Mapa do Armazém</TabsTrigger>
          <TabsTrigger value="search" className="flex-1">Buscar Produtos</TabsTrigger>
          <TabsTrigger value="movements" className="flex-1">Movimentações</TabsTrigger>
          <TabsTrigger value="add" className="flex-1">Adicionar Item</TabsTrigger>
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
