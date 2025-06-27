
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

      {/* Sección Principal con Órdenes en Curso y Negociaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Órdenes en Curso y Solicitudes de Servicio - 3/12 del ancho en desktop */}
        <div className="md:col-span-1 lg:col-span-3 space-y-4 sm:space-y-6 min-h-[400px] lg:h-[600px] flex flex-col">
          <div className="flex-1">
            <OrdersInProgress />
          </div>
          
          <div className="flex-1">
            <CustomerServiceRequests />
          </div>
        </div>

        {/* Negociaciones Activas - 6/12 del ancho en desktop */}
        <div className="md:col-span-2 lg:col-span-6 min-h-[400px] lg:h-[600px] order-3 md:order-2">
          <ActiveNegotiations />
        </div>

        {/* Calendario con Tareas - 3/12 del ancho en desktop */}
        <div className="md:col-span-1 lg:col-span-3 min-h-[400px] lg:h-[600px] order-2 md:order-3">
          <CalendarWithTasks />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
