
import { Badge } from "@/components/ui/badge";

interface ManifestStatusProps {
  status: string;
}

export function ManifestStatus({ status }: ManifestStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "finalizado":
        return "default";
      case "em aberto":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "finalizado":
        return "Finalizado";
      case "em aberto":
        return "Em Aberto";
      default:
        return status;
    }
  };

  return (
    <Badge variant={getStatusColor(status)}>
      {getStatusText(status)}
    </Badge>
  );
}
