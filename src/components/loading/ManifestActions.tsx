
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileEdit, Scan, Trash2 } from "lucide-react";

interface ManifestActionsProps {
  manifestId: string;
  status: string;
  onDelete: (manifestId: string, status: string) => void;
}

export function ManifestActions({ manifestId, status, onDelete }: ManifestActionsProps) {
  const isFinalized = status === "finalizado";

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={isFinalized}
      >
        <Link to={`/loading/${manifestId}/scan`}>
          <Scan className="h-4 w-4" />
        </Link>
      </Button>

      <Button
        variant="outline"
        size="icon"
        asChild
        disabled={isFinalized}
      >
        <Link to={`/loading/${manifestId}/edit`}>
          <FileEdit className="h-4 w-4" />
        </Link>
      </Button>

      <Button
        variant="outline"
        size="icon"
        disabled={isFinalized}
        onClick={() => onDelete(manifestId, status)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
