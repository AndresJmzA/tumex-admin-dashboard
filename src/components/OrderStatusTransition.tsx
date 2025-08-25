import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  OrderStatus, 
  UserRole,
  getAvailableTransitions,
  validateStateTransition,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CONFIG
} from '@/types/orders';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderStatusTransitionProps {
  currentStatus: OrderStatus;
  orderId: string;
  orderNumber: string;
  userRole: UserRole;
  onStatusChange: (newStatus: OrderStatus, reason?: string) => void;
  className?: string;
}

const OrderStatusTransition: React.FC<OrderStatusTransitionProps> = ({
  currentStatus,
  orderId,
  orderNumber,
  userRole,
  onStatusChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTransitions = getAvailableTransitions(currentStatus, userRole);
  const currentConfig = ORDER_STATUS_CONFIG[currentStatus];

  const handleStatusChange = async () => {
    if (!selectedStatus) return;

    const validation = validateStateTransition(
      currentStatus,
      selectedStatus,
      userRole,
      true, // hasApproval
      reason.trim().length > 0 // hasReason
    );

    if (!validation.isValid) {
      console.error('Transición no válida:', validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onStatusChange(selectedStatus, reason.trim() || undefined);
      setIsOpen(false);
      setSelectedStatus('');
      setReason('');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTransitionOptions = () => {
    return availableTransitions.map(transition => {
      const targetConfig = ORDER_STATUS_CONFIG[transition.to];
      return {
        value: transition.to,
        label: ORDER_STATUS_LABELS[transition.to],
        description: targetConfig.description,
        requiresReason: transition.requiresReason,
        requiresApproval: transition.requiresApproval,
        nextSteps: transition.nextSteps
      };
    });
  };

  const transitionOptions = getTransitionOptions();

  if (transitionOptions.length === 0) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <OrderStatusBadge status={currentStatus} />
        <span className="text-sm text-gray-500">
          No hay transiciones disponibles para tu rol
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <OrderStatusBadge status={currentStatus} />
        <span className="text-sm text-gray-500">
          {currentConfig.description}
        </span>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Cambiar Estado
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Orden</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Orden #{orderNumber}</Label>
              <p className="text-sm text-gray-600">
                Estado actual: <OrderStatusBadge status={currentStatus} />
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newStatus">Nuevo Estado</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value: OrderStatus) => setSelectedStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nuevo estado" />
                </SelectTrigger>
                <SelectContent>
                  {transitionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <OrderStatusBadge status={option.value} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStatus && (
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo del cambio</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explica el motivo del cambio de estado..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Este campo es requerido para cambios de estado
                </p>
              </div>
            )}

            {selectedStatus && (
              <Card className="p-3 bg-blue-50">
                <h4 className="font-medium text-sm mb-2">Próximos pasos:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {transitionOptions
                    .find(opt => opt.value === selectedStatus)
                    ?.nextSteps?.map((step, index) => (
                      <li key={index} className="flex items-center space-x-1">
                        <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                        <span>{step}</span>
                      </li>
                    ))}
                </ul>
              </Card>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={!selectedStatus || isSubmitting}
              >
                {isSubmitting ? 'Cambiando...' : 'Confirmar Cambio'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderStatusTransition; 