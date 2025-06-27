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
  const orders: Order[] = [{
    id: "#ORD-2024-001",
    status: "En Preparación",
    statusColor: "bg-yellow-50 text-yellow-700 border-yellow-200",
    client: "Hospital San José",
    address: "Av. Reforma 123, CDMX"
  }, {
    id: "#ORD-2024-002",
    status: "En Tránsito",
    statusColor: "bg-blue-50 text-blue-700 border-blue-200",
    client: "Clínica Santa María",
    address: "Calle Juárez 456, Guadalajara"
  }, {
    id: "#ORD-2024-003",
    status: "Entregado",
    statusColor: "bg-green-50 text-green-700 border-green-200",
    client: "Centro Médico Especializado",
    address: "Blvd. Díaz Ordaz 789, Monterrey"
  }, {
    id: "#ORD-2024-004",
    status: "Pendiente Retiro",
    statusColor: "bg-orange-50 text-orange-700 border-orange-200",
    client: "Hospital Metropolitano",
    address: "Av. Universidad 321, Puebla"
  }];
  return <Card className="p-6 tumex-card-radius bg-white max-w-sm w-full px-[30px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Órdenes en Curso</h2>
        <Badge variant="secondary" className="tumex-button-radius bg-blue-50 text-blue-700 border-blue-200">
          {orders.length} órdenes activas
        </Badge>
      </div>

      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            {orders.map((order, index) => <CarouselItem key={index}>
                <div className="p-4 bg-gray-50 rounded-tumex-button space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-mono font-semibold text-gray-900">{order.id}</span>
                    <Badge className={`tumex-button-radius text-xs font-medium border ${order.statusColor}`}>
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Cliente</p>
                      <p className="font-medium text-gray-900">{order.client}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="text-sm text-gray-700">{order.address}</p>
                    </div>
                  </div>

                  <Button className="w-full tumex-button-radius bg-tumex-primary-500 hover:bg-tumex-primary-600 text-white">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Orden
                  </Button>
                </div>
              </CarouselItem>)}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
    </Card>;
};
export default OrdersInProgress;