
import { Badge } from "@/components/ui/badge";
import { CalendarEvent } from "@/types/calendar";

interface CalendarEventProps {
  event: CalendarEvent;
  compact?: boolean;
}

export const CalendarEventComponent = ({ event, compact = false }: CalendarEventProps) => {
  const getEventStyles = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'orden-inicio':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'orden-fin':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'negociacion-limite':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'aprobacion-pendiente':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'critico':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getEventLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'orden-inicio':
        return 'Inicio';
      case 'orden-fin':
        return 'Fin';
      case 'negociacion-limite':
        return 'Negociación';
      case 'aprobacion-pendiente':
        return 'Aprobación';
      case 'critico':
        return 'Crítico';
      default:
        return 'Evento';
    }
  };

  if (compact) {
    return (
      <div className={`w-2 h-2 rounded-full ${getEventStyles(event.type).split(' ')[0].replace('bg-', 'bg-').replace('-50', '-500')}`} />
    );
  }

  return (
    <div className={`p-2 rounded-tumex-button border ${getEventStyles(event.type)} mb-1`}>
      <div className="flex items-center justify-between">
        <Badge className={`tumex-button-radius text-xs ${getEventStyles(event.type)}`}>
          {getEventLabel(event.type)}
        </Badge>
        {event.orderId && (
          <span className="text-xs font-mono text-gray-500">{event.orderId}</span>
        )}
      </div>
      <p className="text-sm font-medium mt-1">{event.title}</p>
      {event.description && (
        <p className="text-xs text-gray-600 mt-1">{event.description}</p>
      )}
    </div>
  );
};
