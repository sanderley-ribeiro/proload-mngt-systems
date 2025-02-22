
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ManifestForm from "@/components/loading/ManifestForm";
import ManifestList from "@/components/loading/ManifestList";

interface ManifestFormProps {
  manifestId?: string;
}

const Loading = () => {
  const { id } = useParams();
  const isEditMode = !!id;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Carregamento</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Editar Romaneio" : "Criar Romaneio"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ManifestForm manifestId={id} />
        </CardContent>
      </Card>

      {!isEditMode && (
        <Card>
          <CardHeader>
            <CardTitle>Romaneios</CardTitle>
          </CardHeader>
          <CardContent>
            <ManifestList />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Loading;
