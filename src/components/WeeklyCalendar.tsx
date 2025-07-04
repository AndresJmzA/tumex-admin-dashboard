import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent } from '@/types/calendar';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events?: CalendarEvent[];
  viewMode?: 'week' | 'month';
}

const WeeklyCalendar = ({ selectedDate, onSelectDate, events = [], viewMode = 'week' }: WeeklyCalendarProps) => {
  const [currentView, setCurrentView] = useState(selectedDate);

  const weekStart = startOfWeek(currentView, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentView, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const goToPreviousPeriod = () => {
    if (viewMode === 'week') {
      setCurrentView(subWeeks(currentView, 1));
    } else {
      setCurrentView(subMonths(currentView, 1));
    }
  };

  const goToNextPeriod = () => {
    if (viewMode === 'week') {
      setCurrentView(addWeeks(currentView, 1));
    } else {
      setCurrentView(addMonths(currentView, 1));
    }
  };

  const goToToday = () => {
    setCurrentView(new Date());
    onSelectDate(new Date());
  };

  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Función para contar eventos por día
  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  // Función para obtener el color de prioridad
  const getPriorityColor = (events: CalendarEvent[]) => {
    if (events.some(e => e.priority === 'critica')) return 'bg-red-500';
    if (events.some(e => e.priority === 'alta')) return 'bg-orange-500';
    if (events.some(e => e.priority === 'media')) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-4">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-tumex-primary-500" />
          <div>
            <p className="text-sm sm:text-base font-medium text-gray-900">
              {isToday(selectedDate) ? 'Hoy' : format(selectedDate, 'EEEE', { locale: es })}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {format(selectedDate, "dd 'de' MMMM", { locale: es })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousPeriod}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-tumex-button hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Período anterior"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
          
          <button
            onClick={goToToday}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-tumex-primary-500 text-white rounded-tumex-button hover:bg-tumex-primary-600 transition-colors"
          >
            Hoy
          </button>
          
          <button
            onClick={goToNextPeriod}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-tumex-button hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Período siguiente"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Información del período */}
      <div className="text-center">
        <p className="text-sm sm:text-base font-semibold text-gray-900">
          {format(weekStart, 'dd MMM', { locale: es })} - {format(weekEnd, 'dd MMM yyyy', { locale: es })}
        </p>
      </div>

      {/* Vista semanal */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Headers de días */}
        {dayNames.map((dayName, index) => (
          <div key={index} className="text-center pb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500">{dayName}</span>
          </div>
        ))}
        
        {/* Días del calendario */}
        {weekDays.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isToday(day);
          const dayEvents = getEventsForDay(day);
          const hasEvents = dayEvents.length > 0;
          const priorityColor = hasEvents ? getPriorityColor(dayEvents) : '';
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-tumex-button text-xs sm:text-sm transition-all duration-200 relative
                ${isSelected 
                  ? 'bg-tumex-primary-500 text-white shadow-lg scale-105' 
                  : isDayToday 
                    ? 'bg-tumex-primary-100 text-tumex-primary-800 font-medium border-2 border-tumex-primary-300'
                    : 'hover:bg-gray-100 text-gray-700 border border-transparent hover:border-gray-200'
                }
              `}
            >
              <span className="font-medium mb-1">{format(day, 'd')}</span>
              
              {/* Indicador de eventos */}
              {hasEvents && (
                <div className="flex items-center justify-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${priorityColor}`} />
                  {dayEvents.length > 1 && (
                    <span className="text-xs font-medium">
                      {dayEvents.length > 3 ? '3+' : dayEvents.length}
                    </span>
                  )}
                </div>
              )}
              
              {/* Indicador de eventos múltiples */}
              {dayEvents.length > 3 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">+</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda de eventos */}
      {events.length > 0 && (
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Crítica</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-600">Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Media</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyCalendar;
