import React from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarEvent } from '@/types/calendar';

interface MonthCalendarProps {
  monthDate: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
}

const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const MonthCalendar = ({ monthDate, selectedDate, events, onSelectDate }: MonthCalendarProps) => {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  return (
    <div className="w-full">
      {/* Header de días */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((name, idx) => (
          <div key={idx} className="text-center text-xs font-semibold text-gray-500">
            {name}
          </div>
        ))}
      </div>
      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          const isCurrentMonth = isSameMonth(date, monthStart);
          const isSelected = isSameDay(date, selectedDate);
          const dayEvents = getEventsForDay(date);
          return (
            <button
              key={idx}
              onClick={() => onSelectDate(date)}
              className={`aspect-square flex flex-col items-center justify-center rounded-tumex-button text-xs sm:text-sm transition-all duration-200 relative
                ${isSelected ? 'bg-tumex-primary-500 text-white shadow-lg scale-105' :
                  isCurrentMonth ? 'bg-white text-gray-900 hover:bg-tumex-primary-100' : 'bg-gray-50 text-gray-400'}
              `}
            >
              <span className="font-medium mb-1">{format(date, 'd')}</span>
              {/* Indicador de eventos */}
              {dayEvents.length > 0 && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-tumex-primary-500" />
                  {dayEvents.length > 1 && (
                    <span className="text-xs font-medium">
                      {dayEvents.length > 3 ? '3+' : dayEvents.length}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar; 