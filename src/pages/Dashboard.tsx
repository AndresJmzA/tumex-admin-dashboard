
import { ChevronLeft, ChevronRight } from "lucide-react";
import OrdersInProgress from "@/components/OrdersInProgress";
import WelcomeSection from "@/components/WelcomeSection";
import StatsCards from "@/components/StatsCards";
import ActiveNegotiations from "@/components/ActiveNegotiations";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Sección de Bienvenida */}
      <WelcomeSection />

      {/* Estadísticas Rápidas */}
      <StatsCards />

      {/* Sección Principal con Órdenes en Curso y Negociaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Órdenes en Curso - 3/12 del ancho con flechas */}
        <div className="lg:col-span-3 relative">
          <div className="relative">
            <OrdersInProgress />
            <div className="absolute -left-4 top-1/2 -translate-y-1/2">
              <ChevronLeft className="h-8 w-8 text-gray-400 hover:text-gray-600 cursor-pointer bg-white rounded-full shadow-md p-1" />
            </div>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2">
              <ChevronRight className="h-8 w-8 text-gray-400 hover:text-gray-600 cursor-pointer bg-white rounded-full shadow-md p-1" />
            </div>
          </div>
        </div>

        {/* Negociaciones Activas - 6/12 del ancho */}
        <div className="lg:col-span-6">
          <ActiveNegotiations />
        </div>

        {/* Espacio restante - 3/12 del ancho */}
        <div className="lg:col-span-3">
          {/* Aquí se puede agregar otro componente en el futuro */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
