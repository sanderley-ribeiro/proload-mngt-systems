
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/components/layout/AppLayout";
import Products from "@/pages/Products";
import Stock from "@/pages/Stock";
import Loading from "@/pages/Loading";
import Report from "@/pages/Report";
import Production from "@/pages/Production";
import Dashboard from "@/pages/Dashboard";
import ManifestScanning from "@/pages/ManifestScanning";

function App() {
  return (
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
  );
}

export default App;
