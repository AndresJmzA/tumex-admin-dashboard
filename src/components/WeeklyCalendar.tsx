
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const WeeklyCalendar = ({ selectedDate, onSelectDate }: WeeklyCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(selectedDate);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start week on Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="space-y-3">
      {/* Header con fecha actual */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {isToday(selectedDate) ? 'Hoy' : format(selectedDate, 'EEEE', { locale: es })}
          </p>
          <p className="text-xs text-gray-500">
            {format(selectedDate, "dd 'de' MMMM", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="h-6 w-6 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={goToNextWeek}
            className="h-6 w-6 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Vista semanal */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isDayToday = isToday(day);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-md text-xs transition-colors
                ${isSelected 
                  ? 'bg-tumex-primary-500 text-white' 
                  : isDayToday 
                    ? 'bg-tumex-primary-100 text-tumex-primary-800 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }
              `}
            >
              <span className="text-xs font-medium mb-1">{dayNames[index]}</span>
              <span className="text-sm">{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
