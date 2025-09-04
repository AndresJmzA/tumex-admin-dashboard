import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DateInput } from '@/components/ui/DateInput';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, X, Calendar, FileText } from 'lucide-react';
import { RejectionReason, OrderRejectionFormData } from '@/types/orderRejection';

interface OrderRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderPatientName?: string;
  orderDate?: string;
  onSubmit: (data: OrderRejectionFormData) => Promise<void>;
}

const REJECTION_REASONS: RejectionReason[] = [
  'Técnicos no disponibles',
  'Traslapo de fechas',
  'Equipo no disponible',
  'Otro'
];

export function OrderRejectionModal({
  isOpen,
  onClose,
  orderId,
  orderPatientName,
  orderDate,
  onSubmit
}: OrderRejectionModalProps) {
  const { toast } = useToast();
  
  // Estados del formulario
  const [formData, setFormData] = useState<OrderRejectionFormData>({
    rejection_reason: 'Técnicos no disponibles',
    custom_reason: '',
    notes: '',
    should_reschedule: false,
    reschedule_date: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<OrderRejectionFormData>>({});

  // Limpiar formulario cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setFormData({
        rejection_reason: 'Técnicos no disponibles',
        custom_reason: '',
        notes: '',
        should_reschedule: false,
        reschedule_date: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<OrderRejectionFormData> = {};

    // Validar motivo de rechazo
    if (!formData.rejection_reason) {
      newErrors.rejection_reason = 'Debe seleccionar un motivo de rechazo';
    }

    // Si es "Otro", validar motivo personalizado
    if (formData.rejection_reason === 'Otro' && !formData.custom_reason.trim()) {
      newErrors.custom_reason = 'Debe especificar el motivo personalizado';
    }

    // Si se va a reagendar, validar fecha
    if (formData.should_reschedule && !formData.reschedule_date) {
      newErrors.reschedule_date = 'Debe seleccionar una nueva fecha';
    }

    // Validar que la nueva fecha sea futura
    if (formData.should_reschedule && formData.reschedule_date) {
      const selectedDate = new Date(formData.reschedule_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        newErrors.reschedule_date = 'La nueva fecha debe ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "❌ Error de validación",
        description: "Por favor, complete todos los campos requeridos correctamente.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      toast({
        title: "✅ Orden rechazada",
        description: formData.should_reschedule 
          ? "La orden ha sido rechazada y reagendada exitosamente."
          : "La orden ha sido rechazada exitosamente.",
        variant: "default"
      });
      
      onClose();
    } catch (error) {
      console.error('Error al rechazar orden:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo rechazar la orden. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar campo del formulario
  const updateField = (field: keyof OrderRejectionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 100 }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Rechazar Orden
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la orden */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Información de la Orden</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">ID de Orden:</span>
                <span className="ml-2 font-mono text-gray-900">{orderId}</span>
              </div>
              {orderPatientName && (
                <div>
                  <span className="text-gray-600">Paciente:</span>
                  <span className="ml-2 font-medium text-gray-900">{orderPatientName}</span>
                </div>
              )}
              {orderDate && (
                <div>
                  <span className="text-gray-600">Fecha de Cirugía:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(orderDate).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de rechazo */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Motivo de rechazo */}
            <div className="space-y-2">
              <Label htmlFor="rejection_reason" className="text-gray-700">
                Motivo de Rechazo *
              </Label>
              <Select
                value={formData.rejection_reason}
                onValueChange={(value: RejectionReason) => updateField('rejection_reason', value)}
              >
                <SelectTrigger className={errors.rejection_reason ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar motivo de rechazo" />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.rejection_reason && (
                <p className="text-sm text-red-600">{errors.rejection_reason}</p>
              )}
            </div>

            {/* Motivo personalizado */}
            {formData.rejection_reason === 'Otro' && (
              <div className="space-y-2">
                <Label htmlFor="custom_reason" className="text-gray-700">
                  Especificar Motivo *
                </Label>
                <Input
                  id="custom_reason"
                  value={formData.custom_reason}
                  onChange={(e) => updateField('custom_reason', e.target.value)}
                  placeholder="Describa el motivo específico del rechazo"
                  className={errors.custom_reason ? 'border-red-500' : ''}
                />
                {errors.custom_reason && (
                  <p className="text-sm text-red-600">{errors.custom_reason}</p>
                )}
              </div>
            )}

            {/* Notas adicionales */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700">
                Notas Adicionales
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Agregue notas adicionales, explicaciones o instrucciones..."
                rows={3}
              />
            </div>

            {/* Opción de reagendar */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="should_reschedule"
                  checked={formData.should_reschedule}
                  onCheckedChange={(checked) => updateField('should_reschedule', checked)}
                />
                <Label htmlFor="should_reschedule" className="text-gray-700">
                  Reagendar la orden para otra fecha
                </Label>
              </div>

              {formData.should_reschedule && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="reschedule_date" className="text-gray-700">
                    Nueva Fecha de Cirugía *
                  </Label>
                  <DateInput
                    value={formData.reschedule_date}
                    onChange={(value) => updateField('reschedule_date', value)}
                    placeholder="Seleccionar nueva fecha"
                    minDate={new Date()}
                    className={errors.reschedule_date ? 'border-red-500' : ''}
                  />
                  {errors.reschedule_date && (
                    <p className="text-sm text-red-600">{errors.reschedule_date}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    La nueva fecha debe ser futura
                  </p>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {isSubmitting 
                  ? 'Procesando...' 
                  : formData.should_reschedule 
                    ? 'Rechazar y Reagendar' 
                    : 'Rechazar Orden'
                }
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
