import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  OrderStatus,
  StateTransition,
  StateChangeHistory,
  OrderNotification,
  TransitionValidation,
  validateStateTransition,
  getAvailableTransitions,
  generateNotification,
  ORDER_STATE_TRANSITIONS,
  NOTIFICATION_TEMPLATES
} from '@/types/orders';

// Mapeo de roles del contexto de autenticación a roles de órdenes
type OrderUserRole = 
  | 'Gerente Comercial'
  | 'Gerente Operativo'
  | 'Jefe de Almacén'
  | 'Técnico'
  | 'Gerente Administrativo'
  | 'Área de Finanzas'
  | 'Administrador General';

// Hook para manejar el flujo de estados de orden
export const useOrderStateFlow = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener transiciones disponibles para el usuario actual
  const getAvailableTransitionsForUser = useCallback((
    currentStatus: OrderStatus
  ): StateTransition[] => {
    if (!user) return [];
    
    const userRole = user.role as unknown as OrderUserRole;
    return getAvailableTransitions(currentStatus, userRole);
  }, [user]);

  // Validar si una transición es permitida
  const validateTransition = useCallback((
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    hasApproval?: boolean,
    hasReason?: boolean
  ): TransitionValidation => {
    if (!user) {
      return {
        isValid: false,
        allowedRoles: [],
        requiresApproval: false,
        requiresReason: false,
        conditions: [],
        nextSteps: [],
        errors: ['Usuario no autenticado'],
        warnings: []
      };
    }

    const userRole = user.role as unknown as OrderUserRole;
    return validateStateTransition(fromStatus, toStatus, userRole, hasApproval, hasReason);
  }, [user]);

  // Cambiar estado de una orden
  const changeOrderStatus = useCallback(async (
    orderId: string,
    orderNumber: string,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    reason?: string,
    notes?: string,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    stateChange?: StateChangeHistory;
    notifications?: OrderNotification[];
    error?: string;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const userRole = user.role as unknown as OrderUserRole;
      const validation = validateStateTransition(fromStatus, toStatus, userRole, true, !!reason);

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Crear registro de cambio de estado
      const stateChange: StateChangeHistory = {
        id: `state_change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId,
        fromStatus,
        toStatus,
        changedBy: user.name || user.email,
        changedAt: new Date().toISOString(),
        reason,
        notes,
        metadata
      };

      // Generar notificaciones automáticas
      const notifications: OrderNotification[] = [];
      const transition = ORDER_STATE_TRANSITIONS.find(t => 
        t.from === fromStatus && t.to === toStatus
      );

      if (transition?.autoNotifications) {
        // Simular generación de notificaciones basadas en el tipo de transición
        const notificationType = getNotificationType(fromStatus, toStatus);
        
        if (notificationType) {
          // Notificar al comercial sobre aprobación/rechazo
          if (fromStatus === 'pending' && (toStatus === 'approved' || toStatus === 'rejected')) {
            const notification = generateNotification(
              orderId,
              orderNumber,
              notificationType,
              'commercial@tumex.com',
              'Gerente Comercial',
              {
                orderNumber,
                fromStatus: getStatusLabel(fromStatus),
                toStatus: getStatusLabel(toStatus),
                reason: reason || 'Sin motivo especificado',
                date: new Date().toLocaleDateString('es-MX')
              }
            );
            notifications.push(notification);
          }

          // Notificar al gerente operativo sobre cambios de estado
          if (toStatus === 'in_preparation' || toStatus === 'in_transit') {
            const notification = generateNotification(
              orderId,
              orderNumber,
              'status_change',
              'operational@tumex.com',
              'Gerente Operativo',
              {
                orderNumber,
                fromStatus: getStatusLabel(fromStatus),
                toStatus: getStatusLabel(toStatus),
                date: new Date().toLocaleDateString('es-MX')
              }
            );
            notifications.push(notification);
          }

          // Notificar a técnicos sobre asignación
          if (toStatus === 'in_transit') {
            const notification = generateNotification(
              orderId,
              orderNumber,
              'assignment',
              'technicians@tumex.com',
              'Técnico',
              {
                orderNumber,
                date: new Date().toLocaleDateString('es-MX')
              }
            );
            notifications.push(notification);
          }

          // Notificar al gerente administrativo sobre completado
          if (toStatus === 'completed') {
            const notification = generateNotification(
              orderId,
              orderNumber,
              'status_change',
              'administrative@tumex.com',
              'Gerente Administrativo',
              {
                orderNumber,
                fromStatus: getStatusLabel(fromStatus),
                toStatus: getStatusLabel(toStatus),
                date: new Date().toLocaleDateString('es-MX')
              }
            );
            notifications.push(notification);
          }

          // Notificar al área de finanzas sobre facturación
          if (toStatus === 'billed') {
            const notification = generateNotification(
              orderId,
              orderNumber,
              'status_change',
              'finance@tumex.com',
              'Área de Finanzas',
              {
                orderNumber,
                fromStatus: getStatusLabel(fromStatus),
                toStatus: getStatusLabel(toStatus),
                date: new Date().toLocaleDateString('es-MX')
              }
            );
            notifications.push(notification);
          }
        }
      }

      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Aquí se haría la llamada real a la API
      // await api.updateOrderStatus(orderId, toStatus, stateChange, notifications);

      return {
        success: true,
        stateChange,
        notifications
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Obtener historial de cambios de estado
  const getStateChangeHistory = useCallback(async (
    orderId: string
  ): Promise<StateChangeHistory[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock data para demostración
      const mockHistory: StateChangeHistory[] = [
        {
          id: '1',
          orderId,
          fromStatus: 'pending',
          toStatus: 'approved',
          changedBy: 'Gerente Operativo',
          changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          reason: 'Orden aprobada después de revisión de viabilidad',
          notes: 'Equipos disponibles y técnicos asignados'
        },
        {
          id: '2',
          orderId,
          fromStatus: 'approved',
          toStatus: 'in_preparation',
          changedBy: 'Jefe de Almacén',
          changedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          notes: 'Iniciando preparación de equipos'
        },
        {
          id: '3',
          orderId,
          fromStatus: 'in_preparation',
          toStatus: 'in_transit',
          changedBy: 'Jefe de Almacén',
          changedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          notes: 'Equipos preparados y en camino'
        }
      ];

      return mockHistory;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Obtener notificaciones pendientes
  const getPendingNotifications = useCallback(async (
    orderId: string
  ): Promise<OrderNotification[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock data para demostración
      const mockNotifications: OrderNotification[] = [
        {
          id: '1',
          orderId,
          type: 'status_change',
          title: 'Cambio de Estado de Orden',
          message: 'La orden ORD-2024-001 ha cambiado de estado de Pendiente a Aprobada',
          recipient: 'commercial@tumex.com',
          recipientRole: 'Gerente Comercial',
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: 'medium',
          actionUrl: `/orders/${orderId}`
        }
      ];

      return mockNotifications;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Marcar notificación como leída
  const markNotificationAsRead = useCallback(async (
    notificationId: string
  ): Promise<boolean> => {
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Aquí se haría la llamada real a la API
      // await api.markNotificationAsRead(notificationId);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Función helper para obtener el tipo de notificación
  const getNotificationType = (fromStatus: OrderStatus, toStatus: OrderStatus): keyof typeof NOTIFICATION_TEMPLATES | null => {
    if (fromStatus === 'pending' && toStatus === 'approved') return 'approval';
    if (fromStatus === 'pending' && toStatus === 'rejected') return 'rejection';
    if (toStatus === 'in_transit') return 'assignment';
    return 'status_change';
  };

  // Función helper para obtener etiqueta de estado
  const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      in_preparation: 'En Preparación',
      in_transit: 'En Tránsito',
      completed: 'Completada',
      billed: 'Facturada'
    };
    return labels[status];
  };

  // Obtener configuración de estado para la UI
  const getStatusConfig = useCallback((status: OrderStatus) => {
    const configs = {
      pending: {
        label: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: 'Clock',
        description: 'Esperando aprobación del Gerente Operativo'
      },
      approved: {
        label: 'Aprobada',
        color: 'bg-green-100 text-green-800',
        icon: 'CheckCircle',
        description: 'Aprobada y lista para preparación'
      },
      rejected: {
        label: 'Rechazada',
        color: 'bg-red-100 text-red-800',
        icon: 'XCircle',
        description: 'Rechazada por el Gerente Operativo'
      },
      in_preparation: {
        label: 'En Preparación',
        color: 'bg-blue-100 text-blue-800',
        icon: 'Package',
        description: 'Equipos siendo preparados en almacén'
      },
      in_transit: {
        label: 'En Tránsito',
        color: 'bg-purple-100 text-purple-800',
        icon: 'Truck',
        description: 'Equipos en camino al sitio'
      },
      completed: {
        label: 'Completada',
        color: 'bg-gray-100 text-gray-800',
        icon: 'CheckCircle',
        description: 'Cirugía completada exitosamente'
      },
      billed: {
        label: 'Facturada',
        color: 'bg-indigo-100 text-indigo-800',
        icon: 'Receipt',
        description: 'Facturación procesada'
      }
    };
    return configs[status];
  }, []);

  return {
    // Estado
    isLoading,
    error,
    
    // Funciones principales
    getAvailableTransitionsForUser,
    validateTransition,
    changeOrderStatus,
    getStateChangeHistory,
    getPendingNotifications,
    markNotificationAsRead,
    getStatusConfig,
    
    // Funciones helper
    getStatusLabel
  };
}; 