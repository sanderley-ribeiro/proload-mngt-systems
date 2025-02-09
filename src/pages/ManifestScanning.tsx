
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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

interface ManifestItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    name: string;
    unit: string;
  };
  scanned_quantity?: number;
}

interface ManifestData {
  id: string;
  client_name: string;
  driver_name: string;
  items: ManifestItem[];
}

export default function ManifestScanning() {
  const { id } = useParams();
  const [scannedItems, setScannedItems] = useState<Record<string, number>>({});
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
          items:shipping_manifest_items(
            id,
            product_id,
            quantity,
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
      const scannedQuantity = scannedItems[item.product_id] || 0;
      return scannedQuantity >= item.quantity;
    });

    setIsComplete(allItemsComplete);
  }, [scannedItems, manifest]);

  const handleBarcodeScan = (scannedBarcode: string) => {
    if (!manifest) return;

    // In this example, we're using the product_id as the barcode
    // In a real application, you'd need to map barcodes to product IDs
    const item = manifest.items.find((item) => item.product_id === scannedBarcode);

    if (!item) {
      toast.error("Produto não encontrado no romaneio");
      return;
    }

    const currentQuantity = scannedItems[item.product_id] || 0;
    const newQuantity = currentQuantity + 1;

    if (newQuantity > item.quantity) {
      toast.error("Quantidade excede o total do romaneio");
      return;
    }

    setScannedItems((prev) => ({
      ...prev,
      [item.product_id]: newQuantity,
    }));

    toast.success(`${item.product.name} escaneado com sucesso`);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!manifest) {
    return <div>Romaneio não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Escaneamento de Romaneio
      </h1>

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {manifest.items.map((item) => {
                const scannedQuantity = scannedItems[item.product_id] || 0;
                const isItemComplete = scannedQuantity >= item.quantity;

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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="mt-6">
            <Button disabled={!isComplete}>Finalizar Romaneio</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
