
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Production = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Production</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Production Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Production Management Interface Coming Soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Production;
