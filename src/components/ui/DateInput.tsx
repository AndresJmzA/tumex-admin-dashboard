import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, isValid, parse } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DateInput({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  className = "",
  disabled = false,
  required = false,
  minDate,
  maxDate
}: DateInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>("");

  // Función para convertir fecha de dd/mm/yyyy a Date
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    
    // Intentar parsear formato dd/mm/yyyy
    const parsed = parse(dateString, 'dd/MM/yyyy', new Date());
    return isValid(parsed) ? parsed : null;
  };

  // Función para convertir Date a dd/mm/yyyy
  const formatDate = (date: Date): string => {
    return format(date, 'dd/MM/yyyy');
  };

  // Función para validar formato de entrada
  const validateInput = (input: string): boolean => {
    if (!input) return true; // Permitir campo vacío
    
    // Validar formato dd/mm/yyyy
    const regex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(input)) {
      setError("Formato inválido. Use dd/mm/yyyy");
      return false;
    }

    const parsedDate = parseDate(input);
    if (!parsedDate) {
      setError("Fecha inválida");
      return false;
    }

    // Validar fecha mínima
    if (minDate && parsedDate < minDate) {
      setError(`La fecha debe ser posterior a ${formatDate(minDate)}`);
      return false;
    }

    // Validar fecha máxima
    if (maxDate && parsedDate > maxDate) {
      setError(`La fecha debe ser anterior a ${formatDate(maxDate)}`);
      return false;
    }

    setError("");
    return true;
  };

  // Manejar cambio en el input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (validateInput(newValue)) {
      const parsedDate = parseDate(newValue);
      if (parsedDate) {
        // Convertir a formato ISO para el valor interno
        const isoDate = format(parsedDate, 'yyyy-MM-dd');
        onChange(isoDate);
      } else {
        onChange("");
      }
    }
  };

  // Manejar selección desde el calendario
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const formattedDate = formatDate(date);
      setInputValue(formattedDate);
      const isoDate = format(date, 'yyyy-MM-dd');
      onChange(isoDate);
      setIsOpen(false);
      setError("");
    }
  };

  // Sincronizar inputValue con value cuando cambie externamente
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value);
        if (isValid(date)) {
          setInputValue(formatDate(date));
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    } else {
      setInputValue("");
    }
  }, [value]);

  // Fecha seleccionada para el calendario
  const selectedDate = value ? parseDate(inputValue) : undefined;

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              className={`pr-10 cursor-pointer ${error ? 'border-red-500' : ''} ${className}`}
              disabled={disabled}
              required={required}
              onClick={() => !disabled && setIsOpen(true)}
              readOnly={disabled}
            />
            <div className="absolute right-0 top-0 h-full px-3 py-2 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
} 