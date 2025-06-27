
import { useState } from 'react';
import WeeklyCalendar from "@/components/WeeklyCalendar"

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sección de Bienvenida */}
      <div className="px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Calendario de Eventos</h1>
        <p className="text-sm sm:text-base text-gray-600">Gestiona y visualiza todos los eventos importantes de tu plataforma médica</p>
      </div>

      {/* Calendario Semanal */}
      <div className="bg-white rounded-tumex-card p-4 sm:p-6 shadow-sm border border-gray-100">
        <WeeklyCalendar 
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />
      </div>
    </div>
  )
}

export default Calendar
