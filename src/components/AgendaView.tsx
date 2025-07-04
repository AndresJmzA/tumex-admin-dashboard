import React, { useRef, useEffect } from 'react';
import { CalendarEvent } from '@/types/calendar';
import EventCard from './EventCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AgendaViewProps {
  date: Date;
  events: CalendarEvent[];
  users: { id: string; name: string }[];
  onSelectEvent?: (event: CalendarEvent) => void;
}

const hours = Array.from({ length: 12 }, (_, i) => 7 + i); // 7:00 to 18:00

const AgendaView = ({ date, events, users, onSelectEvent }: AgendaViewProps) => {
  // Filtrar eventos del día
  const dayEvents = events.filter(e => new Date(e.date).toDateString() === date.toDateString());
  const isMobile = useIsMobile();

  // Hora actual (usando la fecha del sistema)
  const now = new Date();
  const currentHour = now.getHours();

  // refs para cada hora
  const hourRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Al montar, centrar la hora actual si está visible
  useEffect(() => {
    const idx = hours.findIndex(h => h === currentHour);
    if (idx !== -1 && hourRefs.current[idx]) {
      hourRefs.current[idx]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, []);

  if (isMobile) {
    return (
      <div className="w-full space-y-4 overflow-x-hidden overflow-y-auto max-h-[calc(100vh-200px)]">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-lg p-2 sm:p-4 shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-3 text-sm">{user.name}</h3>
            <div className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
              {hours.map((hour, idx) => {
                const userEvents = dayEvents.filter(e => e.assignedTo === user.id && e.startTime && parseInt(e.startTime.split(':')[0]) === hour);
                const isCurrent = hour === currentHour && date.toDateString() === now.toDateString();
                return (
                  <div
                    key={hour}
                    ref={el => hourRefs.current[idx] = el}
                    className={cn(
                      "flex items-start min-h-[64px] py-4 gap-2 transition-colors",
                      isCurrent && "bg-tumex-primary-100"
                    )}
                  >
                    <div className="w-12 flex-shrink-0 text-xs text-gray-400 text-right pr-1 pt-1">{hour}:00</div>
                    <div className="flex-1">
                      {userEvents.length > 0 ? (
                        userEvents.map(event => (
                          <div key={event.id} className="mb-1 cursor-pointer" onClick={() => onSelectEvent && onSelectEvent(event)}>
                            <EventCard event={event} showActions={false} compact={true} />
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-gray-300 pt-1">Sin eventos</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Layout dinámico de columnas para desktop
  const userColCount = Math.max(users.length, 1);
  const gridTemplate = `80px repeat(${userColCount}, minmax(160px, 1fr))`;

  return (
    <div className="overflow-x-auto w-full overflow-y-auto scroll-smooth">
      <div className="min-w-[900px]">
        {/* Header con horas y personas */}
        <div className="grid sticky top-0 z-10 bg-white border-b border-gray-200 transition-all duration-300 ease-in-out" style={{ gridTemplateColumns: gridTemplate }}>
          {/* Celda vacía en la esquina superior izquierda */}
          <div className="h-12 bg-gray-50 border-r border-gray-200"></div>
          
          {/* Headers de personas */}
          {users.map((user) => (
            <div key={user.id} className="h-12 bg-gray-50 border-r border-gray-200 last:border-r-0 flex items-center justify-center p-2 transition-all duration-300 ease-in-out">
              <div className="text-center">
                <div className="text-xs font-medium text-gray-900 truncate">{user.name}</div>
                <div className="text-[10px] text-gray-500 truncate">{user.role}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Filas por hora */}
        {hours.map(hour => (
          <div key={hour} className="grid border-b border-gray-100 min-h-[60px] transition-all duration-300 ease-in-out" style={{ gridTemplateColumns: gridTemplate }}>
            {/* Hora */}
            <div className="text-xs text-gray-400 flex items-center justify-end pr-2 bg-gray-50">
              {hour}:00
            </div>
            {/* Celdas por usuario */}
            {users.map(user => {
              const userEvents = dayEvents.filter(e => e.assignedTo === user.id && e.startTime && parseInt(e.startTime.split(':')[0]) === hour);
              return (
                <div key={user.id} className="relative px-1 py-1 transition-all duration-300 ease-in-out min-h-[60px]">
                  {userEvents.length > 0 ? (
                    userEvents.map(event => (
                      <div key={event.id} className="mb-1 cursor-pointer" onClick={() => onSelectEvent && onSelectEvent(event)}>
                        <EventCard event={event} showActions={false} />
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-[10px] opacity-50">Sin eventos</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgendaView; 