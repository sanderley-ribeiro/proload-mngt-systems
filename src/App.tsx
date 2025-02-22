
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import AppLayout from "./components/layout/AppLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";
import Production from "./pages/Production";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Loading from "./pages/Loading";
import ManifestScanning from "./pages/ManifestScanning";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/report" element={<Report />} />
              <Route path="/production" element={<Production />} />
              <Route path="/products" element={<Products />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/loading" element={<Loading />} />
              <Route path="/loading/:id/scan" element={<ManifestScanning />} />
              <Route path="/loading/:id/edit" element={<Loading />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
