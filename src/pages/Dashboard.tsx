
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
              3 pendientes de aprobación
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
              { 
                equipo: "Paquete Neurocirugía", 
                cliente: "Centro Médico ABC", 
                fecha: "Hace 1 día", 
                aprobacion: "segunda",
                estado: "2/2 Aprobaciones - Listo para Enviar"
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
                      orden.aprobacion === 'segunda' ? 'default' : 
                      orden.aprobacion === 'primera' ? 'secondary' : 
                      'outline'
                    }
                    className={`tumex-button-radius text-xs ${
                      orden.aprobacion === 'segunda' ? 'bg-green-100 text-green-800 border-green-300' :
                      orden.aprobacion === 'primera' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    {orden.estado}
                  </Badge>
                  <Button 
                    size="sm" 
                    className={`tumex-button-radius ${
                      orden.aprobacion === 'segunda' ? 'bg-green-600 hover:bg-green-700' : ''
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {orden.aprobacion === 'segunda' ? 'Aprobar y Enviar' : 'Aprobar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 tumex-button-radius">
            Ver todas las órdenes pendientes
          </Button>
        </Card>

        {/* Servicio al Cliente */}
        <Card className="p-6 tumex-card-radius bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Servicio al Cliente</h2>
            <Badge variant="secondary" className="tumex-button-radius">
              2 activos
            </Badge>
          </div>
          <div className="space-y-4">
            {/* Tickets Recientes */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Tickets Recientes</h3>
              {[
                { id: "#001", asunto: "Falla en ventilador", estado: "En progreso", tiempo: "Hace 30 min" },
                { id: "#002", asunto: "Consulta de mantenimiento", estado: "Pendiente", tiempo: "Hace 2 horas" },
              ].map((ticket, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-tumex-button">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-600">{ticket.id}</span>
                      <Badge 
                        variant={ticket.estado === 'En progreso' ? 'default' : 'secondary'}
                        className="tumex-button-radius text-xs"
                      >
                        {ticket.estado}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-900">{ticket.asunto}</p>
                    <p className="text-xs text-gray-500">{ticket.tiempo}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Canales de Contacto */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Canales de Contacto</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="tumex-button-radius flex-col h-auto py-3">
                  <Phone className="h-4 w-4 mb-1" />
                  <span className="text-xs">Llamar</span>
                </Button>
                <Button variant="outline" size="sm" className="tumex-button-radius flex-col h-auto py-3">
                  <Mail className="h-4 w-4 mb-1" />
                  <span className="text-xs">Email</span>
                </Button>
                <Button variant="outline" size="sm" className="tumex-button-radius flex-col h-auto py-3">
                  <MessageSquare className="h-4 w-4 mb-1" />
                  <span className="text-xs">Chat</span>
                </Button>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4 tumex-button-radius">
            Abrir Centro de Soporte
          </Button>
        </Card>
      </div>

      {/* Actividad Reciente */}
      <Card className="p-6 tumex-card-radius bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          {[
            { action: "Nueva solicitud de alquiler", item: "Máquina de Ultrasonido XR-200", status: "pendiente", time: "hace 2 horas" },
            { action: "Equipo devuelto", item: "Monitor de Paciente PM-500", status: "devuelto", time: "hace 1 día" },
            { action: "Mantenimiento completado", item: "Ventilador Mecánico VM-300", status: "completado", time: "hace 2 días" },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.item}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={activity.status === 'completado' ? 'default' : activity.status === 'pendiente' ? 'secondary' : 'outline'}
                  className="tumex-button-radius"
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
