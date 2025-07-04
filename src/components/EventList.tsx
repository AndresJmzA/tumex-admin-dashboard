import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Filter, 
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent } from '@/types/calendar';
import EventCard from './EventCard';

interface EventListProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onAddEvent?: () => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (event: CalendarEvent) => void;
  onViewEvent?: (event: CalendarEvent) => void;
  showActions?: boolean;
}

const EventList = ({ 
  selectedDate, 
  events, 
  onAddEvent, 
  onEditEvent, 
  onDeleteEvent, 
  onViewEvent,
  showActions = true 
}: EventListProps) => {
  const [typeFilter, setTypeFilter] = useState<CalendarEvent['type'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CalendarEvent['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<CalendarEvent['priority'] | 'all'>('all');

  // Filtrar eventos por fecha seleccionada
  const dayEvents = useMemo(() => {
    return events.filter(event => isSameDay(new Date(event.date), selectedDate));
  }, [events, selectedDate]);

  // Aplicar filtros adicionales
  const filteredEvents = useMemo(() => {
    return dayEvents.filter(event => {
      const typeMatch = typeFilter === 'all' || event.type === typeFilter;
      const statusMatch = statusFilter === 'all' || event.status === statusFilter;
      const priorityMatch = priorityFilter === 'all' || event.priority === priorityFilter;
      
      return typeMatch && statusMatch && priorityMatch;
    });
  }, [dayEvents, typeFilter, statusFilter, priorityFilter]);

  // Contar eventos por prioridad
  const priorityCounts = useMemo(() => {
    const counts = { critica: 0, alta: 0, media: 0, baja: 0 };
    dayEvents.forEach(event => {
      counts[event.priority]++;
    });
    return counts;
  }, [dayEvents]);

  // Función para obtener el color del tipo de evento
  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'negociacion':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'orden':
        return 'bg-tumex-primary-100 text-tumex-primary-800 border-tumex-primary-300';
      case 'servicio':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'financiero':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Función para obtener el label del tipo de evento
  const getEventTypeLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'negociacion':
        return 'Negociación';
      case 'orden':
        return 'Orden';
      case 'servicio':
        return 'Servicio';
      case 'financiero':
        return 'Financiero';
      default:
        return 'Evento';
    }
  };

  return (
    <Card className="p-3 sm:p-4 tumex-card-radius bg-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-tumex-primary-500" />
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Eventos del {format(selectedDate, 'EEEE, dd MMMM', { locale: es })}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''} programado{dayEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        {onAddEvent && (
          <Button 
            size="sm" 
            className="tumex-button-radius bg-tumex-primary-500 hover:bg-tumex-primary-600 text-white"
            onClick={onAddEvent}
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        )}
      </div>

      {/* Indicadores de prioridad */}
      {dayEvents.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-tumex-button">
          {priorityCounts.critica > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">{priorityCounts.critica} crítica</span>
            </div>
          )}
          {priorityCounts.alta > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-xs text-gray-600">{priorityCounts.alta} alta</span>
            </div>
          )}
          {priorityCounts.media > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-600">{priorityCounts.media} media</span>
            </div>
          )}
          {priorityCounts.baja > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span className="text-xs text-gray-600">{priorityCounts.baja} baja</span>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      {dayEvents.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">Filtros:</span>
          </div>
          
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as CalendarEvent['type'] | 'all')}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="negociacion">Negociación</SelectItem>
              <SelectItem value="orden">Orden</SelectItem>
              <SelectItem value="servicio">Servicio</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CalendarEvent['status'] | 'all')}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="en-proceso">En Proceso</SelectItem>
              <SelectItem value="completado">Completado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as CalendarEvent['priority'] | 'all')}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="critica">Crítica</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Lista de eventos */}
      <div className="flex-1 min-h-0">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            {dayEvents.length === 0 ? (
              <>
                <Calendar className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 mb-1">No hay eventos programados</p>
                <p className="text-xs text-gray-400">Selecciona otro día o agrega un nuevo evento</p>
              </>
            ) : (
              <>
                <Filter className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 mb-1">No hay eventos que coincidan</p>
                <p className="text-xs text-gray-400">Ajusta los filtros para ver más resultados</p>
              </>
            )}
          </div>
        ) : (
          <ScrollArea className="h-full pr-2">
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={onEditEvent}
                  onDelete={onDeleteEvent}
                  onView={onViewEvent}
                  showActions={showActions}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Footer con resumen */}
      {dayEvents.length > 0 && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-4">
          <div className="text-xs text-gray-500">
            Mostrando {filteredEvents.length} de {dayEvents.length} eventos
          </div>
          
          <div className="flex items-center gap-3">
            {dayEvents.filter(e => e.status === 'pendiente').length > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-yellow-500" />
                <span className="text-xs text-gray-500">
                  {dayEvents.filter(e => e.status === 'pendiente').length} pendiente{dayEvents.filter(e => e.status === 'pendiente').length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {dayEvents.filter(e => e.status === 'completado').length > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs text-gray-500">
                  {dayEvents.filter(e => e.status === 'completado').length} completado{dayEvents.filter(e => e.status === 'completado').length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default EventList; 