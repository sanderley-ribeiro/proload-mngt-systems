
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ManifestHeaderProps {
  clientName: string;
  driverName: string;
}

export function ManifestHeader({ clientName, driverName }: ManifestHeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Escaneamento de Romaneio
        </h1>
        <Button variant="outline" onClick={() => navigate("/loading")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Romaneio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <p>
              <strong>Cliente:</strong> {clientName}
            </p>
            <p>
              <strong>Motorista:</strong> {driverName}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
