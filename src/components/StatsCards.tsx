
import { Card } from "@/components/ui/card";

const StatsCards = () => {
  const stats = [
    {
      title: "Órdenes de Renta Activas",
      value: "18",
      bgColor: "bg-tumex-primary-100",
      iconColor: "bg-tumex-primary-500"
    },
    {
      title: "Órdenes Pendientes de Aprobación",
      value: "7",
      bgColor: "bg-yellow-100",
      iconColor: "bg-yellow-500"
    },
    {
      title: "Paquetes Quirúrgicos Disponibles",
      value: "24",
      bgColor: "bg-green-100",
      iconColor: "bg-green-500"
    },
    {
      title: "Contraoffertas Recibidas",
      value: "5",
      bgColor: "bg-red-100",
      iconColor: "bg-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4 sm:p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-tumex-button`}>
              <div className={`w-4 h-4 ${stat.iconColor} rounded`}></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
