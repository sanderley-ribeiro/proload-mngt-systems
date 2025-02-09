
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ProductForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      unit: formData.get("unit") as string,
    };

    try {
      const { error } = await supabase.from("products").insert(data);
      if (error) throw error;

      toast({
        title: "Produto cadastrado com sucesso!",
      });
      
      e.currentTarget.reset();
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar produto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome do Produto</Label>
        <Input id="name" name="name" required />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="unit">Unidade de Medida</Label>
        <Input id="unit" name="unit" placeholder="ex: kg, litros, unidades" required />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Cadastrando..." : "Cadastrar Produto"}
      </Button>
    </form>
  );
}
