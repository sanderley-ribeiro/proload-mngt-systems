
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { ManifestStatus } from "./ManifestStatus";
import { ManifestActions } from "./ManifestActions";
import { ManifestTableHeader } from "./ManifestTableHeader";
import { useManifests, formatProductList, getTotalQuantity } from "./useManifests";

export default function ManifestList() {
  const { manifests, isLoading, handleDelete, handleDeleteEmptyManifests } = useManifests();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  const hasEmptyManifests = manifests?.some(
    (manifest) => getTotalQuantity(manifest.items) === 0 && manifest.status === 'em aberto'
  );

  // Show all manifests, including finalized ones
  const displayManifests = manifests?.filter(manifest => 
    getTotalQuantity(manifest.items) > 0
  );

  return (
    <div className="space-y-4">
      {hasEmptyManifests && (
        <div className="flex justify-end">
          <Button 
            variant="destructive" 
            onClick={() => handleDeleteEmptyManifests(manifests)}
          >
            Excluir Romaneios Vazios
          </Button>
        </div>
      )}
      <Table>
        <ManifestTableHeader />
        <TableBody>
          {displayManifests?.map((manifest) => (
            <TableRow key={manifest.id}>
              <TableCell>{manifest.number}</TableCell>
              <TableCell>
                {new Date(manifest.created_at).toLocaleString("pt-BR")}
              </TableCell>
              <TableCell>{manifest.driver_name}</TableCell>
              <TableCell>{manifest.client_name}</TableCell>
              <TableCell>{formatProductList(manifest.items)}</TableCell>
              <TableCell>{getTotalQuantity(manifest.items)}</TableCell>
              <TableCell>
                <ManifestStatus status={manifest.status} />
              </TableCell>
              <TableCell>
                <ManifestActions 
                  manifestId={manifest.id}
                  status={manifest.status}
                  onDelete={handleDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
