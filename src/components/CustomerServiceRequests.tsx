import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye } from "lucide-react";

interface CustomerRequest {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerNumber: string;
  customerPhoto: string;
  status: string;
  statusColor: string;
  issue: string;
  createdAt: string;
}

const CustomerServiceRequests = () => {
  const requests: CustomerRequest[] = [
    {
      id: "1",
      ticketNumber: "#TKT-2024-001",
      customerName: "Dr. María González",
      customerNumber: "#CLI-4521",
      customerPhoto: "",
      status: "Abierto",
      statusColor: "bg-red-100 text-red-800 border-red-300",
      issue: "Problema con equipo de laparoscopía",
      createdAt: "Hace 2 horas"
    },
    {
      id: "2",
      ticketNumber: "#TKT-2024-002",
      customerName: "Dr. Carlos Mendoza",
      customerNumber: "#CLI-3847",
      customerPhoto: "",
      status: "En Proceso",
      statusColor: "bg-yellow-100 text-yellow-800 border-yellow-300",
      issue: "Consulta sobre mantenimiento",
      createdAt: "Hace 4 horas"
    },
    {
      id: "3",
      ticketNumber: "#TKT-2024-003",
      customerName: "Dra. Ana Rodríguez",
      customerNumber: "#CLI-2193",
      customerPhoto: "",
      status: "Resuelto",
      statusColor: "bg-green-100 text-green-800 border-green-300",
      issue: "Solicitud de capacitación",
      createdAt: "Hace 1 día"
    },
    {
      id: "4",
      ticketNumber: "#TKT-2024-004",
      customerName: "Dr. Roberto Silva",
      customerNumber: "#CLI-5678",
      customerPhoto: "",
      status: "Urgente",
      statusColor: "bg-yellow-100 text-yellow-800 border-yellow-300",
      issue: "Falla crítica en quirófano",
      createdAt: "Hace 30 min"
    }
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="p-4 tumex-card-radius bg-white h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Solicitudes Servicio</h2>
        <Badge variant="secondary" className="tumex-button-radius bg-yellow-100 text-yellow-800 border-yellow-300">
          {requests.length} solicitudes
        </Badge>
      </div>

      <div className="relative flex-1 flex items-center">
        <Carousel className="w-full">
          <CarouselContent>
            {requests.map((request, index) => (
              <CarouselItem key={index} className="mx-2">
                <div className="px-6 py-4 bg-gray-50 rounded-tumex-button space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-semibold text-gray-900">{request.ticketNumber}</span>
                    <Badge className={`tumex-button-radius text-xs font-medium border ${request.statusColor}`}>
                      {request.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.customerPhoto} alt={request.customerName} />
                      <AvatarFallback className="bg-tumex-primary-100 text-tumex-primary-700 text-xs font-medium">
                        {getInitials(request.customerName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{request.customerName}</p>
                      <p className="text-xs text-gray-500">{request.customerNumber}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Problema</p>
                      <p className="text-xs text-gray-700 truncate">{request.issue}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400">{request.createdAt}</p>
                    </div>
                  </div>

                  <Button className="w-full tumex-button-radius bg-tumex-primary-500 hover:bg-tumex-primary-600 text-white">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Ticket
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

export default CustomerServiceRequests;
