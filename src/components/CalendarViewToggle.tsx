import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, List as ListIcon } from 'lucide-react';

interface CalendarViewToggleProps {
  view: 'month' | 'agenda';
  onChange: (view: 'month' | 'agenda') => void;
}

const CalendarViewToggle = ({ view, onChange }: CalendarViewToggleProps) => {
  return (
    <div className="flex gap-2 items-center">
      <Button
        variant={view === 'month' ? 'default' : 'outline'}
        className={`tumex-button-radius flex items-center gap-2 ${view === 'month' ? 'bg-tumex-primary-500 text-white' : ''}`}
        onClick={() => onChange('month')}
        aria-pressed={view === 'month'}
      >
        <CalendarIcon className="h-4 w-4" />
        Mes
      </Button>
      <Button
        variant={view === 'agenda' ? 'default' : 'outline'}
        className={`tumex-button-radius flex items-center gap-2 ${view === 'agenda' ? 'bg-tumex-primary-500 text-white' : ''}`}
        onClick={() => onChange('agenda')}
        aria-pressed={view === 'agenda'}
      >
        <ListIcon className="h-4 w-4" />
        Agenda
      </Button>
    </div>
  );
};

export default CalendarViewToggle; 