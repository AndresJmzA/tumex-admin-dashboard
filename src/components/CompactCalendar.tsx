
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarEvent, CalendarEventType } from '@/types/calendar';
import { CalendarEventComponent } from '@/components/CalendarEvent';
import { Calendar as CalendarIcon, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, addDays, startOfWeek, endOfWeek, isToday, isSameMonth } from 'date-fns';
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

export const CompactCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedFilters, setSelectedFilters] = useState<CalendarEvent['type'][]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));

  const filteredEvents = mockEvents.filter(event => 
    selectedFilters.length === 0 || selectedFilters.includes(event.type)
  );

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, date));
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const toggleFilter = (type: CalendarEvent['type']) => {
    setSelectedFilters(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWeekStart(startOfWeek(today));
    setSelectedDate(today);
  };

  return (
    <Card className="p-6 tumex-card-radius bg-white">
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
            onClick={goToToday}
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

      {/* Navegación de Semana */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-md font-medium text-gray-900">
          {format(currentWeekStart, 'MMMM yyyy', { locale: es })}
        </h3>
        <Button variant="ghost" size="sm" onClick={goToNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Vista de Semana Horizontal */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          
          return (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {format(day, 'EEE', { locale: es })}
              </div>
              <button
                onClick={() => setSelectedDate(day)}
                className={`w-full h-12 rounded-tumex-button text-sm font-medium transition-colors ${
                  isSelected 
                    ? 'bg-tumex-primary-500 text-white' 
                    : isTodayDate 
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {format(day, 'd')}
              </button>
              {/* Indicadores de eventos */}
              {dayEvents.length > 0 && (
                <div className="flex justify-center gap-1 mt-1">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full ${
                        event.type === 'orden-inicio' ? 'bg-green-500' :
                        event.type === 'orden-fin' ? 'bg-blue-500' :
                        event.type === 'negociacion-limite' ? 'bg-orange-500' :
                        event.type === 'aprobacion-pendiente' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Eventos del Día Seleccionado */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-md font-medium text-gray-900">
            {format(selectedDate, 'EEEE, d MMMM', { locale: es })}
          </h4>
          {selectedDateEvents.length > 0 && (
            <Badge variant="secondary" className="tumex-button-radius">
              {selectedDateEvents.length} evento{selectedDateEvents.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {selectedDateEvents.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedDateEvents.map(event => (
              <CalendarEventComponent key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <CalendarIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No hay eventos para esta fecha</p>
          </div>
        )}
      </div>
    </Card>
  );
};
