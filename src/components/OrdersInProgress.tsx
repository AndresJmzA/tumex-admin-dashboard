
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Eye } from "lucide-react";

interface Order {
  id: string;
  status: string;
  statusColor: string;
  client: string;
  address: string;
}

const OrdersInProgress = () => {
  const orders: Order[] = [
    {
      id: "#ORD-2024-001",
      status: "En Preparación",
      statusColor: "bg-yellow-100 text-yellow-800 border-yellow-300",
      client: "Hospital San José",
      address: "Av. Reforma 123, CDMX"
    },
    {
      id: "#ORD-2024-002",
      status: "En Tránsito",
      statusColor: "bg-tumex-primary-100 text-tumex-primary-800 border-tumex-primary-300",
      client: "Clínica Santa María",
      address: "Calle Juárez 456, Guadalajara"
    },
    {
      id: "#ORD-2024-003",
      status: "Entregado",
      statusColor: "bg-green-100 text-green-800 border-green-300",
      client: "Centro Médico Especializado",
      address: "Blvd. Díaz Ordaz 789, Monterrey"
    },
    {
      id: "#ORD-2024-004",
      status: "Pendiente Retiro",
      statusColor: "bg-yellow-100 text-yellow-800 border-yellow-300",
      client: "Hospital Metropolitano",
      address: "Av. Universidad 321, Puebla"
    }
  ];

  return (
    <Card className="p-3 sm:p-4 tumex-card-radius bg-white h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900">Órdenes en Curso</h2>
        <Badge variant="secondary" className="tumex-button-radius bg-tumex-primary-100 text-tumex-primary-800 border-tumex-primary-300 text-xs">
          {orders.length}
        </Badge>
      </div>

      <div className="relative flex-1 flex items-center">
        <Carousel className="w-full">
          <CarouselContent className="px-1">
            {orders.map((order, index) => (
              <CarouselItem key={index} className="px-1">
                <div className="px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 rounded-tumex-button space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-gray-900">{order.id}</span>
                    <Badge className={`tumex-button-radius text-xs font-medium border ${order.statusColor}`}>
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Cliente</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-900 leading-tight">{order.client}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">Dirección</p>
                      <p className="text-xs text-gray-700 leading-tight truncate">{order.address}</p>
                    </div>
                  </div>

                  <Button className="w-full tumex-button-radius bg-tumex-primary-500 hover:bg-tumex-primary-600 text-white text-xs py-1.5">
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-1 h-6 w-6 bg-white/80 hover:bg-white border-gray-200" />
          <CarouselNext className="right-1 h-6 w-6 bg-white/80 hover:bg-white border-gray-200" />
        </Carousel>
      </div>
    </Card>
  );
};

export default OrdersInProgress;
