
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

interface ManifestItem {
  id: string;
  product_id: string;
  quantity: number;
  scanned_at: string[];
  product: {
    name: string;
    unit: string;
  };
}

interface ManifestData {
  id: string;
  client_name: string;
  driver_name: string;
  items: ManifestItem[];
  status: string;
}

export default function ManifestScanning() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [barcode, setBarcode] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const { data: manifest, isLoading } = useQuery({
    queryKey: ["manifest", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipping_manifests")
        .select(`
          id,
          client_name,
          driver_name,
          status,
          items:manifest_items(
            id,
            product_id,
            quantity,
            scanned_at,
            product:products(
              name,
              unit
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ManifestData;
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, scannedAt }: { itemId: string; scannedAt: string[] }) => {
      const { error } = await supabase
        .from("manifest_items")
        .update({ scanned_at: scannedAt })
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manifest", id] });
    },
  });

  const completeManifestMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("shipping_manifests")
        .update({ status: "completed" })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Romaneio finalizado com sucesso");
      navigate("/loading");
    },
  });

  // Handle barcode scanner input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && barcode) {
        handleBarcodeScan(barcode);
        setBarcode("");
      } else if (e.key.length === 1) {
        setBarcode((prev) => prev + e.key);
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [barcode]);

  // Check if all items are completely scanned
  useEffect(() => {
    if (!manifest) return;

    const allItemsComplete = manifest.items.every((item) => {
      return (item.scanned_at?.length || 0) >= item.quantity;
    });

    setIsComplete(allItemsComplete);
  }, [manifest]);

  const handleBarcodeScan = (scannedBarcode: string) => {
    if (!manifest) return;

    // In this example, we're using the product_id as the barcode
    const item = manifest.items.find((item) => item.product_id === scannedBarcode);

    if (!item) {
      toast.error("Produto não encontrado no romaneio");
      return;
    }

    const currentScans = item.scanned_at || [];
    if (currentScans.length >= item.quantity) {
      toast.error("Quantidade excede o total do romaneio");
      return;
    }

    const newScans = [...currentScans, new Date().toISOString()];
    updateItemMutation.mutate({
      itemId: item.id,
      scannedAt: newScans,
    });

    toast.success(`${item.product.name} escaneado com sucesso`);
  };

  const handleComplete = () => {
    if (!isComplete) return;
    completeManifestMutation.mutate();
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!manifest) {
    return <div>Romaneio não encontrado</div>;
  }

  return (
    <div className="space-y-6">
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
              <strong>Cliente:</strong> {manifest.client_name}
            </p>
            <p>
              <strong>Motorista:</strong> {manifest.driver_name}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead className="text-right">Escaneado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Último Escaneamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manifest.items.map((item) => {
                const scannedQuantity = item.scanned_at?.length || 0;
                const isItemComplete = scannedQuantity >= item.quantity;
                const lastScan = item.scanned_at?.length 
                  ? new Date(item.scanned_at[item.scanned_at.length - 1]).toLocaleString()
                  : '-';

                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{item.product.unit}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          isItemComplete ? "text-green-600" : "text-red-600"
                        }
                      >
                        {scannedQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>{lastScan}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="mt-6">
            <Button 
              disabled={!isComplete || manifest.status === 'completed'} 
              onClick={handleComplete}
            >
              Finalizar Romaneio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
