
import OrdersInProgress from "@/components/OrdersInProgress";
import WelcomeSection from "@/components/WelcomeSection";
import StatsCards from "@/components/StatsCards";
import ActiveNegotiations from "@/components/ActiveNegotiations";
import CalendarWithTasks from "@/components/CalendarWithTasks";
import CustomerServiceRequests from "@/components/CustomerServiceRequests";

const Dashboard = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sección de Bienvenida */}
      <WelcomeSection />

      {/* Estadísticas Rápidas */}
      <StatsCards />

      {/* Sección Principal con Layout Responsivo Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Contenedor para Órdenes en Curso y Solicitudes de Servicio */}
        <div className="md:col-span-1 lg:col-span-3 min-h-[400px] md:min-h-[400px] lg:h-[600px]">
          {/* Layout responsivo: vertical en mobile, horizontal en tablet, vertical en desktop */}
          <div className="flex flex-col md:flex-row lg:flex-col h-full gap-3 sm:gap-4 md:gap-3 lg:gap-6">
            <div className="flex-1 min-w-0">
              <OrdersInProgress />
            </div>
            
            <div className="flex-1 min-w-0">
              <CustomerServiceRequests />
            </div>
          </div>
        </div>

        {/* Negociaciones Activas - 1/2 del ancho en tablet, 6/12 en desktop */}
        <div className="md:col-span-1 lg:col-span-6 min-h-[400px] md:min-h-[400px] lg:h-[600px] order-3 md:order-2">
          <ActiveNegotiations />
        </div>

        {/* Calendario con Tareas - Oculto en tablet, visible en desktop */}
        <div className="hidden lg:block lg:col-span-3 lg:h-[600px] order-2 md:order-3">
          <CalendarWithTasks />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
