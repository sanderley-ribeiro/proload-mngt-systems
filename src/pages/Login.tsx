
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: "E-mail ou senha incorretos. Por favor, verifique suas credenciais.",
          variant: "destructive",
        });
        return;
      }
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: "E-mail ou senha incorretos. Por favor, verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Erro ao fazer cadastro",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Cadastro realizado",
        description: "Verifique seu e-mail para confirmar o cadastro.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer cadastro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <Card className="w-full">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-bold">Sistema de Gerenciamento</CardTitle>
            <CardDescription className="text-base">
              Entre com sua conta ou cadastre-se
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  required
                  disabled={isLoading}
                  className="w-full"
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Senha"
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou
                </span>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  required
                  disabled={isLoading}
                  className="w-full"
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Senha"
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            Sistema de Gerenciamento &copy; {new Date().getFullYear()}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
