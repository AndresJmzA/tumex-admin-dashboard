
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'outing' | 'appointment';
  attendees?: string[];
}

const CalendarWithTasks = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Datos de ejemplo de tareas
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Revisión Equipos Hospital',
      time: '08:00 AM - 09:30 AM',
      type: 'meeting',
      attendees: ['JD', 'AM']
    },
    {
      id: '2',
      title: 'Entrega Paquete Laparoscopía',
      time: '10:15 AM',
      type: 'appointment'
    },
    {
      id: '3',
      title: 'Reunión Negociación',
      time: '11:30 AM - 12:30 PM',
      type: 'meeting',
      attendees: ['CM', 'RF']
    },
    {
      id: '4',
      title: 'Instalación Equipos',
      time: '01:00 PM',
      type: 'outing'
    },
    {
      id: '5',
      title: 'Capacitación Personal',
      time: '03:00 PM - 04:00 PM',
      type: 'meeting',
      attendees: ['AB', 'CD', 'EF']
    }
  ];

  const getTaskColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500';
      case 'outing':
        return 'bg-orange-500';
      case 'appointment':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-4 tumex-card-radius bg-white h-full flex flex-col">
      {/* Header del Calendario */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Calendario</h3>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
        </div>
      </div>

      {/* Calendario Compacto */}
      <div className="mb-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border-0 p-0 w-full"
          classNames={{
            months: "flex w-full",
            month: "space-y-2 w-full",
            caption: "flex justify-center pt-1 relative items-center mb-2",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 rounded",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-xs text-center",
            row: "flex w-full mt-1",
            cell: "flex-1 text-center text-xs p-0 relative aspect-square",
            day: "h-full w-full p-0 font-normal rounded hover:bg-accent hover:text-accent-foreground text-xs",
            day_selected: "bg-tumex-primary-500 text-white hover:bg-tumex-primary-600",
            day_today: "bg-accent text-accent-foreground font-medium",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
          }}
          components={{
            IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
            IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
          }}
        />
      </div>

      {/* Información del día seleccionado */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {isToday(selectedDate) ? 'Hoy' : format(selectedDate, 'EEEE', { locale: es })}
            </span>
            <span className="text-sm font-medium">
              {format(selectedDate, 'MMM dd', { locale: es })}
            </span>
          </div>
        </div>
      </div>

      {/* Próximos Eventos */}
      <div className="flex-1 flex flex-col">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Próximos Eventos</h4>
        <div className="space-y-2 flex-1 overflow-y-auto">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-2 rounded-tumex-button hover:bg-gray-50">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className={`w-2 h-8 rounded-full ${getTaskColor(task.type)} flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 truncate">{task.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{task.time}</span>
                  </div>
                </div>
              </div>
              {task.attendees && (
                <div className="flex -space-x-1 flex-shrink-0">
                  {task.attendees.map((attendee, index) => (
                    <div
                      key={index}
                      className="w-5 h-5 rounded-full bg-gray-300 border border-white flex items-center justify-center"
                    >
                      <span className="text-xs font-medium text-gray-600">{attendee}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CalendarWithTasks;
