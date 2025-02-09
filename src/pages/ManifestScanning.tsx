
import { useParams } from "react-router-dom";
import { ManifestHeader } from "@/components/scanning/ManifestHeader";
import { ManifestItemsTable } from "@/components/scanning/ManifestItemsTable";
import { useManifestScanning } from "@/hooks/useManifestScanning";

export default function ManifestScanning() {
  const { id } = useParams();
  const { manifest, isLoading, isComplete, handleComplete } = useManifestScanning(id!);

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
      />

      <ManifestItemsTable 
        items={manifest.items}
        isComplete={isComplete}
        status={manifest.status}
        onComplete={handleComplete}
      />
    </div>
  );
}
