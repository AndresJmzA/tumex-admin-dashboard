import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, AlertTriangle, FileText, User, Calendar, DollarSign } from 'lucide-react';

// Tipos para el modal de aprobación de órdenes
interface OrderApprovalData {
  orderId: string;
  action: 'approve' | 'reject';
  notes: string;
  approvedBy: string;
  approvedAt: string;
}

interface OrderApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    customer: string;
    patientName: string;
    surgery: string;
    date: string;
    time: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedValue: number;
    equipment: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      price: number;
    }>;
    orderSource: string;
    commercialNotes?: string;
    notes?: string;
  };
  onApprove: (approvalData: OrderApprovalData) => void;
  onReject: (approvalData: OrderApprovalData) => void;
}

const OrderApprovalModal: React.FC<OrderApprovalModalProps> = ({
  isOpen,
  onClose,
  order,
  onApprove,
  onReject
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Calcular total de equipos
  const calculateTotal = () => {
    return order.equipment.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener texto de origen
  const getOrderSourceText = (source: string) => {
    switch (source) {
      case 'app': return 'Aplicación Móvil';
      case 'correo': return 'Correo Electrónico';
      case 'whatsapp': return 'WhatsApp';
      case 'llamada': return 'Llamada Telefónica';
      default: return source;
    }
  };

  // Manejar aprobación
  const handleApprove = async () => {

    setIsSubmitting(true);
    try {
      const approvalData: OrderApprovalData = {
        orderId: order.id,
        action: 'approve',
        notes: notes.trim(),
        approvedBy: 'Gerente Operativo', // TODO: Obtener del contexto de autenticación
        approvedAt: new Date().toISOString()
      };

      await onApprove(approvalData);
      toast({
        title: "Orden aprobada",
        description: "La orden ha sido aprobada exitosamente.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo aprobar la orden. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar rechazo
  const handleReject = async () => {

    setIsSubmitting(true);
    try {
      const approvalData: OrderApprovalData = {
        orderId: order.id,
        action: 'reject',
        notes: notes.trim(),
        approvedBy: 'Gerente Operativo', // TODO: Obtener del contexto de autenticación
        approvedAt: new Date().toISOString()
      };

      await onReject(approvalData);
      toast({
        title: "Orden rechazada",
        description: "La orden ha sido rechazada exitosamente.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo rechazar la orden. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear estado al cerrar
  const handleClose = () => {
    setAction(null);
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Revisar Orden {order.orderNumber}</span>
            <Badge className={getPriorityColor(order.priority)}>
              {order.priority}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la orden */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Orden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Cliente:</span>
                  </div>
                  <p className="text-sm text-gray-600">{order.customer}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Paciente:</span>
                  </div>
                  <p className="text-sm text-gray-600">{order.patientName}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Cirugía:</span>
                  </div>
                  <p className="text-sm text-gray-600">{order.surgery}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Fecha y Hora:</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(order.date).toLocaleDateString('es-ES')} a las {order.time}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Origen:</span>
                </div>
                <p className="text-sm text-gray-600">{getOrderSourceText(order.orderSource)}</p>
              </div>

              {order.commercialNotes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Notas Comerciales:</span>
                  </div>
                  <p className="text-sm text-gray-600">{order.commercialNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipos de la orden */}
          <Card>
            <CardHeader>
              <CardTitle>Equipos de la Orden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.equipment.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">x{item.quantity}</div>
                      <div className="text-sm font-medium">${(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center font-bold pt-2">
                  <span>Total:</span>
                  <span className="text-lg text-blue-600">${calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acción de aprobación/rechazo */}
          <Card>
            <CardHeader>
              <CardTitle>Decisión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button
                  variant={action === 'approve' ? 'default' : 'outline'}
                  onClick={() => setAction('approve')}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar Orden
                </Button>
                <Button
                  variant={action === 'reject' ? 'destructive' : 'outline'}
                  onClick={() => setAction('reject')}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar Orden
                </Button>
              </div>

              {action && (
                <div className="space-y-2">
                                     <Label htmlFor="notes">
                     Notas {action === 'approve' ? 'de Aprobación' : 'de Rechazo'} (Opcional)
                   </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      action === 'approve' 
                        ? "Explica por qué apruebas esta orden, consideraciones especiales, etc..."
                        : "Explica por qué rechazas esta orden, motivos, alternativas sugeridas, etc..."
                    }
                    rows={4}
                    className="resize-none"
                  />
                                     <p className="text-xs text-gray-500">
                     Las notas son opcionales pero recomendadas para mantener un registro detallado
                   </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {action === 'approve' && (
                         <Button 
               onClick={handleApprove}
               disabled={isSubmitting}
             >
              {isSubmitting ? 'Aprobando...' : 'Aprobar Orden'}
            </Button>
          )}
          {action === 'reject' && (
                         <Button 
               variant="destructive"
               onClick={handleReject}
               disabled={isSubmitting}
             >
              {isSubmitting ? 'Rechazando...' : 'Rechazar Orden'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderApprovalModal; 