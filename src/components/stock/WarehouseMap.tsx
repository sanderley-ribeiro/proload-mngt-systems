
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { WarehouseOccupation } from "@/types/warehouse";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function WarehouseMap() {
  const { data: occupations, isLoading } = useQuery<WarehouseOccupation[]>({
    queryKey: ["warehouse-occupation-report"],
    queryFn: async () => {
      console.log("Fetching warehouse occupation data for map...");
      
      const { data, error } = await supabase
        .from("warehouse_occupation_report")
        .select();

      if (error) {
        console.error("Error fetching warehouse occupation data:", error);
        throw error;
      }

      console.log("Warehouse map data received:", data);
      return data?.map(item => ({
        ...item,
        floor: item.floor || "N/A",
      })) || [];
    },
    // Configurações para garantir que os dados sejam atualizados frequentemente
    staleTime: 0, // Dados são sempre considerados obsoletos
    cacheTime: 0, // Não manter em cache 
    refetchOnMount: true, // Refazer a consulta quando o componente for montado
    refetchOnWindowFocus: true, // Refazer a consulta quando a janela obtiver foco
    refetchInterval: 5000, // Refazer a consulta a cada 5 segundos
  });

  if (isLoading) {
    return <div>Carregando mapa do armazém...</div>;
  }

  const floors = ["A", "B", "C"];
  const positionsPerFloor = 20;

  return (
    <div className="space-y-8">
      {floors.map((floor) => (
        <div key={floor} className="space-y-2">
          <h3 className="text-lg font-semibold">Andar {floor}</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: positionsPerFloor }, (_, i) => {
              const position = i + 1;
              const occupation = occupations?.find(
                (o) => o.floor === floor && o.position_number === position
              );

              return (
                <TooltipProvider key={`${floor}-${position}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card
                        className={`p-2 text-center cursor-help
                          ${
                            occupation
                              ? "bg-primary/10 border-primary"
                              : "bg-muted"
                          }`}
                      >
                        <div className="text-sm font-medium">{position}</div>
                        {occupation && (
                          <div className="text-xs truncate mt-1">
                            {occupation.product_name}
                          </div>
                        )}
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      {occupation ? (
                        <div className="text-sm">
                          <p className="font-semibold">{occupation.product_name}</p>
                          <p>Quantidade: {occupation.quantity}</p>
                          <p>
                            Entrada:{" "}
                            {new Date(occupation.entry_date).toLocaleDateString()}
                          </p>
                          <p>Posição: {floor}-{position}</p>
                          {occupation.stored_by && (
                            <p>Responsável: {occupation.stored_by}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">Posição vazia</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
