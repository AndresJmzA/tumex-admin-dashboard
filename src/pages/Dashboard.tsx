
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle, MessageSquare, Phone, Mail } from "lucide-react"

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Sección de Bienvenida */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Buenos días!</h1>
        <p className="text-gray-600">Bienvenido de vuelta a tu plataforma de equipos médicos TUMex</p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Órdenes de Renta Activas</p>
              <p className="text-2xl font-bold text-gray-900">18</p>
            </div>
            <div className="bg-tumex-primary-100 p-3 rounded-tumex-button">
              <div className="w-4 h-4 bg-tumex-primary-500 rounded"></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Órdenes Pendientes de Aprobación</p>
              <p className="text-2xl font-bold text-gray-900">7</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-tumex-button">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Paquetes Quirúrgicos Disponibles</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <div className="bg-green-100 p-3 rounded-tumex-button">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Contraoffertas Recibidas</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <div className="bg-red-100 p-3 rounded-tumex-button">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Nuevos Componentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Órdenes Pendientes de Aprobación */}
        <Card className="p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Órdenes Pendientes de Aprobación</h2>
            <Badge variant="secondary" className="tumex-button-radius bg-blue-50 text-blue-700 border-blue-200">
              2 pendientes de aprobación
            </Badge>
          </div>
          <div className="space-y-3">
            {[
              { 
                equipo: "Paquete Laparoscopía Completo", 
                cliente: "Hospital San José", 
                fecha: "Hace 2 horas", 
                aprobacion: "pendiente",
                estado: "Pendiente 1ra Aprobación",
                urgencia: "normal"
              },
              { 
                equipo: "Paquete Cirugía Cardiovascular", 
                cliente: "Clínica Santa María", 
                fecha: "Hace 4 horas", 
                aprobacion: "primera",
                estado: "1/2 Aprobaciones",
                urgencia: "media"
              },
            ].map((orden, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-tumex-button">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{orden.equipo}</p>
                  <p className="text-sm text-gray-500">{orden.cliente}</p>
                  <p className="text-xs text-gray-400">{orden.fecha}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`tumex-button-radius text-xs font-medium ${
                      orden.aprobacion === 'primera' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 border' 
                        : 'bg-blue-50 text-blue-700 border-blue-200 border'
                    }`}
                  >
                    {orden.estado}
                  </Badge>
                  <Button size="sm" className="tumex-button-radius bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprobar
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 tumex-button-radius border-gray-200 hover:bg-gray-50">
            Ver todas las órdenes pendientes
          </Button>
        </Card>

        {/* Negociaciones Activas */}
        <Card className="p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Negociaciones Activas</h2>
            <Badge variant="secondary" className="tumex-button-radius bg-orange-50 text-orange-700 border-orange-200">
              3 negociaciones activas
            </Badge>
          </div>
          <div className="space-y-4">
            {[
              {
                idOrden: "#ORD-2024-001",
                paquete: "Paquete Cirugía General Completo",
                cliente: "Hospital Metropolitano",
                ofertaOriginal: "$12,500 MXN/mes",
                contraoferta: "$10,800 MXN/mes",
                tiempo: "Hace 2 horas",
                estado: "reciente",
                urgencia: "normal"
              },
              {
                idOrden: "#ORD-2024-002", 
                paquete: "Paquete Laparoscopía Premium",
                cliente: "Clínica del Valle",
                ofertaOriginal: "$18,000 MXN/mes",
                contraoferta: "$16,200 MXN/mes",
                tiempo: "Hace 1 día",
                estado: "urgente",
                urgencia: "media"
              },
              {
                idOrden: "#ORD-2024-003",
                paquete: "Paquete Neurocirugía Avanzado", 
                cliente: "Centro Médico Especializado",
                ofertaOriginal: "$25,000 MXN/mes",
                contraoferta: "$22,000 MXN/mes",
                tiempo: "Hace 3 días",
                estado: "critico",
                urgencia: "alta"
              }
            ].map((negociacion, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-tumex-button space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-600">{negociacion.idOrden}</span>
                    <Badge 
                      className={`tumex-button-radius text-xs font-medium ${
                        negociacion.estado === 'critico' 
                          ? 'bg-red-50 text-red-700 border-red-200 border' :
                        negociacion.estado === 'urgente' 
                          ? 'bg-orange-50 text-orange-700 border-orange-200 border' :
                        'bg-green-50 text-green-700 border-green-200 border'
                      }`}
                    >
                      {negociacion.tiempo}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{negociacion.paquete}</p>
                  <p className="text-xs text-gray-500">{negociacion.cliente}</p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-4">
                    <span className="text-gray-500">Original: <span className="font-medium">{negociacion.ofertaOriginal}</span></span>
                    <span className="text-gray-900">Contraoferta: <span className="font-medium text-blue-600">{negociacion.contraoferta}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" className="tumex-button-radius bg-green-600 hover:bg-green-700 text-white">
                    Aceptar
                  </Button>
                  <Button size="sm" variant="outline" className="tumex-button-radius border-red-200 text-red-600 hover:bg-red-50">
                    Rechazar
                  </Button>
                  <Button size="sm" variant="outline" className="tumex-button-radius border-blue-200 text-blue-600 hover:bg-blue-50">
                    Negociar
                  </Button>
                  <Button size="sm" variant="ghost" className="tumex-button-radius text-gray-500 hover:bg-gray-100">
                    Ver Historial
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 tumex-button-radius border-gray-200 hover:bg-gray-50">
            Ver todas las negociaciones
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
