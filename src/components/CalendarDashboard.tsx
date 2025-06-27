
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarEvent, CalendarEventType } from '@/types/calendar';
import { CalendarEventComponent } from '@/components/CalendarEvent';
import { Calendar as CalendarIcon, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

// Datos de ejemplo - en una app real vendrían de la API
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Paquete Laparoscopía - Hospital San José',
    date: new Date(2025, 5, 28), // 28 de junio
    type: 'orden-inicio',
    status: 'normal',
    description: 'Inicio de orden de renta',
    orderId: '#ORD-2024-001'
  },
  {
    id: '2',
    title: 'Paquete Cardiovascular - Clínica Santa María',
    date: new Date(2025, 5, 30), // 30 de junio
    type: 'aprobacion-pendiente',
    status: 'urgente',
    description: 'Pendiente segunda aprobación',
    orderId: '#ORD-2024-002'
  },
  {
    id: '3',
    title: 'Negociación Neurocirugía - Centro Médico',
    date: new Date(2025, 6, 2), // 2 de julio
    type: 'negociacion-limite',
    status: 'critico',
    description: 'Fecha límite para respuesta',
    orderId: '#ORD-2024-003'
  },
  {
    id: '4',
    title: 'Fin de renta - Paquete General',
    date: new Date(2025, 6, 5), // 5 de julio
    type: 'orden-fin',
    status: 'normal',
    description: 'Devolución de equipos',
    orderId: '#ORD-2024-004'
  }
];

const eventTypes: CalendarEventType[] = [
  { type: 'orden-inicio', label: 'Inicio de Órdenes', color: 'text-green-700', bgColor: 'bg-green-500' },
  { type: 'orden-fin', label: 'Fin de Órdenes', color: 'text-blue-700', bgColor: 'bg-blue-500' },
  { type: 'negociacion-limite', label: 'Límite Negociación', color: 'text-orange-700', bgColor: 'bg-orange-500' },
  { type: 'aprobacion-pendiente', label: 'Aprobaciones', color: 'text-yellow-700', bgColor: 'bg-yellow-500' },
  { type: 'critico', label: 'Críticos', color: 'text-red-700', bgColor: 'bg-red-500' }
];

export const CalendarDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedFilters, setSelectedFilters] = useState<CalendarEvent['type'][]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const filteredEvents = mockEvents.filter(event => 
    selectedFilters.length === 0 || selectedFilters.includes(event.type)
  );

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const toggleFilter = (type: CalendarEvent['type']) => {
    setSelectedFilters(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getDayContent = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {dayEvents.slice(0, 2).map(event => (
          <CalendarEventComponent key={event.id} event={event} compact />
        ))}
        {dayEvents.length > 2 && (
          <Badge className="w-4 h-4 text-xs bg-gray-200 text-gray-600">
            +{dayEvents.length - 2}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendario Principal */}
      <Card className="lg:col-span-2 p-6 tumex-card-radius bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Calendario de Eventos</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="tumex-button-radius"
              onClick={() => setCurrentMonth(new Date())}
            >
              Hoy
            </Button>
            <Badge variant="secondary" className="tumex-button-radius">
              {filteredEvents.length} eventos
            </Badge>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map(eventType => (
              <Button
                key={eventType.type}
                variant={selectedFilters.includes(eventType.type) ? "default" : "outline"}
                size="sm"
                className={`tumex-button-radius ${
                  selectedFilters.includes(eventType.type) 
                    ? `${eventType.bgColor} hover:${eventType.bgColor}/90` 
                    : ''
                }`}
                onClick={() => toggleFilter(eventType.type)}
              >
                <div className={`w-2 h-2 rounded-full ${eventType.bgColor} mr-2`} />
                {eventType.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Calendario */}
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          locale={es}
          className="rounded-tumex-button border pointer-events-auto"
          components={{
            DayContent: ({ date }) => (
              <div className="w-full">
                <div>{date.getDate()}</div>
                {getDayContent(date)}
              </div>
            ),
          }}
        />
      </Card>

      {/* Panel de Eventos del Día Seleccionado */}
      <Card className="p-6 tumex-card-radius bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedDate ? format(selectedDate, 'EEEE, d MMMM', { locale: es }) : 'Selecciona una fecha'}
          </h3>
          {selectedDateEvents.length > 0 && (
            <Badge variant="secondary" className="tumex-button-radius">
              {selectedDateEvents.length} evento{selectedDateEvents.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {selectedDateEvents.length > 0 ? (
          <div className="space-y-3">
            {selectedDateEvents.map(event => (
              <CalendarEventComponent key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">
              {selectedDate ? 'No hay eventos para esta fecha' : 'Selecciona una fecha para ver eventos'}
            </p>
          </div>
        )}

        {/* Resumen Semanal */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Esta Semana</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {eventTypes.map(eventType => {
              const weekCount = filteredEvents.filter(event => 
                event.type === eventType.type &&
                event.date >= new Date() &&
                event.date <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              ).length;
              
              return weekCount > 0 ? (
                <div key={eventType.type} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${eventType.bgColor}`} />
                  <span className="text-gray-600">{weekCount} {eventType.label.toLowerCase()}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};
