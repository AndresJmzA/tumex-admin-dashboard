
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ActiveNegotiations = () => {
  const negociaciones = [{
    idOrden: "#ORD-2024-001",
    paquete: "Paquete Cirugía General Completo",
    cliente: "Hospital Metropolitano",
    ofertaOriginal: "$12,500 MXN/mes",
    contraoferta: "$10,800 MXN/mes",
    tiempo: "Hace 2 horas",
    estado: "reciente",
    tagEstado: "Pendiente 1ra Aprobación",
    tagColor: "bg-blue-50 text-blue-700 border-blue-200"
  }, {
    idOrden: "#ORD-2024-002",
    paquete: "Paquete Laparoscopía Premium",
    cliente: "Clínica del Valle",
    ofertaOriginal: "$18,000 MXN/mes",
    contraoferta: "$16,200 MXN/mes",
    tiempo: "Hace 1 día",
    estado: "urgente",
    tagEstado: "1/2 Aprobaciones",
    tagColor: "bg-yellow-50 text-yellow-700 border-yellow-200"
  }, {
    idOrden: "#ORD-2024-003",
    paquete: "Paquete Neurocirugía Avanzado",
    cliente: "Centro Médico Especializado",
    ofertaOriginal: "$25,000 MXN/mes",
    contraoferta: "$22,000 MXN/mes",
    tiempo: "Hace 3 días",
    estado: "critico",
    tagEstado: "Pendiente 2da Aprobación",
    tagColor: "bg-red-50 text-red-700 border-red-200"
  }];

  return (
    <Card className="p-6 tumex-card-radius bg-white h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Ordenes Pendientes de Aprobación</h2>
      </div>
      
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {negociaciones.map((negociacion, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-tumex-button space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-600">{negociacion.idOrden}</span>
                  <Badge className={`tumex-button-radius text-xs font-medium ${negociacion.estado === 'critico' ? 'bg-red-50 text-red-700 border-red-200 border' : negociacion.estado === 'urgente' ? 'bg-orange-50 text-orange-700 border-orange-200 border' : 'bg-green-50 text-green-700 border-green-200 border'}`}>
                    {negociacion.tiempo}
                  </Badge>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{negociacion.paquete}</p>
                  <p className="text-xs text-gray-500">{negociacion.cliente}</p>
                </div>
                <Badge className={`tumex-button-radius text-xs font-medium border ${negociacion.tagColor}`}>
                  {negociacion.tagEstado}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-4">
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button size="sm" className="tumex-button-radius bg-green-600 hover:bg-green-700 text-white">
                  Aceptar
                </Button>
                <Button size="sm" variant="outline" className="tumex-button-radius border-red-200 text-red-600 hover:bg-red-50">
                  Rechazar
                </Button>
                <Button size="sm" variant="ghost" className="tumex-button-radius text-gray-500 hover:bg-gray-100">Ver Detalles</Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <Button variant="outline" className="w-full mt-4 tumex-button-radius border-gray-200 hover:bg-gray-50">Ver Todas</Button>
    </Card>
  );
};

export default ActiveNegotiations;
