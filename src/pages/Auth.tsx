
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/providers/AuthProvider";
import { Navigate } from "react-router-dom";

export default function Auth() {
  const { user } = useAuth();

  // Se o usuário já estiver autenticado, redireciona para o dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Acesse sua Conta
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre com seu email e senha para acessar
          </p>
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
