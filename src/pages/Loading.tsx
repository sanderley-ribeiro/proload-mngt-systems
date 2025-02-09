
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ManifestForm from "@/components/loading/ManifestForm";

const Loading = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Carregamento</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Criar Romaneio</CardTitle>
        </CardHeader>
        <CardContent>
          <ManifestForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Loading;
