
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute - Current session:", session);
  console.log("ProtectedRoute - Current location:", location);

  if (!session) {
    console.log("ProtectedRoute - No session, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
