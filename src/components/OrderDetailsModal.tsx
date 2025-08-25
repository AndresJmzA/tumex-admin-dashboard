import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  MapPin, 
  Calendar,
  FileText,
  Shield,
  Info,
  Phone,
  PhoneCall,
  Edit,
  Package,
  Download,
  FileSpreadsheet,
  Printer,
  ArrowRight,
  CheckSquare,
  Settings,
  MessageSquare,
  Wrench
} from 'lucide-react';
import { PendingOrder } from '@/services/operationalDashboardService';
import { orderEquipmentService } from '@/services/orderEquipmentService';
import { getStatusLabel, getStatusClass } from '@/utils/status';
import { usePermissions, PERMISSIONS } from '@/hooks/usePermissions';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserRole } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { EquipmentManagementModal } from '@/components/EquipmentManagementModal';
import { createOrderStatusChangeNotification } from '@/services/notificationService';
import { logOrderStatusTransition } from '@/utils/auditLogger';
import TechnicianAssignmentModal from '@/components/TechnicianAssignmentModal';
import { OrderRejectionModal } from '@/components/OrderRejectionModal';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PendingOrder | null;
  onApprove?: (orderId: string) => Promise<void>;
  onReject?: (orderId: string, reason: string) => Promise<void>;
  onEditEquipment?: (orderId: string) => void;
  onCreateTemplate?: (orderId: string) => Promise<void>;
  onMarkAsReady?: (orderId: string) => Promise<void>;
  onDownloadTemplate?: (orderId: string, format: 'pdf' | 'excel') => Promise<void>;
  onOpenAssignTechnicians?: (orderId: string) => void;
  onSendToWarehouse?: (orderId: string) => Promise<void>; // Para enviar orden a almacén
  onMarkAsReadyForTechnicians?: (orderId: string) => Promise<void>; // NUEVA: Para marcar como lista para técnicos
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onApprove,
  onReject,
  onEditEquipment,
  onCreateTemplate,
  onMarkAsReady,
  onDownloadTemplate,
  onOpenAssignTechnicians,
  onSendToWarehouse,
  onMarkAsReadyForTechnicians
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);
  const [showEquipmentList, setShowEquipmentList] = useState(false);
  const [showEquipmentManagement, setShowEquipmentManagement] = useState(false);
  const [activeTab, setActiveTab] = useState('order-info');
  const [showSendOrderModal, setShowSendOrderModal] = useState(false); // Nuevo estado para el modal de envío de orden
  const [showTechnicianAssignment, setShowTechnicianAssignment] = useState(false); // Nuevo estado para el modal de asignación de técnicos
  
  // NUEVO: Estado para el modal de rechazo
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  
  // Agregar hooks para permisos y detección móvil
  const { hasRole, getUserRole, hasPermission, PERMISSIONS } = usePermissions();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Permisos de aprobación/rechazo
  const canApprove = hasPermission(PERMISSIONS.ORDERS.APPROVE);
  const canReject = hasPermission(PERMISSIONS.ORDERS.REJECT);

  // Verificar si el usuario es jefe de almacén (declarado antes de efectos)
  const isWarehouseManager = () => {
    return hasRole(UserRole.JEFE_ALMACEN);
  };



  // Equipos de la orden para vista de almacén
  const [warehouseEquipment, setWarehouseEquipment] = useState<Array<{
    id: string;
    product_id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
    confirmed: boolean;
  }>>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);

  useEffect(() => {
    const loadEquipment = async () => {
      if (!order || order.status !== 'in_preparation' || !canViewEquipment()) return;
      try {
        setLoadingEquipment(true);
        const resp = await orderEquipmentService.getOrderEquipment(order.id);
        setWarehouseEquipment(
          resp.data.map(eq => ({
            id: eq.id,
            product_id: eq.product_id,
            name: eq.product_name,
            category: eq.category,
            quantity: eq.quantity,
            price: eq.price,
            confirmed: eq.confirmed,
          }))
        );
      } catch (e) {
        console.error('Error loading order equipment for warehouse view', e);
      } finally {
        setLoadingEquipment(false);
      }
    };
    loadEquipment();
    if (order) {
      const sub = orderEquipmentService.subscribeToOrderEquipment(order.id, loadEquipment);
      return () => sub.unsubscribe();
    }
  }, [order]);
  
  // Verificar si el usuario puede contactar al doctor
  const canContactDoctor = () => {
    const userRole = getUserRole();
    return (
      hasRole(UserRole.GERENTE_COMERCIAL) || 
      hasRole(UserRole.ADMINISTRADOR_GENERAL) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO)
    );
  };

  // Verificar si el usuario puede marcar órdenes como lista para técnicos
  const canMarkReadyForTechnicians = () => {
    return hasPermission(PERMISSIONS.ORDERS.MARK_READY_FOR_TECHNICIANS);
  };

  // Verificar si el usuario puede asignar técnicos (solo Gerente Operativo)
  const canAssignTechnicians = () => {
    return hasRole(UserRole.GERENTE_OPERATIVO);
  };

  // Verificar si el usuario puede enviar la orden (solo después de asignar técnicos)
  const canSendOrder = () => {
    return order?.assignedTechnicians && order.assignedTechnicians.length > 0;
  };

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Función para manejar la llamada
  const handleCallDoctor = () => {
    if (order?.doctorPhone) {
      if (isMobile) {
        // En móvil, hacer la llamada directamente
        window.location.href = `tel:${order.doctorPhone}`;
      } else {
        // En desktop, mostrar el número
        alert(`Número del doctor: ${order.doctorPhone}`);
      }
    }
  };

  // NUEVA: Función para manejar el rechazo de la orden
  const handleRejectOrder = () => {
    setShowRejectionModal(true);
  };

  // NUEVA: Función para manejar el envío del rechazo
  const handleSubmitRejection = async (rejectionData: any) => {
    if (!order || !onReject) return;
    
    try {
      // Llamar a la función del componente padre con el motivo del rechazo
      await onReject(order.id, rejectionData.rejection_reason || rejectionData.custom_reason || 'Motivo no especificado');
      
      // Cerrar el modal de rechazo
      setShowRejectionModal(false);
      
      // Cerrar el modal principal
      onClose();
      
    } catch (error) {
      console.error('Error al rechazar la orden:', error);
      // El error se maneja en el componente padre
    }
  };

  // Función para copiar el número al portapapeles
  const copyPhoneNumber = () => {
    if (order?.doctorPhone) {
      navigator.clipboard.writeText(order.doctorPhone);
      alert('Número copiado al portapapeles');
    }
  };

  // Verificar si el usuario puede editar equipos
  const canEditEquipment = () => {
    const userRole = getUserRole();
    return (
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_OPERATIVO) ||
      hasRole(UserRole.ADMINISTRADOR_GENERAL) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO)
    );
  };

  // Verificar si el usuario puede ver equipos (lectura)
  const canViewEquipment = () => {
    return (
      hasRole(UserRole.JEFE_ALMACEN) ||
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_OPERATIVO) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO) ||
      hasRole(UserRole.ADMINISTRADOR_GENERAL)
    );
  };

  // Verificar si el usuario es técnico o jefe de almacén y puede crear plantillas
  const canCreateTemplate = () => {
    const userRole = getUserRole();
    return hasRole(UserRole.TECNICO) || hasRole(UserRole.JEFE_ALMACEN);
  };

  // Función para manejar la edición de equipos
  const handleEditEquipment = () => {
    setShowEditConfirmation(false);
    setShowEquipmentManagement(true);
  };

  // Función para manejar la creación de plantillas
  const handleCreateTemplate = () => {
    if (onCreateTemplate && order) {
      onCreateTemplate(order.id);
    }
  };

  // Función para manejar la descarga de plantillas
  const handleDownloadTemplate = async (format: 'pdf' | 'excel') => {
    if (!onDownloadTemplate || !order) return;
    
    try {
      setIsLoading(true);
      await onDownloadTemplate(order.id, format);
      toast({
        title: "✅ Plantilla Descargada",
        description: `La plantilla se ha descargado en formato ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo descargar la plantilla. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para marcar como lista
  const handleMarkAsReady = async () => {
    if (!order) return;
    
    setIsLoading(true);
    try {
      if (onMarkAsReady) {
        await onMarkAsReady(order.id);
        toast({
          title: "Orden marcada como lista",
          description: "La orden ha sido marcada como lista para recoger.",
        });
        onClose();
      }
    } catch (error) {
      console.error('Error marcando orden como lista:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar la orden como lista.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // NUEVA: Función para mandar orden a almacén (cambiar estado a "En preparación")
  const handleSendToWarehouse = async () => {
    if (!order || !onSendToWarehouse) return;
    
    console.log('🔄 Iniciando cambio de estado a "En preparación" para orden:', order.id);
    setIsLoading(true);
    
    try {
      // Llamar a la función del componente padre para cambiar el estado
      await onSendToWarehouse(order.id);
      
      console.log('✅ Orden enviada a almacén exitosamente');
      
      // Generar notificación automática
      try {
        await createOrderStatusChangeNotification('in_preparation', {
          orderId: order.id,
          orderNumber: order.id, // PendingOrder no tiene orderNumber, usar id
          customer: order.patientName || 'Paciente',
          surgery: order.surgeryLocation, // Usar surgeryLocation en lugar de surgeryType
          date: order.surgeryDate,
          changedBy: getUserRole()?.toString() || 'Usuario',
          changedByRole: getUserRole() || UserRole.ADMINISTRADOR_GENERAL
        });
        
        console.log('✅ Notificación generada para cambio de estado a "En preparación"');
      } catch (notificationError) {
        console.warn('⚠️ Error generando notificación:', notificationError);
        // No fallar la operación principal por errores de notificación
      }
      
      // Registrar cambio en auditoría
      try {
        logOrderStatusTransition(
          getUserRole()?.toString() || 'Usuario',
          getUserRole()?.toString() || 'ADMINISTRADOR_GENERAL',
          order.id,
          order.id,
          order.patientName || 'Paciente',
          order.status,
          'in_preparation',
          'Orden enviada a almacén para preparación'
        );
        
        console.log('📝 Auditoría registrada para cambio de estado a "En preparación"');
      } catch (auditError) {
        console.warn('⚠️ Error registrando auditoría:', auditError);
        // No fallar la operación principal por errores de auditoría
      }
      
      toast({
        title: "Orden enviada a almacén",
        description: "La orden ha sido enviada a almacén para preparación.",
      });
      
      // Cerrar el modal después del cambio exitoso
      onClose();
      
    } catch (error) {
      console.error('❌ Error enviando orden a almacén:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la orden a almacén.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // NUEVA: Función para marcar como lista para técnicos (cambiar estado a "Lista para Técnicos")
  const handleMarkAsReadyForTechnicians = async () => {
    if (!order || !onMarkAsReadyForTechnicians) return;
    
    // Validar permisos antes de proceder
    if (!canMarkReadyForTechnicians()) {
      toast({
        title: "❌ Acceso Denegado",
        description: "No tienes permisos para realizar esta acción.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('🔄 Marcando orden como lista para técnicos:', order.id);
    setIsLoading(true);
    
    try {
      // Llamar a la función del componente padre para cambiar el estado
      await onMarkAsReadyForTechnicians(order.id);
      
      console.log('✅ Orden marcada como lista para técnicos exitosamente');
      
      // Generar notificación automática
      try {
        await createOrderStatusChangeNotification('ready_for_technicians', {
          orderId: order.id,
          orderNumber: order.id, // PendingOrder no tiene orderNumber, usar id
          customer: order.patientName || 'Paciente',
          surgery: order.surgeryLocation, // Usar surgeryLocation en lugar de surgeryType
          date: order.surgeryDate,
          changedBy: getUserRole()?.toString() || 'Usuario',
          changedByRole: getUserRole() || UserRole.ADMINISTRADOR_GENERAL
        });
        
        console.log('✅ Notificación generada para cambio de estado a "Lista para Técnicos"');
      } catch (notificationError) {
        console.warn('⚠️ Error generando notificación:', notificationError);
        // No fallar la operación principal por errores de notificación
      }
      
      // Registrar cambio en auditoría
      try {
        logOrderStatusTransition(
          getUserRole()?.toString() || 'Usuario',
          getUserRole()?.toString() || 'ADMINISTRADOR_GENERAL',
          order.id,
          order.id,
          order.patientName || 'Paciente',
          order.status,
          'ready_for_technicians',
          'Orden marcada como lista para asignar técnicos'
        );
        
        console.log('📝 Auditoría registrada para cambio de estado a "Lista para Técnicos"');
      } catch (auditError) {
        console.warn('⚠️ Error registrando auditoría:', auditError);
        // No fallar la operación principal por errores de auditoría
      }
      
      toast({
        title: "Orden lista para técnicos",
        description: "La orden ha sido marcada como lista para asignar técnicos.",
      });
      
      // Cerrar el modal después del cambio exitoso
      onClose();
      
    } catch (error) {
      console.error('❌ Error marcando orden como lista para técnicos:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar la orden como lista para técnicos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) return null;

  const handleApprove = async () => {
    if (!onApprove || !canApprove) return;
    
    setIsLoading(true);
    try {
      await onApprove(order.id);
      onClose();
    } catch (error) {
      console.error('Error aprobando orden:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'text-yellow-600 bg-yellow-50';
      case 'pending_confirmation': return 'text-blue-600 bg-blue-50';
      case 'pending_equipment': return 'text-purple-600 bg-purple-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'in_preparation': return 'text-orange-600 bg-orange-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Determinar qué pestañas puede ver el usuario
  const canViewOrderInfo = () => {
    return (
      hasRole(UserRole.ADMINISTRADOR_GENERAL) ||
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_OPERATIVO) ||
      hasRole(UserRole.JEFE_ALMACEN) ||
      hasRole(UserRole.TECNICO) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO) ||
      hasRole(UserRole.FINANZAS)
    );
  };

  const canViewAdditionalInfo = () => {
    return (
      hasRole(UserRole.ADMINISTRADOR_GENERAL) ||
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_OPERATIVO) ||
      hasRole(UserRole.JEFE_ALMACEN) ||
      hasRole(UserRole.TECNICO) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO) ||
      hasRole(UserRole.FINANZAS)
    );
  };

  const canViewContactDoctor = () => {
    return (
      hasRole(UserRole.ADMINISTRADOR_GENERAL) ||
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO)
    );
  };

  const canViewEditOrder = () => {
    return (
      hasRole(UserRole.ADMINISTRADOR_GENERAL) ||
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_OPERATIVO) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO)
    );
  };

  const canViewActions = () => {
    return (
      hasRole(UserRole.ADMINISTRADOR_GENERAL) ||
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_OPERATIVO) ||
      hasRole(UserRole.JEFE_ALMACEN) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO)
    );
  };

  // Obtener pestañas disponibles para el usuario
  const getAvailableTabs = () => {
    const tabs = [];
    
    if (canViewOrderInfo()) {
      tabs.push({ id: 'order-info', label: 'Información de la Orden', icon: Info });
    }
    
    if (canViewAdditionalInfo()) {
      tabs.push({ id: 'additional-info', label: 'Información Adicional', icon: FileText });
    }
    
    if (canViewActions()) {
      tabs.push({ id: 'actions', label: 'Acciones', icon: Settings });
    }
    
    if (canViewContactDoctor()) {
      tabs.push({ id: 'contact-doctor', label: 'Contactar al Doctor', icon: MessageSquare });
    }
    
    if (canViewEditOrder()) {
      tabs.push({ id: 'edit-order', label: 'Editar Orden', icon: Wrench });
    }
    
    return tabs;
  };

  const availableTabs = getAvailableTabs();

  // Establecer la primera pestaña disponible como activa por defecto
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles de la Orden
          </DialogTitle>
          <DialogDescription>
            Información detallada de la orden, incluyendo estado, equipos y opciones de gestión.
          </DialogDescription>
        </DialogHeader>

        {/* Sistema de Pestañas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
            {availableTabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* PESTAÑA 1: Información de la Orden */}
          {canViewOrderInfo() && (
            <TabsContent value="order-info" className="space-y-6">
              {/* Información Principal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Información de la Orden</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusClass(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority === 'critical' ? 'Crítica' :
                         order.priority === 'high' ? 'Alta' :
                         order.priority === 'medium' ? 'Media' :
                         order.priority === 'low' ? 'Baja' : order.priority}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Paciente:</span>
                        <span>{order.patientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Doctor:</span>
                        <span>{order.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Ubicación:</span>
                        <span>{order.surgeryLocation}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Fecha:</span>
                        <span>{formatDate(order.surgeryDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Hora:</span>
                        <span>{formatTime(order.surgeryTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Creada:</span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Asignación de Técnicos: visible solo cuando Plantillas Listas y con permiso */}
              {order.status === 'templates_ready' && canAssignTechnicians() && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-purple-600" />
                      Asignación de Técnicos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <span className="font-medium text-purple-700">Lista para asignar técnicos</span>. Selecciona a los técnicos que atenderán esta orden.
                      </AlertDescription>
                    </Alert>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => onOpenAssignTechnicians && onOpenAssignTechnicians(order.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Asignar Técnicos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Advertencias y Traslapes */}
              {(order.warnings.length > 0 || order.hasOverlap) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Advertencias y Alertas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.warnings.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="font-medium text-red-600">Advertencias detectadas:</p>
                            <ul className="text-sm text-red-600">
                              {order.warnings.map((warning, index) => (
                                <li key={index}>• {warning}</li>
                              ))}
                            </ul>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {order.hasOverlap && (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="font-medium text-orange-600">Traslape detectado:</p>
                            <p className="text-sm text-orange-600">{order.overlapDetails}</p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Botones de Acción */}
              {order.status === 'created' && (canApprove || canReject) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Acciones de Aprobación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3">
                      {canApprove && (
                        <Button 
                          onClick={handleApprove}
                          disabled={isLoading}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprobar Orden
                        </Button>
                      )}

                      {canReject && (
                        <div className="space-y-2">
                          <Button 
                            onClick={handleRejectOrder}
                            disabled={isLoading}
                            variant="destructive"
                            className="w-full"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Rechazar Orden
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* PESTAÑA 2: Información Adicional */}
          {canViewAdditionalInfo() && (
            <TabsContent value="additional-info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Información Adicional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tipo de Cobertura</p>
                      <p className="text-sm">{order.coverageType}</p>
                    </div>
                    {order.insuranceName && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Seguro</p>
                        <p className="text-sm">{order.insuranceName}</p>
                      </div>
                    )}
                    {order.notes && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-600">Notas</p>
                        <p className="text-sm">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Tab de Acciones */}
          <TabsContent value="actions" className="space-y-4">
            <div className="grid gap-4">
              {/* Información de Técnicos Asignados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Técnicos Asignados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {order?.assignedTechnicians && order.assignedTechnicians.length > 0 ? (
                    <div className="space-y-3">
                      {order.assignedTechnicians.map((tech, index) => (
                        <div key={tech.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {tech.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{tech.name}</p>
                              <p className="text-sm text-gray-600">ID: {tech.id}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {tech.role || 'Asistente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">Ningún técnico asignado</p>
                      <p className="text-sm">Los técnicos aparecerán aquí una vez asignados</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dirección de Entrega */}
              {order?.surgeryLocation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Dirección de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-600 mb-2">Ubicación:</p>
                        <p className="font-medium">{order.surgeryLocation}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          const searchQuery = encodeURIComponent(order.surgeryLocation);
                          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
                          window.open(googleMapsUrl, '_blank');
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Ver dirección de entrega en Google Maps
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Acciones de Técnicos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Gestión de Técnicos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Botón Asignar Técnicos */}
                  <Button 
                    onClick={() => setShowTechnicianAssignment(true)}
                    disabled={!canAssignTechnicians()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {order?.assignedTechnicians && order.assignedTechnicians.length > 0 
                      ? 'Reasignar Técnicos' 
                      : 'Asignar Técnicos'
                    }
                  </Button>

                  {/* Botón Enviar Orden */}
                  {order?.assignedTechnicians && order.assignedTechnicians.length > 0 && (
                    <Button 
                      onClick={() => setShowSendOrderModal(true)}
                      disabled={!canSendOrder()}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Enviar Orden
                    </Button>
                  )}

                  {/* Información de permisos */}
                  {!canAssignTechnicians() && (
                    <div className="text-sm text-gray-500 text-center p-2">
                      Solo el Gerente Operativo puede asignar técnicos
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PESTAÑA 4: Contactar al Doctor */}
          {canViewContactDoctor() && (
            <TabsContent value="contact-doctor" className="space-y-6">
              {/* Sección de Contacto al Doctor - Solo para órdenes aprobadas o reagendadas */}
              {(order.status === 'approved' || order.status === 'rescheduled') ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-blue-600" />
                      Contactar al Doctor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-medium text-blue-600">Confirmación de Equipos</p>
                        <p className="text-sm text-blue-600">
                          Contacta al doctor para confirmar la lista de equipos necesarios para la cirugía.
                        </p>
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium">{order.doctorName}</p>
                            <p className="text-sm text-gray-600">Doctor Responsable</p>
                          </div>
                        </div>
                        {order.doctorPhone && (
                          <div className="text-right">
                            <p className="font-medium text-green-600">{order.doctorPhone}</p>
                            <p className="text-xs text-gray-500">Teléfono</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {isMobile ? (
                          <Button 
                            onClick={handleCallDoctor}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={!order.doctorPhone}
                          >
                            <PhoneCall className="h-4 w-4 mr-2" />
                            Llamar al Doctor
                          </Button>
                        ) : (
                          <>
                            <Button 
                              onClick={copyPhoneNumber}
                              variant="outline"
                              className="flex-1"
                              disabled={!order.doctorPhone}
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Copiar Número
                            </Button>
                            <Button 
                              onClick={handleCallDoctor}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              disabled={!order.doctorPhone}
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Mostrar Número
                            </Button>
                          </>
                        )}
                      </div>
                      
                      {/* Botones de acción */}
                      <div className="flex gap-2">
                        {/* Botón para crear plantilla - Solo para técnicos */}
                        {canCreateTemplate() && (
                          <Button 
                            onClick={handleCreateTemplate}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Crear Plantilla
                          </Button>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                        <p className="font-medium">Notas importantes:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Confirma la lista completa de equipos necesarios</li>
                          <li>Verifica si hay equipos especiales requeridos</li>
                          <li>Confirma la hora exacta de la cirugía</li>
                          <li>Anota cualquier requerimiento adicional</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-gray-600" />
                      Contactar al Doctor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-medium text-gray-600">
                          Esta funcionalidad solo está disponible para órdenes aprobadas.
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          El estado actual de la orden es: <strong>{getStatusLabel(order.status)}</strong>
                        </p>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* PESTAÑA 5: Editar Orden */}
          {canViewEditOrder() && (
            <TabsContent value="edit-order" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    Gestión de Equipos de la Orden
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium text-blue-600">Gestión Completa de Equipos</p>
                      <p className="text-sm text-blue-600">
                        Desde aquí puedes gestionar todos los equipos de esta orden, incluyendo la adición de paquetes predefinidos o productos individuales.
                      </p>
                    </AlertDescription>
                  </Alert>

                  {/* Botón Principal de Gestión */}
                  <div className="text-center space-y-4">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        ¿Qué quieres hacer?
                      </h3>
                      <p className="text-sm text-blue-700 mb-4">
                        Selecciona la opción que mejor se adapte a tus necesidades
                      </p>
                      
                                             <Button
                         onClick={() => setShowEquipmentManagement(true)}
                         size="lg"
                         className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                       >
                         <Wrench className="h-5 w-5 mr-2" />
                         Ver/Editar Orden
                       </Button>
                    </div>
                  </div>

                  {/* Información de la Orden */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Orden:</span>
                        <span className="text-gray-600">{order.id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Doctor:</span>
                        <span className="text-gray-600">{order.doctorName}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Fecha:</span>
                        <span className="text-gray-600">{formatDate(order.surgeryDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Hora:</span>
                        <span className="text-gray-600">{formatTime(order.surgeryTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notas Importantes */}
                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium text-blue-800">Notas importantes:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-blue-700">
                      <li>Los cambios solo afectan esta orden específica</li>
                      <li>No se modifica el inventario maestro</li>
                      <li>Puedes agregar equipos individuales o paquetes predefinidos</li>
                      <li>Los cambios se guardan automáticamente</li>
                      <li>Puedes modificar cantidades y eliminar productos</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Botón de Cerrar */}
        <div className="flex justify-end pt-4 border-t">
          {/* Botón para mandar orden a almacén */}
          {(order?.status === 'approved' || order?.status === 'rescheduled') && canEditEquipment() && (
            <Button 
              onClick={handleSendToWarehouse}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 mr-2"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Mandar orden a almacén
                </>
              )}
            </Button>
          )}

          {/* Botón para marcar como lista para técnicos */}
          {order?.status === 'in_preparation' && canMarkReadyForTechnicians() && (
            <Button 
              onClick={handleMarkAsReadyForTechnicians}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 mr-2"
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Marcando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Lista
                </>
              )}
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>

      {/* Modal pequeño: lista de equipos de la orden (Jefe de Almacén) */}
      <Dialog open={showEquipmentList} onOpenChange={setShowEquipmentList}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Pedido de equipos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {loadingEquipment ? (
              <div className="text-sm text-gray-500">Cargando equipos...</div>
            ) : warehouseEquipment.length === 0 ? (
              <div className="text-sm text-gray-500">Sin equipos registrados</div>
            ) : (
              <div className="space-y-2">
                {warehouseEquipment.map(eq => (
                  <div key={eq.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{eq.category || 'Equipo'}</Badge>
                      <span className="font-medium text-sm">{eq.name}</span>
                      {eq.confirmed && (
                        <Badge className="bg-green-100 text-green-800">Confirmado</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Cant: {eq.quantity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación para Editar Equipos */}
      <Dialog open={showEditConfirmation} onOpenChange={setShowEditConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Confirmar Edición de Equipos
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium text-orange-600">¿Estás seguro que quieres editar los equipos de esta orden?</p>
                <p className="text-sm text-orange-600 mt-1">
                  Esta acción te permitirá agregar, modificar o eliminar equipos de la orden durante la llamada al doctor.
                </p>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>Orden: {order?.id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Doctor: {order?.doctorName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Fecha: {order?.surgeryDate ? formatDate(order.surgeryDate) : ''}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              <p className="font-medium">Notas importantes:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Los cambios solo afectan esta orden específica</li>
                <li>No se modifica el inventario maestro</li>
                <li>Puedes agregar equipos individuales o paquetes predefinidos</li>
                <li>Los cambios se guardan automáticamente</li>
              </ul>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowEditConfirmation(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleEditEquipment}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Sí, Editar Equipos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Gestión de Equipos */}
      <EquipmentManagementModal
        isOpen={showEquipmentManagement}
        onClose={() => setShowEquipmentManagement(false)}
        orderId={order?.id || ''}
        orderEquipment={warehouseEquipment.map(eq => ({
          id: eq.id,
          product_id: eq.product_id,
          product_name: eq.name,
          category: eq.category,
          quantity: eq.quantity,
          price: eq.price,
          confirmed: eq.confirmed,
          is_from_package: false, // Por defecto no son de paquete
          notes: undefined
        }))}
        onEquipmentUpdate={(updatedEquipment) => {
          setWarehouseEquipment(
            updatedEquipment.map(eq => ({
              id: eq.id,
              product_id: eq.product_id,
              name: eq.product_name,
              category: eq.category,
              quantity: eq.quantity,
              price: eq.price,
              confirmed: eq.confirmed,
            }))
          );
        }}
      />

      {/* Modal de Confirmación para Enviar Orden */}
      <Dialog open={showSendOrderModal} onOpenChange={setShowSendOrderModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Confirmar Envío a Almacén
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium text-green-600">¿Estás seguro que quieres enviar esta orden a almacén para preparación?</p>
                <p className="text-sm text-green-600 mt-1">
                  Una vez enviada, el estado de la orden cambiará a "En preparación" y no podrás modificar los equipos.
                </p>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                <span>Orden: {order?.id}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Doctor: {order?.doctorName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Fecha: {order?.surgeryDate ? formatDate(order.surgeryDate) : ''}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
              <p className="font-medium">Notas importantes:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Una vez enviada, el estado de la orden no podrá ser modificado.</li>
                <li>Los equipos de la orden se moverán al inventario de almacén.</li>
                <li>La orden pasará a "En preparación" y estará lista para ser recogida por los técnicos.</li>
              </ul>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowSendOrderModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSendToWarehouse}
                className="bg-green-600 hover:bg-green-700"
              >
                <Package className="h-4 w-4 mr-2" />
                Sí, Enviar Orden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Asignación de Técnicos */}
      {order && (
        <TechnicianAssignmentModal
          isOpen={showTechnicianAssignment}
          onClose={() => setShowTechnicianAssignment(false)}
          orderId={order.id}
          onAssigned={(orderId) => {
            console.log('✅ Técnicos asignados exitosamente a la orden:', orderId);
            setShowTechnicianAssignment(false);
            // Recargar la orden para mostrar los técnicos asignados
            // En una implementación real, esto se haría a través de un callback del componente padre
            toast({
              title: "Técnicos Asignados",
              description: "Los técnicos han sido asignados exitosamente a la orden.",
            });
          }}
        />
      )}

      {/* Modal de Rechazo de Orden */}
      <OrderRejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        orderId={order?.id || ''}
        orderPatientName={order?.patientName || ''}
        orderDate={order?.surgeryDate || ''}
        onSubmit={handleSubmitRejection}
      />
    </Dialog>
  );
}; 