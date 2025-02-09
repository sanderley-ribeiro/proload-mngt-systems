
import { useParams } from "react-router-dom";
import { ManifestHeader } from "@/components/scanning/ManifestHeader";
import { ManifestItemsTable } from "@/components/scanning/ManifestItemsTable";
import { useManifestScanning } from "@/hooks/useManifestScanning";

export default function ManifestScanning() {
  const { id } = useParams();

  if (!id) {
    return <div>ID do romaneio não fornecido</div>;
  }

  const { 
    manifest, 
    isLoading, 
    isComplete,
    handleComplete,
    handleScanItem
  } = useManifestScanning(id);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!manifest) {
    return <div>Romaneio não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <ManifestHeader 
        clientName={manifest.client_name}
        driverName={manifest.driver_name}
        vehiclePlate={manifest.vehicle_plate}
        manifestNumber={manifest.number}
      />

      <ManifestItemsTable 
        items={manifest.items}
        isComplete={isComplete}
        status={manifest.status}
        onComplete={handleComplete}
        onScanItem={handleScanItem}
      />
    </div>
  );
}
