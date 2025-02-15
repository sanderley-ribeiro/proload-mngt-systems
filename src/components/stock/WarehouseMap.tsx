
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
      const { data, error } = await supabase
        .from("warehouse_occupation_report")
        .select("*")
        .order("floor");

      if (error) throw error;
      return data;
    },
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
