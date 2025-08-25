import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  User,
  History,
  Settings,
  Loader2,
  Info,
  Shield,
  FileText,
  Truck,
  Box,
  Calendar,
  MapPin
} from 'lucide-react';
import { 
  orderStateService, 
  OrderStatus, 
  UserRole, 
  StateTransition,
  TransitionValidation,
  StatusHistoryEntry
} from '@/services/orderStateService';
import { ExtendedOrder } from '@/services/orderService';

interface OrderStateTransitionProps {
  order: ExtendedOrder;
  currentUserRole: UserRole;
  currentUserId: string;
  onStateChange?: (updatedOrder: ExtendedOrder) => void;
  showHistory?: boolean;
}

const OrderStateTransition: React.FC<OrderStateTransitionProps> = ({
  order,
  currentUserRole,
  currentUserId,
  onStateChange,
  showHistory = true
}) => {
  const { toast } = useToast();
  
  // Estados del componente
  const [validTransitions, setValidTransitions] = useState<StateTransition[]>([]);
  const [selectedTransition, setSelectedTransition] = useState<StateTransition | null>(null);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [transitionNotes, setTransitionNotes] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [validation, setValidation] = useState<TransitionValidation | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Cargar transiciones válidas al montar el componente
  useEffect(() => {
    loadValidTransitions();
  }, [order.status, currentUserRole]);

  // Cargar transiciones válidas para el estado actual
  const loadValidTransitions = () => {
    const transitions = orderStateService.getValidTransitions(
      order.status as OrderStatus,
      currentUserRole
    );
    setValidTransitions(transitions);
  };

  // Cargar historial de cambios de estado
  const loadStatusHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await orderStateService.getStatusHistory(order.orderId);
      setStatusHistory(history);
    } catch (error) {
      console.error('Error loading status history:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de cambios",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  // Manejar selección de transición
  const handleTransitionSelect = (transition: StateTransition) => {
    setSelectedTransition(transition);
    
    // Validar la transición
    const validation = orderStateService.validateTransition(
      order.status as OrderStatus,
      transition.to,
      currentUserRole,
      order
    );
    setValidation(validation);
    
    setShowTransitionModal(true);
  };

  // Ejecutar transición de estado
  const executeTransition = async () => {
    if (!selectedTransition) return;

    setIsTransitioning(true);
    try {
      const updatedOrder = await orderStateService.transitionOrder(
        order.orderId,
        selectedTransition.to,
        currentUserRole,
        currentUserId,
        transitionNotes.trim() || undefined
      );

      toast({
        title: "Transición exitosa",
        description: `Orden ${order.orderId} cambió a ${getStatusLabel(selectedTransition.to)}`,
      });

      // Notificar cambio de estado
      if (onStateChange) {
        onStateChange(updatedOrder);
      }

      // Cerrar modal y limpiar estado
      setShowTransitionModal(false);
      setSelectedTransition(null);
      setTransitionNotes('');
      setValidation(null);

      // Recargar transiciones válidas
      loadValidTransitions();
    } catch (error) {
      console.error('Error executing transition:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar el estado",
        variant: "destructive",
      });
    } finally {
      setIsTransitioning(false);
    }
  };

  // Obtener etiqueta del estado
  const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      created: 'Creada',
      pending_approval: 'Pendiente de Aprobación',
      approved: 'Aprobada',
      doctor_confirmation: 'Confirmación Médico',
      doctor_approved: 'Aprobada por Médico',
      doctor_rejected: 'Rechazada por Médico',
      templates_ready: 'Plantillas Listas',
      technicians_assigned: 'Técnicos Asignados',
      equipment_transported: 'Equipos Trasladados',
      remission_created: 'Remisión Creada',
      surgery_prepared: 'Quirófano Preparado',
      surgery_completed: 'Cirugía Completada',
      ready_for_billing: 'Lista para Facturar',
      billed: 'Facturada',
      cancelled: 'Cancelada',
      rejected: 'Rechazada'
    };
    return labels[status] || status;
  };

  // Obtener color del estado
  const getStatusColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
      created: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      doctor_confirmation: 'bg-blue-100 text-blue-800',
      doctor_approved: 'bg-green-100 text-green-800',
      doctor_rejected: 'bg-red-100 text-red-800',
      templates_ready: 'bg-purple-100 text-purple-800',
      technicians_assigned: 'bg-indigo-100 text-indigo-800',
      equipment_transported: 'bg-orange-100 text-orange-800',
      remission_created: 'bg-teal-100 text-teal-800',
      surgery_prepared: 'bg-pink-100 text-pink-800',
      surgery_completed: 'bg-gray-100 text-gray-800',
      ready_for_billing: 'bg-amber-100 text-amber-800',
      billed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Obtener icono del estado
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'created':
        return <FileText className="h-4 w-4" />;
      case 'pending_approval':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'doctor_confirmation':
        return <User className="h-4 w-4" />;
      case 'doctor_approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'doctor_rejected':
        return <XCircle className="h-4 w-4" />;
      case 'templates_ready':
        return <Box className="h-4 w-4" />;
      case 'technicians_assigned':
        return <User className="h-4 w-4" />;
      case 'equipment_transported':
        return <Truck className="h-4 w-4" />;
      case 'remission_created':
        return <FileText className="h-4 w-4" />;
      case 'surgery_prepared':
        return <MapPin className="h-4 w-4" />;
      case 'surgery_completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'ready_for_billing':
        return <Calendar className="h-4 w-4" />;
      case 'billed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Estado actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Estado Actual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {getStatusIcon(order.status as OrderStatus)}
            <Badge className={getStatusColor(order.status as OrderStatus)}>
              {getStatusLabel(order.status as OrderStatus)}
            </Badge>
            <span className="text-sm text-gray-600">
              Orden: {order.orderId}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Transiciones disponibles */}
      {validTransitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Transiciones Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {validTransitions.map((transition) => (
                <Button
                  key={`${transition.from}-${transition.to}`}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                  onClick={() => handleTransitionSelect(transition)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <ArrowRight className="h-4 w-4" />
                    <span className="font-medium">
                      {getStatusLabel(transition.to)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 text-left">
                    {transition.description}
                  </div>
                  {transition.estimatedDuration && (
                    <div className="text-xs text-gray-500">
                      ~{transition.estimatedDuration} min
                    </div>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sin transiciones disponibles */}
      {validTransitions.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Info className="h-8 w-8 mx-auto mb-2" />
              <p>No hay transiciones disponibles para tu rol</p>
              <p className="text-sm">Contacta al administrador si necesitas realizar cambios</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de cambios */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Cambios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => {
                loadStatusHistory();
                setShowHistoryModal(true);
              }}
            >
              <History className="h-4 w-4 mr-2" />
              Ver Historial Completo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de confirmación de transición */}
      <Dialog open={showTransitionModal} onOpenChange={setShowTransitionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Confirmar Transición
            </DialogTitle>
          </DialogHeader>

          {selectedTransition && (
            <div className="space-y-4">
              {/* Información de la transición */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(order.status as OrderStatus)}>
                    {getStatusLabel(order.status as OrderStatus)}
                  </Badge>
                  <ArrowRight className="h-4 w-4" />
                  <Badge className={getStatusColor(selectedTransition.to)}>
                    {getStatusLabel(selectedTransition.to)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedTransition.description}
                </p>
              </div>

              {/* Validaciones */}
              {validation && (
                <div className="space-y-2">
                  {validation.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {validation.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validation.warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {validation.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validation.requiredActions && validation.requiredActions.length > 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-medium mb-2">Acciones requeridas:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {validation.requiredActions.map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Notas de transición */}
              <div className="space-y-2">
                <Label htmlFor="transitionNotes">Notas (opcional)</Label>
                <Textarea
                  id="transitionNotes"
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  placeholder="Agregar notas sobre esta transición..."
                  rows={3}
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowTransitionModal(false)}
                  disabled={isTransitioning}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={executeTransition}
                  disabled={isTransitioning || (validation && !validation.isValid)}
                >
                  {isTransitioning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Confirmar Transición
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de historial */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Cambios de Estado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Cargando historial...</span>
              </div>
            ) : statusHistory.length > 0 ? (
              <div className="space-y-3">
                {statusHistory.map((entry) => (
                  <Card key={entry.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(entry.fromStatus)}>
                            {getStatusLabel(entry.fromStatus)}
                          </Badge>
                          <ArrowRight className="h-4 w-4" />
                          <Badge className={getStatusColor(entry.toStatus)}>
                            {getStatusLabel(entry.toStatus)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Cambiado por: {entry.changedBy}</p>
                          <p>Fecha: {new Date(entry.changedAt).toLocaleString('es-ES')}</p>
                          {entry.notes && (
                            <p>Notas: {entry.notes}</p>
                          )}
                          {entry.metadata?.role && (
                            <p>Rol: {entry.metadata.role}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-3" />
                <p>No hay historial de cambios disponible</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderStateTransition; 