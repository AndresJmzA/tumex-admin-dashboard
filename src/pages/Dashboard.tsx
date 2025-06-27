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

      {/* Grid principal para laptop+ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Columna 1: OrdersInProgress + CustomerServiceRequests */}
        <div className="lg:col-span-3 flex flex-col gap-4 max-lg:mb-0">
          <div className="lg:max-h-[600px] lg:overflow-y-auto">
            <OrdersInProgress />
          </div>
          <div className="lg:max-h-[600px] lg:overflow-y-auto">
            <CustomerServiceRequests />
          </div>
        </div>
        {/* Columna 2: OrdersPendingApproval (ActiveNegotiations) */}
        <div className="lg:col-span-6 lg:max-h-[600px] lg:overflow-y-auto flex flex-col">
          <ActiveNegotiations />
        </div>
        {/* Columna 3: CalendarWithTasks */}
        <div className="lg:col-span-3 lg:max-h-[600px] lg:overflow-y-auto flex flex-col">
          <CalendarWithTasks />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
