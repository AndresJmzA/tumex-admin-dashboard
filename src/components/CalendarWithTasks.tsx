
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import WeeklyCalendar from './WeeklyCalendar';

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
        return 'bg-tumex-primary-500';
      case 'outing':
        return 'bg-yellow-500';
      case 'appointment':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="p-3 sm:p-4 tumex-card-radius bg-white h-full flex flex-col">
      {/* Header del Calendario */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Calendario</h3>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-gray-500" />
        </div>
      </div>

      {/* Calendario Semanal */}
      <div className="mb-4">
        <WeeklyCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      {/* Próximos Eventos - Ahora con más espacio */}
      <div className="flex-1 flex flex-col min-h-0">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Próximos Eventos</h4>
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-2 sm:pr-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-2 sm:gap-3 p-2 rounded-tumex-button hover:bg-gray-50">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`w-2 h-6 sm:h-8 rounded-full ${getTaskColor(task.type)} flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-xs font-medium text-gray-900 truncate">{task.title}</p>
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
                        className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-gray-300 border border-white flex items-center justify-center"
                      >
                        <span className="text-xs font-medium text-gray-600">{attendee}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};

export default CalendarWithTasks;
