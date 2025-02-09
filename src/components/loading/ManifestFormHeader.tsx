
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ManifestFormHeaderProps {
  disabled?: boolean;
}

export default function ManifestFormHeader({ disabled }: ManifestFormHeaderProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="driver_name">Nome do Motorista</Label>
          <Input id="driver_name" name="driver_name" required disabled={disabled} />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="client_name">Nome do Cliente</Label>
          <Input id="client_name" name="client_name" required disabled={disabled} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="vehicle_plate">Placa do Veículo</Label>
          <Input id="vehicle_plate" name="vehicle_plate" required disabled={disabled} />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="number">Número do Romaneio</Label>
          <Input id="number" name="number" required disabled={disabled} />
        </div>
      </div>
    </div>
  );
}
