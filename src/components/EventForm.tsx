import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, 
  Save, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  FileText,
  DollarSign,
  Box,
  Wrench
} from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';

interface EventFormProps {
  event?: CalendarEvent;
  selectedDate?: Date;
  onSave: (event: Partial<CalendarEvent>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const EventForm = ({ event, selectedDate, onSave, onCancel, isOpen }: EventFormProps) => {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    type: 'orden',
    status: 'pendiente',
    priority: 'media',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    attendees: [],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar formulario cuando se abre
  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        date: new Date(event.date)
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate
      }));
    }
  }, [event, selectedDate, isOpen]);

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

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'El título es requerido';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'La hora de fin debe ser posterior a la hora de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Manejar agregar asistentes
  const handleAddAttendee = () => {
    const newAttendee = prompt('Ingresa el nombre del asistente:');
    if (newAttendee?.trim()) {
      setFormData(prev => ({
        ...prev,
        attendees: [...(prev.attendees || []), newAttendee.trim()]
      }));
    }
  };

  // Manejar eliminar asistente
  const handleRemoveAttendee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees?.filter((_, i) => i !== index) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto tumex-card-radius bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {getEventIcon(formData.type as CalendarEvent['type'])}
            <h2 className="text-lg font-semibold text-gray-900">
              {event ? 'Editar Evento' : 'Nuevo Evento'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Tipo de evento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                Tipo de Evento
              </Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="negociacion">Negociación</SelectItem>
                  <SelectItem value="orden">Orden</SelectItem>
                  <SelectItem value="servicio">Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                Prioridad
              </Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => handleChange('priority', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona la prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Título */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Título *
            </Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ingresa el título del evento"
              className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Fecha *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                onChange={(e) => handleChange('date', new Date(e.target.value))}
                className={`mt-1 ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                Hora de Inicio
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime || ''}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                Hora de Fin
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime || ''}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className={`mt-1 ${errors.endTime ? 'border-red-500' : ''}`}
              />
              {errors.endTime && (
                <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>
              )}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <Label htmlFor="location" className="text-sm font-medium text-gray-700">
              Ubicación
            </Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Ingresa la ubicación del evento"
              className="mt-1"
            />
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe el evento..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Asistentes */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Asistentes
            </Label>
            <div className="mt-1 space-y-2">
              {formData.attendees?.map((attendee, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={attendee}
                    onChange={(e) => {
                      const newAttendees = [...(formData.attendees || [])];
                      newAttendees[index] = e.target.value;
                      handleChange('attendees', newAttendees);
                    }}
                    placeholder="Nombre del asistente"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttendee(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAttendee}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                Agregar Asistente
              </Button>
            </div>
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notas Adicionales
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Notas adicionales..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="tumex-button-radius"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="tumex-button-radius bg-tumex-primary-500 hover:bg-tumex-primary-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {event ? 'Actualizar' : 'Crear'} Evento
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EventForm; 