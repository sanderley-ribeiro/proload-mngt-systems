
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ManifestActionsProps {
  manifestId: string;
  status: string;
  onDelete: (manifestId: string, status: string) => void;
}

export function ManifestActions({ manifestId, status, onDelete }: ManifestActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/loading/${manifestId}/scan`)}
      >
        <FileText className="h-4 w-4 mr-1" />
        Acessar
      </Button>
      
      {status === "em aberto" && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/loading/${manifestId}/edit`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(manifestId, status)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </>
      )}
    </div>
  );
}
