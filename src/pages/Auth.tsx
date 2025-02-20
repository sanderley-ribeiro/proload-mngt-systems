
import { AuthForm } from "@/components/auth/AuthForm";
import { UpdateProfile } from "@/components/auth/UpdateProfile";
import { useAuth } from "@/providers/AuthProvider";

export default function Auth() {
  const { user } = useAuth();

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {user ? "Atualize seu Perfil" : "Acesse sua Conta"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user
              ? "Insira seu nome para identificação nas movimentações"
              : "Entre com seu email e senha para acessar"}
          </p>
        </div>

        {user ? <UpdateProfile /> : <AuthForm />}
      </div>
    </div>
  );
}
