
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Loading = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Loading Orders</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Loading Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Loading Management Interface Coming Soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Loading;
