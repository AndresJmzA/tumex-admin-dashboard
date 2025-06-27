
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

      {/* Nueva Sección: Órdenes en Curso y Solicitudes de Servicio lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="min-h-[400px] lg:h-[500px]">
          <OrdersInProgress />
        </div>
        <div className="min-h-[400px] lg:h-[500px]">
          <CustomerServiceRequests />
        </div>
      </div>

      {/* Sección de Negociaciones Activas - mantener exactamente igual */}
      <div className="min-h-[400px] lg:h-[600px]">
        <ActiveNegotiations />
      </div>

      {/* Calendario expandido a todo el ancho */}
      <div className="min-h-[400px] lg:h-[600px]">
        <CalendarWithTasks />
      </div>
    </div>
  );
};

export default Dashboard;
