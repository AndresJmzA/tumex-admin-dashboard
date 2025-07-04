import * as React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from './popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup } from './command';
import { Checkbox } from './checkbox';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  maxSelected?: number;
  placeholder?: string;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  maxSelected = 6,
  placeholder = 'Selecciona personas...',
  className,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val));
    } else if (value.length < maxSelected) {
      onChange([...value, val]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between',
            value.length === 0 && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">
            {value.length === 0
              ? placeholder
              : options
                  .filter(opt => value.includes(opt.value))
                  .map(opt => opt.label)
                  .join(', ')}
          </span>
          <span className="ml-2 text-xs text-gray-500">{value.length}/{maxSelected}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-xs w-full left-0 right-0 mx-auto p-0">
        <Command>
          <CommandInput
            placeholder="Buscar persona..."
            value={search}
            onValueChange={setSearch}
            autoFocus
          />
          <CommandList>
            <CommandEmpty>No se encontraron personas.</CommandEmpty>
            <CommandGroup>
              {filtered.map(opt => (
                <div
                  key={opt.value}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded hover:bg-accent',
                    value.includes(opt.value) && 'bg-accent',
                    value.length >= maxSelected && !value.includes(opt.value) && 'opacity-50 pointer-events-none'
                  )}
                  onClick={() => handleSelect(opt.value)}
                >
                  <Checkbox checked={value.includes(opt.value)} readOnly />
                  <span className="truncate text-sm">{opt.label}</span>
                </div>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}; 