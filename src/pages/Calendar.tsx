
import { CompactCalendar } from "@/components/CompactCalendar"

const Calendar = () => {
  return (
    <div className="space-y-6">
      {/* Sección de Bienvenida */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendario de Eventos</h1>
        <p className="text-gray-600">Gestiona y visualiza todos los eventos importantes de tu plataforma médica</p>
      </div>

      {/* Calendario Compacto */}
      <CompactCalendar />
    </div>
  )
}

export default Calendar
