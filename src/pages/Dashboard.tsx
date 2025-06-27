
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
            <Badge variant="secondary" className="tumex-button-radius">
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
                estado: "Pendiente 1ra Aprobación"
              },
              { 
                equipo: "Paquete Cirugía Cardiovascular", 
                cliente: "Clínica Santa María", 
                fecha: "Hace 4 horas", 
                aprobacion: "primera",
                estado: "1/2 Aprobaciones"
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
                    variant={
                      orden.aprobacion === 'primera' ? 'secondary' : 'outline'
                    }
                    className={`tumex-button-radius text-xs ${
                      orden.aprobacion === 'primera' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {orden.estado}
                  </Badge>
                  <Button size="sm" className="tumex-button-radius">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprobar
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 tumex-button-radius">
            Ver todas las órdenes pendientes
          </Button>
        </Card>

        {/* Negociaciones Activas */}
        <Card className="p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Negociaciones Activas</h2>
            <Badge variant="secondary" className="tumex-button-radius">
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
                      variant={
                        negociacion.estado === 'critico' ? 'destructive' : 
                        negociacion.estado === 'urgente' ? 'secondary' : 
                        'outline'
                      }
                      className={`tumex-button-radius text-xs ${
                        negociacion.estado === 'critico' ? 'bg-red-100 text-red-800 border-red-300' :
                        negociacion.estado === 'urgente' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                        'bg-green-100 text-green-800 border-green-300'
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
                  <Button size="sm" className="tumex-button-radius bg-green-600 hover:bg-green-700">
                    Aceptar
                  </Button>
                  <Button size="sm" variant="outline" className="tumex-button-radius">
                    Rechazar
                  </Button>
                  <Button size="sm" variant="outline" className="tumex-button-radius">
                    Negociar
                  </Button>
                  <Button size="sm" variant="ghost" className="tumex-button-radius text-gray-500">
                    Ver Historial
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 tumex-button-radius">
            Ver todas las negociaciones
          </Button>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card className="p-6 tumex-card-radius bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          {[
            { 
              action: "Nueva orden de paquete quirúrgico recibida", 
              item: "Paquete Cirugía General Completo", 
              status: "en proceso de aprobación", 
              time: "hace 2 horas",
              cliente: "Hospital San José"
            },
            { 
              action: "Primera aprobación completada", 
              item: "Paquete Laparoscopía Estándar", 
              status: "aprobado", 
              time: "hace 4 horas",
              cliente: "Clínica Santa María"
            },
            { 
              action: "Segunda aprobación otorgada", 
              item: "Paquete Cirugía Cardíaca Premium", 
              status: "enviado", 
              time: "hace 6 horas",
              cliente: "Centro Médico Norte"
            },
            { 
              action: "Contraoferta recibida", 
              item: "Paquete Neurocirugía Avanzado", 
              status: "en negociación", 
              time: "hace 1 día",
              cliente: "Hospital Especializado"
            },
            { 
              action: "Negociación finalizada", 
              item: "Paquete Ortopedia Completo", 
              status: "aceptado", 
              time: "hace 1 día",
              cliente: "Clínica del Valle"
            },
            { 
              action: "Orden enviada al cliente", 
              item: "Paquete Cirugía Vascular", 
              status: "finalizado", 
              time: "hace 2 días",
              cliente: "Hospital Metropolitano"
            },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.item}</p>
                <p className="text-xs text-gray-400">{activity.cliente}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={
                    activity.status === 'finalizado' || activity.status === 'aceptado' || activity.status === 'enviado' ? 'default' : 
                    activity.status === 'aprobado' ? 'secondary' :
                    activity.status === 'en negociación' ? 'destructive' :
                    'outline'
                  }
                  className={`tumex-button-radius text-xs ${
                    activity.status === 'finalizado' ? 'bg-green-100 text-green-800 border-green-300' :
                    activity.status === 'aceptado' ? 'bg-green-100 text-green-800 border-green-300' :
                    activity.status === 'enviado' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                    activity.status === 'aprobado' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                    activity.status === 'en negociación' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                    'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                >
                  {activity.status}
                </Badge>
                <span className="text-sm text-gray-400">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Dashboard
