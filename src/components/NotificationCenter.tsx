import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  FileText, 
  User, 
  Settings, 
  Trash2,
  Eye,
  EyeOff,
  Filter,
  MoreHorizontal,
  ArrowRight,
  Calendar,
  Package,
  Wrench,
  Shield,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';
import { useNotifications } from '@/hooks/useNotifications';

// Tipos de notificaciones según el lineamiento
export type NotificationType = 
  | 'order_created'
  | 'order_confirmed'
  | 'order_rejected'
  | 'order_approved'
  | 'order_in_preparation'
  | 'order_ready_for_technicians'
  | 'order_completed'
  | 'confirmation_pending'
  | 'payment_received'
  | 'payment_due'
  | 'inventory_low'
  | 'inventory_critical'
  | 'maintenance_due'
  | 'task_assigned'
  | 'task_completed'
  | 'evidence_uploaded'
  | 'reminder_surgery'
  | 'system_alert'
  | 'role_assigned'
  | 'permission_changed';

// Tipos de prioridad
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

// Interface para notificación
export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  dismissed: boolean;
  userId: string;
  relatedEntity?: {
    type: 'order' | 'inventory' | 'task' | 'user' | 'payment';
    id: string;
    name?: string;
  };
  actions?: {
    label: string;
    action: string;
    url?: string;
  }[];
  expiresAt?: string;
}

// Configuración de notificaciones por rol
const NOTIFICATION_CONFIG = {
  [UserRole.ADMINISTRADOR_GENERAL]: {
    types: [
      'order_created', 'order_confirmed', 'order_rejected', 'order_approved', 
      'order_in_preparation', 'order_ready_for_technicians', 'order_completed',
      'payment_received', 'payment_due', 'inventory_low', 'inventory_critical', 'maintenance_due',
      'task_assigned', 'task_completed', 'evidence_uploaded', 'system_alert', 'role_assigned', 'permission_changed'
    ],
    priority: ['critical', 'high', 'medium', 'low']
  },
  [UserRole.GERENTE_COMERCIAL]: {
    types: [
      'order_created', 'order_confirmed', 'order_rejected', 'order_approved',
      'order_in_preparation', 'order_ready_for_technicians', 'confirmation_pending',
      'payment_received', 'payment_due', 'reminder_surgery'
    ],
    priority: ['high', 'medium', 'low']
  },
  [UserRole.GERENTE_OPERATIVO]: {
    types: [
      'order_created', 'order_confirmed', 'order_rejected', 'order_approved',
      'order_in_preparation', 'order_ready_for_technicians',
      'inventory_low', 'inventory_critical', 'task_assigned', 'task_completed',
      'maintenance_due', 'reminder_surgery'
    ],
    priority: ['high', 'medium', 'low']
  },
  [UserRole.JEFE_ALMACEN]: {
    types: [
      'order_approved', 'order_in_preparation', 'order_ready_for_technicians',
      'inventory_low', 'inventory_critical', 'maintenance_due',
      'task_assigned', 'task_completed'
    ],
    priority: ['critical', 'high', 'medium']
  },
  [UserRole.TECNICO]: {
    types: [
      'task_assigned', 'task_completed', 'evidence_uploaded', 'reminder_surgery',
      'maintenance_due'
    ],
    priority: ['high', 'medium', 'low']
  },
  [UserRole.GERENTE_ADMINISTRATIVO]: {
    types: [
      'order_completed', 'payment_received', 'payment_due', 'reminder_surgery'
    ],
    priority: ['high', 'medium', 'low']
  },
  [UserRole.FINANZAS]: {
    types: [
      'order_completed', 'payment_received', 'payment_due', 'reminder_surgery'
    ],
    priority: ['high', 'medium', 'low']
  }
};

// Iconos por tipo de notificación
const getNotificationIcon = (type: NotificationType) => {
  const icons: Record<NotificationType, React.ReactNode> = {
    order_created: <FileText className="h-4 w-4 text-blue-600" />,
    order_confirmed: <CheckCircle className="h-4 w-4 text-green-600" />,
    order_rejected: <AlertTriangle className="h-4 w-4 text-red-600" />,
    order_approved: <CheckCircle className="h-4 w-4 text-green-600" />,
    order_in_preparation: <Package className="h-4 w-4 text-orange-600" />,
    order_ready_for_technicians: <Wrench className="h-4 w-4 text-blue-600" />,
    order_completed: <CheckCircle className="h-4 w-4 text-blue-600" />,
    confirmation_pending: <Clock className="h-4 w-4 text-yellow-600" />,
    payment_received: <DollarSign className="h-4 w-4 text-green-600" />,
    payment_due: <DollarSign className="h-4 w-4 text-red-600" />,
    inventory_low: <Package className="h-4 w-4 text-yellow-600" />,
    inventory_critical: <Package className="h-4 w-4 text-red-600" />,
    maintenance_due: <Wrench className="h-4 w-4 text-orange-600" />,
    task_assigned: <Calendar className="h-4 w-4 text-blue-600" />,
    task_completed: <CheckCircle className="h-4 w-4 text-green-600" />,
    evidence_uploaded: <FileText className="h-4 w-4 text-purple-600" />,
    reminder_surgery: <Calendar className="h-4 w-4 text-indigo-600" />,
    system_alert: <Shield className="h-4 w-4 text-red-600" />,
    role_assigned: <User className="h-4 w-4 text-blue-600" />,
    permission_changed: <Settings className="h-4 w-4 text-gray-600" />
  };
  return icons[type];
};

// Colores por prioridad
const getPriorityColor = (priority: NotificationPriority) => {
  const colors: Record<NotificationPriority, string> = {
    low: 'border-gray-200 bg-gray-50',
    medium: 'border-blue-200 bg-blue-50',
    high: 'border-yellow-200 bg-yellow-50',
    critical: 'border-red-200 bg-red-50'
  };
  return colors[priority];
};

// Colores de badge por prioridad
const getPriorityBadgeColor = (priority: NotificationPriority) => {
  const colors: Record<NotificationPriority, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  };
  return colors[priority];
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNotificationClick,
  className = ''
}) => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    getFilteredNotifications 
  } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'high' | 'critical'>('all');
  const notificationRef = useRef<HTMLDivElement>(null);

  // Cargar notificaciones mock según el rol
  useEffect(() => {
    if (user && notifications.length === 0) {
      loadMockNotifications();
    }
  }, [user, notifications.length]);

  const loadMockNotifications = () => {
    if (!user) return;

    const userConfig = NOTIFICATION_CONFIG[user.role];
    if (!userConfig) return;

    const mockNotifications: Notification[] = [];

    // Generar notificaciones según el rol
    switch (user.role) {
      case UserRole.GERENTE_COMERCIAL:
        mockNotifications.push(
          {
            id: '1',
            type: 'confirmation_pending',
            priority: 'high',
            title: 'Confirmación de equipos pendiente',
            message: 'La orden ORD-2024-001 requiere confirmación de disponibilidad de equipos',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
            dismissed: false,
            userId: user.id,
            relatedEntity: { type: 'order', id: 'ORD-2024-001', name: 'Orden ORD-2024-001' },
            actions: [
              { label: 'Ver orden', action: 'view_order', url: '/orders/ORD-2024-001' },
              { label: 'Confirmar', action: 'confirm_order' }
            ]
          },
          {
            id: '2',
            type: 'order_confirmed',
            priority: 'medium',
            title: 'Orden confirmada',
            message: 'La orden ORD-2024-002 ha sido confirmada por el área operativa',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            read: false,
            dismissed: false,
            userId: user.id,
            relatedEntity: { type: 'order', id: 'ORD-2024-002', name: 'Orden ORD-2024-002' }
          },
          {
            id: '3',
            type: 'payment_received',
            priority: 'low',
            title: 'Pago recibido',
            message: 'Se ha recibido el pago por la orden ORD-2023-098',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            read: true,
            dismissed: false,
            userId: user.id,
            relatedEntity: { type: 'payment', id: 'PAY-2023-098', name: 'Pago ORD-2023-098' }
          }
        );
        break;

      case UserRole.GERENTE_OPERATIVO:
        mockNotifications.push(
          {
            id: '1',
            type: 'order_created',
            priority: 'high',
            title: 'Nueva orden recibida',
            message: 'Se ha recibido una nueva orden que requiere revisión operativa',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            read: false,
            dismissed: false,
            userId: user.id,
            relatedEntity: { type: 'order', id: 'ORD-2024-003', name: 'Orden ORD-2024-003' },
            actions: [
              { label: 'Revisar', action: 'review_order', url: '/orders/ORD-2024-003' }
            ]
          },
          {
            id: '2',
            type: 'inventory_low',
            priority: 'medium',
            title: 'Stock bajo detectado',
            message: 'El producto "Endoscopio Olympus" tiene stock bajo (3 unidades)',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            read: false,
            dismissed: false,
            userId: user.id,
            relatedEntity: { type: 'inventory', id: 'PROD-001', name: 'Endoscopio Olympus' }
          }
        );
        break;

      case UserRole.JEFE_ALMACEN:
        mockNotifications.push(
          {
            id: '1',
            type: 'inventory_critical',
            priority: 'critical',
            title: 'Stock crítico',
            message: 'El producto "Cable HDMI" está agotado. Se requieren 10 unidades urgentemente',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            read: false,
            dismissed: false,
            userId: user.id,
            relatedEntity: { type: 'inventory', id: 'PROD-002', name: 'Cable HDMI' },
            actions: [
              { label: 'Ver inventario', action: 'view_inventory', url: '/inventory' },
              { label: 'Solicitar stock', action: 'request_stock' }
            ]
          }
        );
        break;

      case UserRole.TECNICO:
        mockNotifications.push(
          {
            id: '1',
            type: 'task_assigned',
            priority: 'high',
            title: 'Nueva tarea asignada',
            message: 'Se te ha asignado la instalación de equipos para la cirugía del Dr. García',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            read: false,
            dismissed: false,
            userId: user.id,
            relatedEntity: { type: 'task', id: 'TASK-001', name: 'Instalación equipos' },
            actions: [
              { label: 'Ver tarea', action: 'view_task', url: '/tasks/TASK-001' },
              { label: 'Aceptar', action: 'accept_task' }
            ]
          }
        );
        break;
    }

    // Las notificaciones mock se cargarán automáticamente a través del hook
  };

  const dismissNotification = (notificationId: string) => {
    deleteNotification(notificationId);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  const filteredNotifications = getFilteredNotifications(filter);

  const highPriorityCount = notifications.filter(n => 
    (n.priority === 'high' || n.priority === 'critical') && !n.dismissed
  ).length;

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <Card ref={notificationRef} className={`w-full max-w-md shadow-xl border-0 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              No leídas
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={filter === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('high')}
            >
              Importantes
              {highPriorityCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {highPriorityCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Bell className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">No hay notificaciones</p>
                <p className="text-xs">Las notificaciones aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                        !notification.read ? 'bg-blue-50' : ''
                      } ${getPriorityColor(notification.priority)}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityBadgeColor(notification.priority)}`}
                              >
                                {notification.priority}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notification.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex items-center gap-1">
                                {notification.actions.slice(0, 2).map((action, actionIndex) => (
                                  <Button
                                    key={actionIndex}
                                    variant="outline"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Aquí se manejarían las acciones
                                      console.log('Action:', action.action);
                                    }}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < filteredNotifications.length - 1 && (
                      <Separator />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>

        {filteredNotifications.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpiar todas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Aquí se abriría la vista completa de notificaciones
                  console.log('Ver todas las notificaciones');
                }}
              >
                Ver todas
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Hook para usar notificaciones (usando el hook personalizado)
export const useNotificationsLegacy = () => {
  return useNotifications();
};

export default NotificationCenter; 