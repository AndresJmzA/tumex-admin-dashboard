import * as React from 'react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  required?: boolean;
  className?: string;
}

// Utilidad para generar opciones de hora y minuto
const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, label, id, required, className }) => {
  // Separar hora y minuto
  const [hour, setHour] = React.useState('');
  const [minute, setMinute] = React.useState('');

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHour(h || '');
      setMinute(m || '');
    }
  }, [value]);

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    setHour(newHour);
    onChange(`${newHour}:${minute || '00'}`);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value;
    setMinute(newMinute);
    onChange(`${hour || '00'}:${newMinute}`);
  };

  return (
    <div className={`flex flex-col gap-1 ${className || ''}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex gap-2 items-center">
        <select
          id={id ? `${id}-hour` : undefined}
          value={hour}
          onChange={handleHourChange}
          required={required}
          className="border rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>HH</option>
          {hours.map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <span className="text-lg font-bold">:</span>
        <select
          id={id ? `${id}-minute` : undefined}
          value={minute}
          onChange={handleMinuteChange}
          required={required}
          className="border rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>MM</option>
          {minutes.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TimePicker; 