
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Catalog from "./pages/Catalog";
import Orders from "./pages/Orders";
import Personal from "./pages/Personal";
import Inventory from "./pages/Inventory";
import Rentals from "./pages/Rentals";
import Requests from "./pages/Requests";
import Finances from "./pages/Finances";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import TechnicianPortal from "./pages/TechnicianPortal";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/calendar" element={
              <ProtectedRoute>
                <Layout>
                  <Calendar />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/catalog" element={
              <ProtectedRoute>
                <Layout>
                  <Catalog />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/orders" element={
              <ProtectedRoute>
                <Layout>
                  <Orders />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/personal" element={
              <ProtectedRoute>
                <Layout>
                  <Personal />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/inventory" element={
              <ProtectedRoute>
                <Layout>
                  <Inventory />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/rentals" element={
              <ProtectedRoute>
                <Layout>
                  <Rentals />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/requests" element={
              <ProtectedRoute>
                <Layout>
                  <Requests />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/finances" element={
              <ProtectedRoute>
                <Layout>
                  <Finances />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Portal de Técnicos (PWA móvil) */}
            <Route path="/technician" element={
              <ProtectedRoute>
                <TechnicianPortal />
              </ProtectedRoute>
            } />
            
            {/* Redirección por defecto */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            
            {/* Ruta catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
