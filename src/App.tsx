
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import Products from "@/pages/Products";
import Stock from "@/pages/Stock";
import Loading from "@/pages/Loading";
import Report from "@/pages/Report";
import Production from "@/pages/Production";
import Dashboard from "@/pages/Dashboard";
import ManifestScanning from "@/pages/ManifestScanning";

// Criar uma instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="stock" element={<Stock />} />
            <Route path="loading" element={<Loading />} />
            <Route path="production" element={<Production />} />
            <Route path="report" element={<Report />} />
            <Route path="manifest/:id" element={<ManifestScanning />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
