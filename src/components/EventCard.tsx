import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  DollarSign, 
  Box, 
  Wrench, 
  MessageSquare,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: CalendarEvent;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  onView?: (event: CalendarEvent) => void;
  showActions?: boolean;
  compact?: boolean;
}

const EventCard = ({ event, onEdit, onDelete, onView, showActions = true, compact = false }: EventCardProps) => {
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

  // Función para obtener el color del estado
  const getStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'en-proceso':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completado':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Función para obtener el color de prioridad
  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'critica':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'baja':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Función para obtener el icono del tipo de evento
  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'negociacion':
        return <DollarSign className="h-4 w-4" />;
      case 'orden':
        return <Box className="h-4 w-4" />;
      case 'servicio':
        return <Wrench className="h-4 w-4" />;
      case 'financiero':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
    <Card className={cn(
      "tumex-card-radius bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md hover:scale-[1.02] focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50",
      compact ? "p-2" : "p-2 sm:p-3 md:p-4"
    )}>
      {/* Header con tipo y estado */}
      <div className={cn("flex items-start justify-between", compact ? "mb-1" : "mb-2 sm:mb-3")}>
        <div className="flex items-center gap-2">
          <div className={cn("rounded-tumex-button bg-gray-100", compact ? "p-1" : "p-1 sm:p-1.5")}>
            {getEventIcon(event.type)}
          </div>
          <div>
            <h3 className={cn(
              "font-semibold text-gray-900 line-clamp-1",
              compact ? "text-xs" : "text-xs sm:text-sm md:text-base"
            )}>
              {event.title}
            </h3>
            <div className={cn("flex items-center gap-1 sm:gap-2", compact ? "mt-0.5" : "mt-0.5 sm:mt-1")}>
              <Badge className={`tumex-button-radius text-xs font-medium border ${getEventTypeColor(event.type)}`}>
                {getEventTypeLabel(event.type)}
              </Badge>
              <Badge className={`tumex-button-radius text-xs font-medium border ${getStatusColor(event.status)}`}>
                {event.status}
              </Badge>
            </div>
          </div>
        </div>
        
        <Badge className={`tumex-button-radius text-xs font-medium border ${getPriorityColor(event.priority)}`}>
          {event.priority}
        </Badge>
      </div>

      {/* Información del evento */}
      <div className={cn("space-y-1 sm:space-y-2", compact ? "mb-1" : "mb-2 sm:mb-3")}>
        {/* Fecha y hora */}
        <div className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs text-gray-600">
          <Clock className="h-3 w-3" />
          <span>
            {format(new Date(event.date), 'EEEE, dd MMMM', { locale: es })}
            {event.startTime && ` • ${event.startTime}`}
            {event.endTime && ` - ${event.endTime}`}
          </span>
        </div>

        {/* Ubicación */}
        {event.location && (
          <div className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs text-gray-600">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        )}

        {/* Asistentes */}
        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs text-gray-600">
            <Users className="h-3 w-3" />
            <span>{event.attendees.length} asistentes</span>
          </div>
        )}

        {/* Descripción */}
        {event.description && (
          <div className="text-[11px] sm:text-xs text-gray-700 line-clamp-2">
            {event.description}
          </div>
        )}
      </div>

      {/* Información específica del tipo de evento */}
      {event.type === 'negociacion' && event.orderId && (
        <div className={cn("bg-blue-50 rounded-tumex-button", compact ? "p-1 mb-1" : "p-1 sm:p-2 mb-2 sm:mb-3")}>
          <div className="text-[11px] sm:text-xs text-blue-800">
            <span className="font-medium">Orden:</span> {event.orderId}
          </div>
        </div>
      )}

      {event.type === 'orden' && event.orderId && (
        <div className={cn("bg-tumex-primary-50 rounded-tumex-button", compact ? "p-1 mb-1" : "p-1 sm:p-2 mb-2 sm:mb-3")}>
          <div className="text-[11px] sm:text-xs text-tumex-primary-800">
            <span className="font-medium">Orden:</span> {event.orderId}
          </div>
        </div>
      )}

      {event.type === 'servicio' && event.orderId && (
        <div className={cn("bg-green-50 rounded-tumex-button", compact ? "p-1 mb-1" : "p-1 sm:p-2 mb-2 sm:mb-3")}>
          <div className="text-[11px] sm:text-xs text-green-800">
            <span className="font-medium">Ticket:</span> {event.orderId}
          </div>
        </div>
      )}

      {/* Acciones */}
      {showActions && (
        <div className={cn("flex items-center gap-1 sm:gap-2 border-t border-gray-100", compact ? "pt-1" : "pt-1 sm:pt-2")}>
          {onView && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="tumex-button-radius text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => onView(event)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
          )}
          
          {onEdit && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="tumex-button-radius text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => onEdit(event)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
          )}
          
          {onDelete && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="tumex-button-radius text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(event)}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Eliminar
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default EventCard; 