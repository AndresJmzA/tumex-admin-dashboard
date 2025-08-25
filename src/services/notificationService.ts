import { Notification, NotificationType, NotificationPriority } from '@/components/NotificationCenter';
import { UserRole } from '@/contexts/AuthContext';

// Tipos para el servicio de notificaciones
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  actions?: {
    label: string;
    action: string;
    url?: string;
  }[];
  emailTemplate?: string;
  smsTemplate?: string;
  pushTemplate?: string;
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  types: NotificationType[];
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
  };
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'in-app';
  enabled: boolean;
  config?: any;
}

// Configuración de plantillas por tipo de notificación
const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  order_created: {
    id: 'order_created',
    type: 'order_created',
    title: 'Nueva orden creada',
    message: 'Se ha creado una nueva orden que requiere tu atención',
    priority: 'high',
    actions: [
      { label: 'Ver orden', action: 'view_order', url: '/orders/{orderId}' },
      { label: 'Revisar', action: 'review_order' }
    ],
    emailTemplate: 'Nueva orden {orderNumber} creada para {customer}. Fecha: {date}',
    smsTemplate: 'Nueva orden {orderNumber} - {customer}',
    pushTemplate: 'Nueva orden: {orderNumber}'
  },
  order_confirmed: {
    id: 'order_confirmed',
    type: 'order_confirmed',
    title: 'Orden confirmada',
    message: 'La orden ha sido confirmada y está lista para procesamiento',
    priority: 'medium',
    actions: [
      { label: 'Ver orden', action: 'view_order', url: '/orders/{orderId}' }
    ],
    emailTemplate: 'Orden {orderNumber} confirmada por {doctor}',
    smsTemplate: 'Orden {orderNumber} confirmada',
    pushTemplate: 'Orden confirmada: {orderNumber}'
  },
  order_rejected: {
    id: 'order_rejected',
    type: 'order_rejected',
    title: 'Orden rechazada',
    message: 'La orden ha sido rechazada. Revisa los detalles',
    priority: 'high',
    actions: [
      { label: 'Ver orden', action: 'view_order', url: '/orders/{orderId}' },
      { label: 'Contactar', action: 'contact_customer' }
    ],
    emailTemplate: 'Orden {orderNumber} rechazada. Motivo: {reason}',
    smsTemplate: 'Orden {orderNumber} rechazada',
    pushTemplate: 'Orden rechazada: {orderNumber}'
  },
  order_approved: {
    id: 'order_approved',
    type: 'order_approved',
    title: 'Orden aprobada',
    message: 'La orden ha sido aprobada y está lista para asignación',
    priority: 'medium',
    actions: [
      { label: 'Ver orden', action: 'view_order', url: '/orders/{orderId}' },
      { label: 'Asignar técnicos', action: 'assign_technicians' }
    ],
    emailTemplate: 'Orden {orderNumber} aprobada para {surgery}',
    smsTemplate: 'Orden {orderNumber} aprobada',
    pushTemplate: 'Orden aprobada: {orderNumber}'
  },
  order_in_preparation: {
    id: 'order_in_preparation',
    type: 'order_in_preparation',
    title: 'Orden en preparación',
    message: 'La orden ha sido enviada a almacén para preparación',
    priority: 'medium',
    actions: [
      { label: 'Ver orden', action: 'view_order', url: '/orders/{orderId}' },
      { label: 'Preparar equipos', action: 'prepare_equipment' }
    ],
    emailTemplate: 'Orden {orderNumber} enviada a almacén para preparación',
    smsTemplate: 'Orden {orderNumber} en preparación',
    pushTemplate: 'Orden en preparación: {orderNumber}'
  },
  order_ready_for_technicians: {
    id: 'order_ready_for_technicians',
    type: 'order_ready_for_technicians',
    title: 'Orden lista para técnicos',
    message: 'La orden está lista para asignar técnicos',
    priority: 'high',
    actions: [
      { label: 'Ver orden', action: 'view_order', url: '/orders/{orderId}' },
      { label: 'Asignar técnicos', action: 'assign_technicians' }
    ],
    emailTemplate: 'Orden {orderNumber} lista para asignar técnicos',
    smsTemplate: 'Orden {orderNumber} lista para técnicos',
    pushTemplate: 'Orden lista para técnicos: {orderNumber}'
  },
  order_completed: {
    id: 'order_completed',
    type: 'order_completed',
    title: 'Orden completada',
    message: 'La orden ha sido completada exitosamente',
    priority: 'low',
    actions: [
      { label: 'Ver orden', action: 'view_order', url: '/orders/{orderId}' },
      { label: 'Generar factura', action: 'generate_invoice' }
    ],
    emailTemplate: 'Orden {orderNumber} completada. Total: ${amount}',
    smsTemplate: 'Orden {orderNumber} completada',
    pushTemplate: 'Orden completada: {orderNumber}'
  },
  confirmation_pending: {
    id: 'confirmation_pending',
    type: 'confirmation_pending',
    title: 'Confirmación pendiente',
    message: 'Se requiere confirmación de equipos para la orden',
    priority: 'high',
    actions: [
      { label: 'Confirmar', action: 'confirm_equipment' },
      { label: 'Ver detalles', action: 'view_order', url: '/orders/{orderId}' }
    ],
    emailTemplate: 'Confirmación pendiente para orden {orderNumber}',
    smsTemplate: 'Confirmación pendiente: {orderNumber}',
    pushTemplate: 'Confirmación pendiente: {orderNumber}'
  },
  payment_received: {
    id: 'payment_received',
    type: 'payment_received',
    title: 'Pago recibido',
    message: 'Se ha recibido el pago por la orden',
    priority: 'low',
    actions: [
      { label: 'Ver pago', action: 'view_payment' },
      { label: 'Generar recibo', action: 'generate_receipt' }
    ],
    emailTemplate: 'Pago recibido por orden {orderNumber}. Monto: ${amount}',
    smsTemplate: 'Pago recibido: ${amount}',
    pushTemplate: 'Pago recibido: ${amount}'
  },
  payment_due: {
    id: 'payment_due',
    type: 'payment_due',
    title: 'Pago pendiente',
    message: 'Hay un pago pendiente por la orden',
    priority: 'medium',
    actions: [
      { label: 'Ver orden', action: 'view_order', url: '/orders/{orderId}' },
      { label: 'Contactar cliente', action: 'contact_customer' }
    ],
    emailTemplate: 'Pago pendiente por orden {orderNumber}. Monto: ${amount}',
    smsTemplate: 'Pago pendiente: ${amount}',
    pushTemplate: 'Pago pendiente: ${amount}'
  },
  inventory_low: {
    id: 'inventory_low',
    type: 'inventory_low',
    title: 'Stock bajo',
    message: 'Un producto tiene stock bajo y requiere atención',
    priority: 'medium',
    actions: [
      { label: 'Ver inventario', action: 'view_inventory', url: '/inventory' },
      { label: 'Solicitar stock', action: 'request_stock' }
    ],
    emailTemplate: 'Stock bajo: {product} ({quantity} unidades)',
    smsTemplate: 'Stock bajo: {product}',
    pushTemplate: 'Stock bajo: {product}'
  },
  inventory_critical: {
    id: 'inventory_critical',
    type: 'inventory_critical',
    title: 'Stock crítico',
    message: 'Un producto está agotado y requiere acción inmediata',
    priority: 'critical',
    actions: [
      { label: 'Ver inventario', action: 'view_inventory', url: '/inventory' },
      { label: 'Solicitar urgente', action: 'request_urgent_stock' }
    ],
    emailTemplate: 'STOCK CRÍTICO: {product} agotado',
    smsTemplate: 'STOCK CRÍTICO: {product}',
    pushTemplate: 'STOCK CRÍTICO: {product}'
  },
  maintenance_due: {
    id: 'maintenance_due',
    type: 'maintenance_due',
    title: 'Mantenimiento programado',
    message: 'Un equipo requiere mantenimiento programado',
    priority: 'medium',
    actions: [
      { label: 'Ver equipos', action: 'view_equipment', url: '/equipment' },
      { label: 'Programar', action: 'schedule_maintenance' }
    ],
    emailTemplate: 'Mantenimiento programado: {equipment}',
    smsTemplate: 'Mantenimiento: {equipment}',
    pushTemplate: 'Mantenimiento: {equipment}'
  },
  task_assigned: {
    id: 'task_assigned',
    type: 'task_assigned',
    title: 'Nueva tarea asignada',
    message: 'Se te ha asignado una nueva tarea',
    priority: 'high',
    actions: [
      { label: 'Ver tarea', action: 'view_task', url: '/tasks/{taskId}' },
      { label: 'Aceptar', action: 'accept_task' }
    ],
    emailTemplate: 'Nueva tarea asignada: {taskName} para {orderNumber}',
    smsTemplate: 'Nueva tarea: {taskName}',
    pushTemplate: 'Nueva tarea: {taskName}'
  },
  task_completed: {
    id: 'task_completed',
    type: 'task_completed',
    title: 'Tarea completada',
    message: 'Una tarea ha sido completada exitosamente',
    priority: 'low',
    actions: [
      { label: 'Ver tarea', action: 'view_task', url: '/tasks/{taskId}' },
      { label: 'Ver evidencia', action: 'view_evidence' }
    ],
    emailTemplate: 'Tarea completada: {taskName} por {technician}',
    smsTemplate: 'Tarea completada: {taskName}',
    pushTemplate: 'Tarea completada: {taskName}'
  },
  evidence_uploaded: {
    id: 'evidence_uploaded',
    type: 'evidence_uploaded',
    title: 'Evidencia subida',
    message: 'Se ha subido nueva evidencia para la tarea',
    priority: 'low',
    actions: [
      { label: 'Ver evidencia', action: 'view_evidence' },
      { label: 'Ver tarea', action: 'view_task', url: '/tasks/{taskId}' }
    ],
    emailTemplate: 'Evidencia subida por {technician} para {taskName}',
    smsTemplate: 'Evidencia subida: {taskName}',
    pushTemplate: 'Evidencia subida: {taskName}'
  },
  reminder_surgery: {
    id: 'reminder_surgery',
    type: 'reminder_surgery',
    title: 'Recordatorio de cirugía',
    message: 'Recordatorio de cirugía programada',
    priority: 'medium',
    actions: [
      { label: 'Ver orden', action: 'view_order', url: '/orders/{orderId}' },
      { label: 'Confirmar asistencia', action: 'confirm_attendance' }
    ],
    emailTemplate: 'Recordatorio: Cirugía {surgery} el {date} a las {time}',
    smsTemplate: 'Recordatorio: {surgery} {date} {time}',
    pushTemplate: 'Recordatorio: {surgery}'
  },
  system_alert: {
    id: 'system_alert',
    type: 'system_alert',
    title: 'Alerta del sistema',
    message: 'Alerta importante del sistema',
    priority: 'critical',
    actions: [
      { label: 'Ver detalles', action: 'view_alert' },
      { label: 'Contactar soporte', action: 'contact_support' }
    ],
    emailTemplate: 'ALERTA DEL SISTEMA: {message}',
    smsTemplate: 'ALERTA: {message}',
    pushTemplate: 'ALERTA: {message}'
  },
  role_assigned: {
    id: 'role_assigned',
    type: 'role_assigned',
    title: 'Rol asignado',
    message: 'Se te ha asignado un nuevo rol en el sistema',
    priority: 'medium',
    actions: [
      { label: 'Ver perfil', action: 'view_profile', url: '/profile' },
      { label: 'Ver permisos', action: 'view_permissions' }
    ],
    emailTemplate: 'Nuevo rol asignado: {role}',
    smsTemplate: 'Nuevo rol: {role}',
    pushTemplate: 'Nuevo rol: {role}'
  },
  permission_changed: {
    id: 'permission_changed',
    type: 'permission_changed',
    title: 'Permisos actualizados',
    message: 'Tus permisos han sido actualizados',
    priority: 'medium',
    actions: [
      { label: 'Ver permisos', action: 'view_permissions' },
      { label: 'Ver perfil', action: 'view_profile', url: '/profile' }
    ],
    emailTemplate: 'Permisos actualizados: {changes}',
    smsTemplate: 'Permisos actualizados',
    pushTemplate: 'Permisos actualizados'
  }
};

// Configuración de notificaciones por rol
const ROLE_NOTIFICATION_CONFIG: Record<UserRole, {
  types: NotificationType[];
  priority: NotificationPriority[];
  channels: NotificationChannel[];
}> = {
  [UserRole.ADMINISTRADOR_GENERAL]: {
    types: [
      'order_created', 'order_confirmed', 'order_rejected', 'order_approved', 'order_completed',
      'payment_received', 'payment_due', 'inventory_low', 'inventory_critical', 'maintenance_due',
      'task_assigned', 'task_completed', 'evidence_uploaded', 'system_alert', 'role_assigned', 'permission_changed'
    ],
    priority: ['critical', 'high', 'medium', 'low'],
    channels: [
      { type: 'email', enabled: true },
      { type: 'sms', enabled: true },
      { type: 'push', enabled: true },
      { type: 'in-app', enabled: true }
    ]
  },
  [UserRole.GERENTE_COMERCIAL]: {
    types: [
      'order_created', 'order_confirmed', 'order_rejected', 'confirmation_pending',
      'payment_received', 'payment_due', 'reminder_surgery'
    ],
    priority: ['high', 'medium', 'low'],
    channels: [
      { type: 'email', enabled: true },
      { type: 'sms', enabled: true },
      { type: 'push', enabled: true },
      { type: 'in-app', enabled: true }
    ]
  },
  [UserRole.GERENTE_OPERATIVO]: {
    types: [
      'order_created', 'order_confirmed', 'order_rejected', 'order_approved',
      'inventory_low', 'inventory_critical', 'task_assigned', 'task_completed',
      'maintenance_due', 'reminder_surgery'
    ],
    priority: ['high', 'medium', 'low'],
    channels: [
      { type: 'email', enabled: true },
      { type: 'sms', enabled: true },
      { type: 'push', enabled: true },
      { type: 'in-app', enabled: true }
    ]
  },
  [UserRole.JEFE_ALMACEN]: {
    types: [
      'order_approved', 'inventory_low', 'inventory_critical', 'maintenance_due',
      'task_assigned', 'task_completed'
    ],
    priority: ['critical', 'high', 'medium'],
    channels: [
      { type: 'email', enabled: true },
      { type: 'sms', enabled: true },
      { type: 'push', enabled: true },
      { type: 'in-app', enabled: true }
    ]
  },
  [UserRole.TECNICO]: {
    types: [
      'task_assigned', 'task_completed', 'evidence_uploaded', 'reminder_surgery',
      'maintenance_due'
    ],
    priority: ['high', 'medium', 'low'],
    channels: [
      { type: 'email', enabled: false },
      { type: 'sms', enabled: true },
      { type: 'push', enabled: true },
      { type: 'in-app', enabled: true }
    ]
  },
  [UserRole.GERENTE_ADMINISTRATIVO]: {
    types: [
      'order_completed', 'payment_received', 'payment_due', 'reminder_surgery'
    ],
    priority: ['high', 'medium', 'low'],
    channels: [
      { type: 'email', enabled: true },
      { type: 'sms', enabled: false },
      { type: 'push', enabled: true },
      { type: 'in-app', enabled: true }
    ]
  },
  [UserRole.FINANZAS]: {
    types: [
      'order_completed', 'payment_received', 'payment_due', 'reminder_surgery'
    ],
    priority: ['high', 'medium', 'low'],
    channels: [
      { type: 'email', enabled: true },
      { type: 'sms', enabled: false },
      { type: 'push', enabled: true },
      { type: 'in-app', enabled: true }
    ]
  },
  [UserRole.MEDICO]: {
    types: [
      'order_confirmed', 'order_rejected', 'reminder_surgery'
    ],
    priority: ['high', 'medium'],
    channels: [
      { type: 'email', enabled: true },
      { type: 'sms', enabled: true },
      { type: 'push', enabled: true },
      { type: 'in-app', enabled: true }
    ]
  }
};

class NotificationService {
  private static instance: NotificationService;
  private subscribers: Map<string, (notification: Notification) => void> = new Map();

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Crear notificación automática basada en eventos del sistema
  async createNotification(
    type: NotificationType,
    userId: string,
    userRole: UserRole,
    data: Record<string, any> = {}
  ): Promise<Notification | null> {
    const template = NOTIFICATION_TEMPLATES[type];
    if (!template) {
      console.error(`Template not found for notification type: ${type}`);
      return null;
    }

    const roleConfig = ROLE_NOTIFICATION_CONFIG[userRole];
    if (!roleConfig || !roleConfig.types.includes(type)) {
      console.log(`Notification type ${type} not allowed for role ${userRole}`);
      return null;
    }

    // Reemplazar variables en el template
    const title = this.replaceVariables(template.title, data);
    const message = this.replaceVariables(template.message, data);

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      type,
      priority: template.priority,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      dismissed: false,
      userId,
      relatedEntity: data.relatedEntity,
      actions: template.actions?.map(action => ({
        ...action,
        url: action.url ? this.replaceVariables(action.url, data) : undefined
      })),
      expiresAt: data.expiresAt
    };

    // Guardar en localStorage
    this.saveNotification(notification);

    // Enviar por canales configurados
    await this.sendNotification(notification, userRole, data);

    // Notificar a suscriptores
    this.notifySubscribers(notification);

    return notification;
  }

  // Reemplazar variables en templates
  private replaceVariables(template: string, data: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  // Guardar notificación en localStorage
  private saveNotification(notification: Notification): void {
    try {
      const key = `notifications_${notification.userId}`;
      const existing = localStorage.getItem(key);
      const notifications = existing ? JSON.parse(existing) : [];
      
      notifications.unshift(notification);
      
      // Mantener solo las últimas 100 notificaciones
      if (notifications.length > 100) {
        notifications.splice(100);
      }
      
      localStorage.setItem(key, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  // Enviar notificación por canales configurados
  private async sendNotification(
    notification: Notification,
    userRole: UserRole,
    data: Record<string, any>
  ): Promise<void> {
    const roleConfig = ROLE_NOTIFICATION_CONFIG[userRole];
    if (!roleConfig) return;

    const template = NOTIFICATION_TEMPLATES[notification.type];
    if (!template) return;

    const promises: Promise<void>[] = [];

    // Email
    if (roleConfig.channels.find(c => c.type === 'email')?.enabled && template.emailTemplate) {
      promises.push(this.sendEmail(notification, template.emailTemplate, data));
    }

    // SMS
    if (roleConfig.channels.find(c => c.type === 'sms')?.enabled && template.smsTemplate) {
      promises.push(this.sendSMS(notification, template.smsTemplate, data));
    }

    // Push
    if (roleConfig.channels.find(c => c.type === 'push')?.enabled && template.pushTemplate) {
      promises.push(this.sendPushNotification(notification, template.pushTemplate, data));
    }

    await Promise.allSettled(promises);
  }

  // Simular envío de email
  private async sendEmail(notification: Notification, template: string, data: Record<string, any>): Promise<void> {
    const emailContent = this.replaceVariables(template, data);
    
    // Aquí se integraría con un servicio de email real
    console.log('📧 Email enviado:', {
      to: data.email || 'user@example.com',
      subject: notification.title,
      content: emailContent
    });

    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Simular envío de SMS
  private async sendSMS(notification: Notification, template: string, data: Record<string, any>): Promise<void> {
    const smsContent = this.replaceVariables(template, data);
    
    // Aquí se integraría con un servicio de SMS real
    console.log('📱 SMS enviado:', {
      to: data.phone || '+1234567890',
      content: smsContent
    });

    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Simular notificación push
  private async sendPushNotification(notification: Notification, template: string, data: Record<string, any>): Promise<void> {
    const pushContent = this.replaceVariables(template, data);
    
    // Aquí se integraría con un servicio de push real
    console.log('🔔 Push notification:', {
      to: data.deviceToken || 'device_token',
      title: notification.title,
      body: pushContent
    });

    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Suscribirse a notificaciones
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    this.subscribers.set(userId, callback);
    
    return () => {
      this.subscribers.delete(userId);
    };
  }

  // Notificar a suscriptores
  private notifySubscribers(notification: Notification): void {
    const callback = this.subscribers.get(notification.userId);
    if (callback) {
      callback(notification);
    }
  }

  // Obtener notificaciones de un usuario
  getNotifications(userId: string): Notification[] {
    try {
      const key = `notifications_${userId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Marcar como leída
  markAsRead(userId: string, notificationId: string): void {
    try {
      const key = `notifications_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const notifications = JSON.parse(stored);
        const updated = notifications.map((n: Notification) => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        localStorage.setItem(key, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Marcar todas como leídas
  markAllAsRead(userId: string): void {
    try {
      const key = `notifications_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const notifications = JSON.parse(stored);
        const updated = notifications.map((n: Notification) => ({ ...n, read: true }));
        localStorage.setItem(key, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Eliminar notificación
  deleteNotification(userId: string, notificationId: string): void {
    try {
      const key = `notifications_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const notifications = JSON.parse(stored);
        const updated = notifications.filter((n: Notification) => n.id !== notificationId);
        localStorage.setItem(key, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  // Limpiar todas las notificaciones
  clearAllNotifications(userId: string): void {
    try {
      const key = `notifications_${userId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // Obtener contador de no leídas
  getUnreadCount(userId: string): number {
    const notifications = this.getNotifications(userId);
    return notifications.filter(n => !n.read && !n.dismissed).length;
  }

  // Verificar si está en horas silenciosas
  isQuietHours(): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Configuración de horas silenciosas (22:00 - 08:00)
    const quietStart = 22 * 60; // 22:00
    const quietEnd = 8 * 60; // 08:00
    
    if (quietStart > quietEnd) {
      // Horas silenciosas cruzan la medianoche
      return currentTime >= quietStart || currentTime <= quietEnd;
    } else {
      return currentTime >= quietStart && currentTime <= quietEnd;
    }
  }
}

// Instancia singleton
export const notificationService = NotificationService.getInstance();

// Funciones helper para crear notificaciones específicas
export const createOrderNotification = async (
  type: 'order_created' | 'order_confirmed' | 'order_rejected' | 'order_approved' | 'order_in_preparation' | 'order_ready_for_technicians' | 'order_completed',
  userId: string,
  userRole: UserRole,
  orderData: {
    orderId: string;
    orderNumber: string;
    customer: string;
    doctor?: string;
    surgery?: string;
    date?: string;
    time?: string;
    amount?: number;
    reason?: string;
  }
) => {
  return await notificationService.createNotification(type, userId, userRole, {
    ...orderData,
    relatedEntity: { type: 'order', id: orderData.orderId, name: orderData.orderNumber }
  });
};

export const createTaskNotification = async (
  type: 'task_assigned' | 'task_completed',
  userId: string,
  userRole: UserRole,
  taskData: {
    taskId: string;
    taskName: string;
    orderNumber?: string;
    technician?: string;
  }
) => {
  return await notificationService.createNotification(type, userId, userRole, {
    ...taskData,
    relatedEntity: { type: 'task', id: taskData.taskId, name: taskData.taskName }
  });
};

export const createInventoryNotification = async (
  type: 'inventory_low' | 'inventory_critical',
  userId: string,
  userRole: UserRole,
  inventoryData: {
    productId: string;
    product: string;
    quantity: number;
  }
) => {
  return await notificationService.createNotification(type, userId, userRole, {
    ...inventoryData,
    relatedEntity: { type: 'inventory', id: inventoryData.productId, name: inventoryData.product }
  });
};

export const createPaymentNotification = async (
  type: 'payment_received' | 'payment_due',
  userId: string,
  userRole: UserRole,
  paymentData: {
    orderNumber: string;
    amount: number;
    paymentId?: string;
  }
) => {
  return await notificationService.createNotification(type, userId, userRole, {
    ...paymentData,
    relatedEntity: { type: 'payment', id: paymentData.paymentId || paymentData.orderNumber, name: `Pago ${paymentData.orderNumber}` }
  });
};

// Nueva función para notificar cambios de estado de órdenes
export const createOrderStatusChangeNotification = async (
  newStatus: 'in_preparation' | 'ready_for_technicians',
  orderData: {
    orderId: string;
    orderNumber: string;
    customer: string;
    surgery?: string;
    date?: string;
    changedBy: string;
    changedByRole: UserRole;
  }
) => {
  // Determinar el tipo de notificación basado en el nuevo estado
  const notificationType = newStatus === 'in_preparation' ? 'order_in_preparation' : 'order_ready_for_technicians';
  
  // Obtener todos los usuarios que deben recibir esta notificación
  const usersToNotify = await getUsersToNotifyForOrderStatus(newStatus, orderData.changedByRole);
  
  // Crear notificaciones para cada usuario
  const notifications = await Promise.all(
    usersToNotify.map(user => 
      notificationService.createNotification(notificationType, user.id, user.role, {
        ...orderData,
        relatedEntity: { type: 'order', id: orderData.orderId, name: orderData.orderNumber }
      })
    )
  );
  
  return notifications.filter(Boolean); // Filtrar notificaciones fallidas
};

// Función helper para determinar qué usuarios notificar según el cambio de estado
const getUsersToNotifyForOrderStatus = async (
  newStatus: 'in_preparation' | 'ready_for_technicians',
  changedByRole: UserRole
): Promise<Array<{ id: string; role: UserRole }>> => {
  // Esta función simula obtener usuarios de la base de datos
  // En una implementación real, se consultaría Supabase
  
  const users: Array<{ id: string; role: UserRole }> = [];
  
  if (newStatus === 'in_preparation') {
    // Notificar a Jefes de Almacén y Administradores
    users.push(
      { id: 'warehouse-manager-1', role: UserRole.JEFE_ALMACEN },
      { id: 'admin-1', role: UserRole.ADMINISTRADOR_GENERAL }
    );
  } else if (newStatus === 'ready_for_technicians') {
    // Notificar a Gerentes Operativos y Administradores
    users.push(
      { id: 'operational-manager-1', role: UserRole.GERENTE_OPERATIVO },
      { id: 'admin-1', role: UserRole.ADMINISTRADOR_GENERAL }
    );
  }
  
  return users;
};

export default notificationService; 