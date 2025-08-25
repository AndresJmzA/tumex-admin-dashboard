// Tipos para el sistema de órdenes y flujo de estados

// Estados de orden según el flujo de TUMex
export type OrderStatus = 
  // Estados iniciales
  | 'created'           // Creada
  | 'pending_objects'   // Pendiente de Objetos (NUEVO)
  | 'approved'          // Aceptada
  | 'rejected'          // Rechazada
  | 'doctor_approved'   // Aceptada por médico
  | 'doctor_rejected'   // Rechazada por médico
  | 'objects_confirmed' // Objetos Confirmados (NUEVO)
  // Estados de procesamiento
  | 'in_preparation'    // En preparación
  | 'ready_for_technicians' // Lista para Técnicos (NUEVO)
  | 'assigned'          // Asignada
  | 'in_transit'        // En tránsito
  | 'in_progress'       // En proceso
  | 'returned'          // De vuelta
  | 'completed';        // Cerrada

// Información de la orden
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  
  // Información del médico
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  doctorCedula?: string;
  
  // Información del paciente
  patientName: string;
  surgeryDate: string;
  surgeryTime: string;
  
  // Información de cobertura
  typeOfCoverage: 'Privado' | 'Seguro';
  insuranceName?: string;
  policyNumber?: string;
  authorizationNumber?: string;
  
  // Información de cirugía
  surgeryTypeId: string;
  surgeryTypeName: string;
  procedureId: string;
  procedureName: string;
  templateId?: string;
  templateName?: string;
  
  // Productos y equipos
  selectedProducts: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
  
  // Técnicos asignados
  assignedTechnicians: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  
  // Información adicional
  notes: string;
  commercialNotes: string;
  orderSource: 'correo' | 'whatsapp' | 'llamada' | 'app';
  
  // Historial de cambios
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    changedBy: string;
    notes?: string;
  }>;
  
  // Validaciones
  surgeryOverlap: boolean;
  equipmentAvailability: {
    unavailableEquipment: string[];
    warnings: string[];
  };
  technicianAvailability: {
    unavailableTechnicians: string[];
    warnings: string[];
  };
}

// Estados con sus etiquetas en español
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  created: 'Creada',
  pending_objects: 'Pendiente de Objetos',
  approved: 'Aceptada',
  rejected: 'Rechazada',
  doctor_approved: 'Aceptada por médico',
  doctor_rejected: 'Rechazada por médico',
  objects_confirmed: 'Objetos Confirmados',
  in_preparation: 'En preparación',
  ready_for_technicians: 'Lista para Técnicos',
  assigned: 'Asignada',
  in_transit: 'En tránsito',
  in_progress: 'En proceso',
  returned: 'De vuelta',
  completed: 'Cerrada'
};

// Estados con sus colores
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  created: 'bg-blue-100 text-blue-800',
  pending_objects: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  doctor_approved: 'bg-emerald-100 text-emerald-800',
  doctor_rejected: 'bg-orange-100 text-orange-800',
  objects_confirmed: 'bg-teal-100 text-teal-800',
  in_preparation: 'bg-yellow-100 text-yellow-800',
  ready_for_technicians: 'bg-purple-100 text-purple-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-cyan-100 text-cyan-800',
  returned: 'bg-gray-100 text-gray-800',
  completed: 'bg-green-100 text-green-800'
};

// Estados que requieren acción
export const PENDING_ACTION_STATUSES: OrderStatus[] = [
  'created',
  'pending_objects',
  'approved',
  'doctor_approved',
  'objects_confirmed',
  'in_preparation',
  'assigned'
];

// Estados finales
export const FINAL_STATUSES: OrderStatus[] = [
  'rejected',
  'doctor_rejected',
  'completed'
];

// Estados de pago
export type PaymentStatus = 
  | 'pending'           // Pendiente
  | 'partial'           // Parcial
  | 'paid'              // Pagado
  | 'overdue'           // Vencido
  | 'cancelled';        // Cancelado

// Prioridades de orden
export type OrderPriority = 
  | 'low'               // Baja
  | 'medium'            // Media
  | 'high'              // Alta
  | 'critical';         // Crítica

// Urgencia de orden
export type OrderUrgency = 
  | 'routine'           // Rutinaria
  | 'urgent'            // Urgente
  | 'emergency';        // Emergencia

// Nivel de riesgo
export type RiskLevel = 
  | 'low'               // Bajo
  | 'medium'            // Medio
  | 'high';             // Alto

// Complejidad de la cirugía
export type SurgeryComplexity = 
  | 'simple'            // Simple
  | 'moderate'          // Moderada
  | 'complex';          // Compleja

// Roles que pueden realizar transiciones
export type UserRole = 
  | 'Gerente Comercial'
  | 'Gerente Operativo'
  | 'Jefe de Almacén'
  | 'Técnico'
  | 'Gerente Administrativo'
  | 'Área de Finanzas'
  | 'Administrador General';

// Tipos de transiciones de estado
export type StateTransition = {
  from: OrderStatus;
  to: OrderStatus;
  allowedRoles: UserRole[];
  requiresApproval?: boolean;
  requiresReason?: boolean;
  autoNotifications?: string[];
  conditions?: string[];
  nextSteps?: string[];
};

// Historial de cambios de estado
export interface StateChangeHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

// Notificación automática
export interface OrderNotification {
  id: string;
  orderId: string;
  type: 'status_change' | 'approval' | 'rejection' | 'assignment' | 'reminder' | 'overdue';
  title: string;
  message: string;
  recipient: string;
  recipientRole: UserRole;
  sentAt: string;
  read: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Configuración de transiciones por rol
export const ORDER_STATE_TRANSITIONS: StateTransition[] = [
  // Transiciones desde Creada
  {
    from: 'created',
    to: 'pending_objects',
    allowedRoles: ['Gerente Comercial'],
    autoNotifications: ['commercial_manager'],
    nextSteps: ['call_doctor', 'confirm_objects']
  },
  {
    from: 'created',
    to: 'approved',
    allowedRoles: ['Gerente Operativo'],
    requiresApproval: true,
    autoNotifications: ['commercial_manager'],
    nextSteps: ['assign_technicians', 'generate_template']
  },
  {
    from: 'created',
    to: 'rejected',
    allowedRoles: ['Gerente Operativo'],
    requiresApproval: true,
    requiresReason: true,
    autoNotifications: ['commercial_manager'],
    nextSteps: ['archive_order', 'notify_commercial']
  },

  // Transiciones desde Pendiente de Objetos
  {
    from: 'pending_objects',
    to: 'objects_confirmed',
    allowedRoles: ['Gerente Comercial'],
    autoNotifications: ['operational_manager'],
    nextSteps: ['prepare_equipment', 'verify_stock']
  },
  {
    from: 'pending_objects',
    to: 'rejected',
    allowedRoles: ['Gerente Comercial'],
    requiresReason: true,
    autoNotifications: ['commercial_manager'],
    nextSteps: ['archive_order', 'notify_commercial']
  },

  // Transiciones desde Objetos Confirmados
  {
    from: 'objects_confirmed',
    to: 'approved',
    allowedRoles: ['Gerente Operativo'],
    requiresApproval: true,
    autoNotifications: ['commercial_manager'],
    nextSteps: ['assign_technicians', 'generate_template']
  },

  // Transiciones desde Aprobada
  {
    from: 'approved',
    to: 'in_preparation',
    allowedRoles: ['Jefe de Almacén'],
    autoNotifications: ['operational_manager'],
    nextSteps: ['prepare_equipment', 'verify_stock']
  },

  // Transiciones desde En Preparación
  {
    from: 'in_preparation',
    to: 'ready_for_technicians',
    allowedRoles: ['Jefe de Almacén'],
    autoNotifications: ['operational_manager'],
    nextSteps: ['assign_technicians', 'update_calendar']
  },

  // Transiciones desde Lista para Técnicos (NUEVO)
  {
    from: 'ready_for_technicians',
    to: 'assigned',
    allowedRoles: ['Gerente Operativo'],
    autoNotifications: ['technicians', 'operational_manager'],
    nextSteps: ['update_calendar', 'notify_technicians']
  },

  // Transiciones desde Asignada
  {
    from: 'assigned',
    to: 'in_transit',
    allowedRoles: ['Técnico'],
    autoNotifications: ['operational_manager'],
    nextSteps: ['update_location', 'start_tracking']
  },

  // Transiciones desde En Tránsito
  {
    from: 'in_transit',
    to: 'in_progress',
    allowedRoles: ['Técnico'],
    autoNotifications: ['operational_manager'],
    nextSteps: ['setup_equipment', 'verify_conditions']
  },

  // Transiciones desde En Proceso
  {
    from: 'in_progress',
    to: 'completed',
    allowedRoles: ['Técnico'],
    autoNotifications: ['operational_manager', 'administrative_manager'],
    nextSteps: ['upload_evidence', 'record_charges']
  },

  // Transiciones de reversión (solo en casos especiales)
  {
    from: 'in_preparation',
    to: 'approved',
    allowedRoles: ['Gerente Operativo'],
    requiresApproval: true,
    requiresReason: true,
    autoNotifications: ['warehouse_manager'],
    conditions: ['equipment_unavailable', 'stock_issues']
  },
  {
    from: 'in_transit',
    to: 'in_preparation',
    allowedRoles: ['Gerente Operativo'],
    requiresApproval: true,
    requiresReason: true,
    autoNotifications: ['technicians', 'warehouse_manager'],
    conditions: ['equipment_issues', 'scheduling_conflicts']
  }
];

// Configuración de notificaciones por tipo de cambio
export const NOTIFICATION_TEMPLATES = {
  status_change: {
    title: 'Cambio de Estado de Orden',
    message: 'La orden {orderNumber} ha cambiado de estado de {fromStatus} a {toStatus}',
    priority: 'medium' as const
  },
  approval: {
    title: 'Orden Aprobada',
    message: 'Su orden {orderNumber} ha sido aprobada y está lista para preparación',
    priority: 'high' as const
  },
  rejection: {
    title: 'Orden Rechazada',
    message: 'Su orden {orderNumber} ha sido rechazada. Motivo: {reason}',
    priority: 'high' as const
  },
  assignment: {
    title: 'Asignación de Técnicos',
    message: 'Ha sido asignado a la orden {orderNumber} programada para {date}',
    priority: 'medium' as const
  },
  reminder: {
    title: 'Recordatorio de Orden',
    message: 'Recordatorio: La orden {orderNumber} está programada para {date}',
    priority: 'low' as const
  },
  overdue: {
    title: 'Orden Vencida',
    message: 'La orden {orderNumber} ha vencido y requiere atención inmediata',
    priority: 'critical' as const
  }
};

// Configuración de permisos por rol para cambios de estado
export const ROLE_STATE_PERMISSIONS: Record<UserRole, OrderStatus[]> = {
  'Gerente Comercial': ['created', 'pending_objects', 'objects_confirmed'],
  'Gerente Operativo': ['created', 'pending_objects', 'approved', 'objects_confirmed', 'in_preparation', 'ready_for_technicians', 'assigned', 'in_transit', 'in_progress'],
  'Jefe de Almacén': ['approved', 'in_preparation', 'ready_for_technicians'],
  'Técnico': ['assigned', 'in_transit', 'in_progress', 'completed'],
  'Gerente Administrativo': ['completed'],
  'Área de Finanzas': ['completed'],
  'Administrador General': ['created', 'pending_objects', 'approved', 'rejected', 'doctor_approved', 'doctor_rejected', 'objects_confirmed', 'in_preparation', 'ready_for_technicians', 'assigned', 'in_transit', 'in_progress', 'returned', 'completed']
};

// Validaciones de transición
export interface TransitionValidation {
  isValid: boolean;
  allowedRoles: UserRole[];
  requiresApproval: boolean;
  requiresReason: boolean;
  conditions: string[];
  nextSteps: string[];
  errors: string[];
  warnings: string[];
}

// Función para validar transición de estado
export function validateStateTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
  userRole: UserRole,
  hasApproval?: boolean,
  hasReason?: boolean
): TransitionValidation {
  const transition = ORDER_STATE_TRANSITIONS.find(t => 
    t.from === fromStatus && t.to === toStatus
  );

  if (!transition) {
    return {
      isValid: false,
      allowedRoles: [],
      requiresApproval: false,
      requiresReason: false,
      conditions: [],
      nextSteps: [],
      errors: [`Transición no permitida de ${fromStatus} a ${toStatus}`],
      warnings: []
    };
  }

  const isRoleAllowed = transition.allowedRoles.includes(userRole);
  const hasRequiredApproval = !transition.requiresApproval || hasApproval;
  const hasRequiredReason = !transition.requiresReason || hasReason;

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRoleAllowed) {
    errors.push(`El rol ${userRole} no tiene permisos para esta transición`);
  }

  if (transition.requiresApproval && !hasApproval) {
    errors.push('Se requiere aprobación para esta transición');
  }

  if (transition.requiresReason && !hasReason) {
    errors.push('Se requiere un motivo para esta transición');
  }

  return {
    isValid: isRoleAllowed && hasRequiredApproval && hasRequiredReason,
    allowedRoles: transition.allowedRoles,
    requiresApproval: transition.requiresApproval || false,
    requiresReason: transition.requiresReason || false,
    conditions: transition.conditions || [],
    nextSteps: transition.nextSteps || [],
    errors,
    warnings
  };
}

// Función para obtener transiciones disponibles
export function getAvailableTransitions(
  currentStatus: OrderStatus,
  userRole: UserRole
): StateTransition[] {
  return ORDER_STATE_TRANSITIONS.filter(transition => 
    transition.from === currentStatus && 
    transition.allowedRoles.includes(userRole)
  );
}

// Función para generar notificación
export function generateNotification(
  orderId: string,
  orderNumber: string,
  type: keyof typeof NOTIFICATION_TEMPLATES,
  recipient: string,
  recipientRole: UserRole,
  metadata?: Record<string, any>
): OrderNotification {
  const template = NOTIFICATION_TEMPLATES[type];
  let message = template.message;

  // Reemplazar placeholders en el mensaje
  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value);
    });
  }

  return {
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orderId,
    type: type as OrderNotification['type'],
    title: template.title,
    message,
    recipient,
    recipientRole,
    sentAt: new Date().toISOString(),
    read: false,
    priority: template.priority,
    actionRequired: type === 'rejection' || type === 'overdue',
    actionUrl: `/orders/${orderId}`
  };
}

// Estados visuales para la interfaz
export const ORDER_STATUS_CONFIG = {
  created: {
    label: 'Creada',
    color: 'bg-blue-100 text-blue-800',
    icon: 'FileText',
    description: 'Orden creada, esperando aprobación'
  },
  pending_objects: {
    label: 'Pendiente de Objetos',
    color: 'bg-amber-100 text-amber-800',
    icon: 'Package',
    description: 'Esperando confirmación de objetos por el médico'
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
  doctor_approved: {
    label: 'Aceptada por médico',
    color: 'bg-emerald-100 text-emerald-800',
    icon: 'UserCheck',
    description: 'Confirmada por el médico'
  },
  doctor_rejected: {
    label: 'Rechazada por médico',
    color: 'bg-orange-100 text-orange-800',
    icon: 'UserX',
    description: 'Rechazada por el médico'
  },
  objects_confirmed: {
    label: 'Objetos Confirmados',
    color: 'bg-teal-100 text-teal-800',
    icon: 'CheckCircle',
    description: 'Objetos confirmados por el médico, lista para aprobación'
  },
  in_preparation: {
    label: 'En Preparación',
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'Package',
    description: 'Equipos siendo preparados en almacén'
  },
  ready_for_technicians: {
    label: 'Lista para Técnicos',
    color: 'bg-purple-100 text-purple-800',
    icon: 'Users',
    description: 'Técnicos listos para la orden'
  },
  assigned: {
    label: 'Asignada',
    color: 'bg-purple-100 text-purple-800',
    icon: 'Users',
    description: 'Técnicos asignados a la orden'
  },
  in_transit: {
    label: 'En Tránsito',
    color: 'bg-indigo-100 text-indigo-800',
    icon: 'Truck',
    description: 'Equipos en camino al sitio'
  },
  in_progress: {
    label: 'En Proceso',
    color: 'bg-cyan-100 text-cyan-800',
    icon: 'Activity',
    description: 'Cirugía en proceso'
  },
  returned: {
    label: 'De Vuelta',
    color: 'bg-gray-100 text-gray-800',
    icon: 'RotateCcw',
    description: 'Equipos regresando al almacén'
  },
  completed: {
    label: 'Completada',
    color: 'bg-green-100 text-green-800',
    icon: 'CheckCircle',
    description: 'Cirugía completada exitosamente'
  }
};

// Configuración de flujo de trabajo
export const WORKFLOW_CONFIG = {
  maxRetries: 3,
  autoArchiveAfterDays: 30,
  reminderIntervals: [1, 3, 7], // días antes
  escalationThreshold: 24, // horas
  approvalTimeout: 48, // horas
  notificationRetention: 90 // días
};

// Tipos para auditoría
export interface OrderAuditLog {
  id: string;
  orderId: string;
  action: 'status_change' | 'approval' | 'rejection' | 'assignment' | 'modification' | 'view';
  performedBy: string;
  performedAt: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Tipos para reportes
export interface OrderMetrics {
  totalOrders: number;
  ordersByStatus: Record<OrderStatus, number>;
  averageProcessingTime: number;
  approvalRate: number;
  rejectionRate: number;
  completionRate: number;
  revenueByStatus: Record<OrderStatus, number>;
  ordersByPriority: Record<OrderPriority, number>;
  ordersByUrgency: Record<OrderUrgency, number>;
}

// Los tipos ya están exportados individualmente arriba 