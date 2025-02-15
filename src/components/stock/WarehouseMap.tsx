
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { WarehouseOccupation } from "@/types/warehouse";

export function WarehouseMap() {
  const { data: positions, isLoading } = useQuery<WarehouseOccupation[]>({
    queryKey: ["warehouse-occupation-report"],
    queryFn: async () => {
      const { data: positions, error } = await supabase
        .from("warehouse_occupation_report")
        .select("*")
        .order("position_number");

      if (error) throw error;
      return positions;
    },
  });

  if (isLoading) {
    return <div>Carregando mapa do armazém...</div>;
  }

  const floors = ["A", "B", "C"] as const;
  const itemsPerRow = 25;

  return (
    <div className="space-y-8">
      {floors.map((floor) => (
        <div key={floor} className="space-y-4">
          <h3 className="text-lg font-semibold">Andar {floor}</h3>
          <ScrollArea className="h-[200px] border rounded-lg p-4">
            <div className="grid grid-cols-[repeat(25,minmax(0,1fr))] gap-1">
              {Array.from({ length: 500 }).map((_, index) => {
                const positionNumber = floor === "A" 
                  ? index + 1 
                  : floor === "B" 
                    ? index + 501 
                    : index + 1001;
                const position = positions?.find(p => p.position_number === positionNumber && p.floor === floor);
                
                return (
                  <TooltipProvider key={`${floor}-${positionNumber}`}>
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className={cn(
                            "aspect-square rounded-sm text-xs flex items-center justify-center",
                            position
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted",
                          )}
                        >
                          {positionNumber}
                        </div>
                      </TooltipTrigger>
                      {position && (
                        <TooltipContent>
                          <div className="text-sm">
                            <p>Produto: {position.product_name}</p>
                            <p>Quantidade: {position.quantity}</p>
                            <p>Data: {new Date(position.entry_date).toLocaleDateString()}</p>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
