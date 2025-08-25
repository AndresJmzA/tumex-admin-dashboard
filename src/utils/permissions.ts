import { UserRole } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/hooks/usePermissions';

// Tipos para el sistema de permisos
export interface PermissionLog {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  resource: string;
  timestamp: string;
  success: boolean;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PermissionRule {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  roles: UserRole[];
  conditions?: {
    timeRestriction?: {
      start: string; // HH:mm
      end: string; // HH:mm
    };
    locationRestriction?: {
      allowedLocations: string[];
    };
    deviceRestriction?: {
      allowedDevices: string[];
    };
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
}

export interface PermissionContext {
  orderId?: string;
  orderStatus?: string;
  technicianId?: string;
  location?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  timeOfDay?: string;
  userPermissions?: string[];
  resource?: string;
  action?: string;
}

// Configuración de permisos por estado de orden
export const ORDER_STATUS_PERMISSIONS: Record<string, string[]> = {
  'pending': [
    PERMISSIONS.ORDERS.READ,
    PERMISSIONS.ORDERS.APPROVE,
    PERMISSIONS.ORDERS.REJECT
  ],
  'approved': [
    PERMISSIONS.ORDERS.READ,
    PERMISSIONS.ORDERS.ASSIGN,
    PERMISSIONS.ORDERS.UPDATE
  ],
  'assigned': [
    PERMISSIONS.ORDERS.READ,
    PERMISSIONS.TASKS.READ,
    PERMISSIONS.TASKS.UPDATE,
    PERMISSIONS.EVIDENCE.UPLOAD
  ],
  'in_progress': [
    PERMISSIONS.ORDERS.READ,
    PERMISSIONS.TASKS.READ,
    PERMISSIONS.TASKS.UPDATE,
    PERMISSIONS.EVIDENCE.UPLOAD
  ],
  'completed': [
    PERMISSIONS.ORDERS.READ,
    PERMISSIONS.FINANCES.READ,
    PERMISSIONS.FINANCES.GENERATE_PDF
  ],
  'cancelled': [
    PERMISSIONS.ORDERS.READ,
    PERMISSIONS.ORDERS.UPDATE
  ]
};

// Configuración de permisos por funcionalidad
export const FUNCTIONALITY_PERMISSIONS: Record<string, string[]> = {
  'order_creation': [
    PERMISSIONS.ORDERS.CREATE,
    PERMISSIONS.ORDERS.READ
  ],
  'order_approval': [
    PERMISSIONS.ORDERS.READ,
    PERMISSIONS.ORDERS.APPROVE,
    PERMISSIONS.ORDERS.REJECT
  ],
  'order_assignment': [
    PERMISSIONS.ORDERS.READ,
    PERMISSIONS.ORDERS.ASSIGN,
    PERMISSIONS.TASKS.ASSIGN
  ],
  'evidence_upload': [
    PERMISSIONS.EVIDENCE.UPLOAD,
    PERMISSIONS.TASKS.READ
  ],
  'financial_operations': [
    PERMISSIONS.FINANCES.READ,
    PERMISSIONS.FINANCES.UPDATE,
    PERMISSIONS.FINANCES.GENERATE_PDF
  ],
  'inventory_management': [
    PERMISSIONS.INVENTORY.READ,
    PERMISSIONS.INVENTORY.UPDATE,
    PERMISSIONS.INVENTORY.MANAGE_STOCK
  ],
  'template_management': [
    PERMISSIONS.TEMPLATES.READ,
    PERMISSIONS.TEMPLATES.CREATE,
    PERMISSIONS.TEMPLATES.UPDATE
  ],
  'user_management': [
    PERMISSIONS.PERSONAL.READ,
    PERMISSIONS.PERSONAL.CREATE,
    PERMISSIONS.PERSONAL.UPDATE
  ]
};

// Configuración de visibilidad por rol
export const ROLE_VISIBILITY: Record<UserRole, {
  canViewFinancialInfo: boolean;
  canViewTechnicalDetails: boolean;
  canViewPersonalInfo: boolean;
  canViewInventoryDetails: boolean;
  canViewOrderHistory: boolean;
  canViewEvidence: boolean;
}> = {
  [UserRole.ADMINISTRADOR_GENERAL]: {
    canViewFinancialInfo: true,
    canViewTechnicalDetails: true,
    canViewPersonalInfo: true,
    canViewInventoryDetails: true,
    canViewOrderHistory: true,
    canViewEvidence: true
  },
  [UserRole.GERENTE_COMERCIAL]: {
    canViewFinancialInfo: true,
    canViewTechnicalDetails: false,
    canViewPersonalInfo: false,
    canViewInventoryDetails: false,
    canViewOrderHistory: true,
    canViewEvidence: false
  },
  [UserRole.GERENTE_OPERATIVO]: {
    canViewFinancialInfo: false,
    canViewTechnicalDetails: true,
    canViewPersonalInfo: true,
    canViewInventoryDetails: true,
    canViewOrderHistory: true,
    canViewEvidence: true
  },
  [UserRole.JEFE_ALMACEN]: {
    canViewFinancialInfo: false,
    canViewTechnicalDetails: false,
    canViewPersonalInfo: false,
    canViewInventoryDetails: true,
    canViewOrderHistory: false,
    canViewEvidence: false
  },
  [UserRole.TECNICO]: {
    canViewFinancialInfo: false,
    canViewTechnicalDetails: true,
    canViewPersonalInfo: false,
    canViewInventoryDetails: false,
    canViewOrderHistory: false,
    canViewEvidence: true
  },
  [UserRole.GERENTE_ADMINISTRATIVO]: {
    canViewFinancialInfo: true,
    canViewTechnicalDetails: false,
    canViewPersonalInfo: true,
    canViewInventoryDetails: false,
    canViewOrderHistory: true,
    canViewEvidence: false
  },
  [UserRole.FINANZAS]: {
    canViewFinancialInfo: true,
    canViewTechnicalDetails: false,
    canViewPersonalInfo: false,
    canViewInventoryDetails: false,
    canViewOrderHistory: true,
    canViewEvidence: false
  },
  [UserRole.MEDICO]: {
    canViewFinancialInfo: false,
    canViewTechnicalDetails: false,
    canViewPersonalInfo: false,
    canViewInventoryDetails: false,
    canViewOrderHistory: false,
    canViewEvidence: false
  }
};

// Configuración de permisos de edición por estado
export const EDIT_PERMISSIONS_BY_STATUS: Record<string, {
  canEdit: UserRole[];
  canDelete: UserRole[];
  canApprove: UserRole[];
  canReject: UserRole[];
  canAssign: UserRole[];
}> = {
  'pending': {
    canEdit: [UserRole.GERENTE_COMERCIAL, UserRole.ADMINISTRADOR_GENERAL],
    canDelete: [UserRole.ADMINISTRADOR_GENERAL],
    canApprove: [UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL],
    canReject: [UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL],
    canAssign: []
  },
  'approved': {
    canEdit: [UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL],
    canDelete: [UserRole.ADMINISTRADOR_GENERAL],
    canApprove: [],
    canReject: [UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL],
    canAssign: [UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL]
  },
  'assigned': {
    canEdit: [UserRole.TECNICO, UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL],
    canDelete: [UserRole.ADMINISTRADOR_GENERAL],
    canApprove: [],
    canReject: [UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL],
    canAssign: [UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL]
  },
  'in_progress': {
    canEdit: [UserRole.TECNICO, UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL],
    canDelete: [UserRole.ADMINISTRADOR_GENERAL],
    canApprove: [],
    canReject: [UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL],
    canAssign: [UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL]
  },
  'completed': {
    canEdit: [UserRole.GERENTE_ADMINISTRATIVO, UserRole.FINANZAS, UserRole.ADMINISTRADOR_GENERAL],
    canDelete: [UserRole.ADMINISTRADOR_GENERAL],
    canApprove: [],
    canReject: [],
    canAssign: []
  },
  'cancelled': {
    canEdit: [UserRole.GERENTE_COMERCIAL, UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL],
    canDelete: [UserRole.ADMINISTRADOR_GENERAL],
    canApprove: [],
    canReject: [],
    canAssign: []
  }
};

// Clase principal para gestión de permisos
class PermissionManager {
  private static instance: PermissionManager;
  private logs: PermissionLog[] = [];
  private rules: PermissionRule[] = [];

  private constructor() {
    this.initializeDefaultRules();
  }

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  // Inicializar reglas por defecto
  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'order_approval_rule',
        name: 'Aprobación de Órdenes',
        description: 'Solo gerentes operativos pueden aprobar órdenes',
        resource: 'orders',
        action: 'approve',
        roles: [UserRole.GERENTE_OPERATIVO, UserRole.ADMINISTRADOR_GENERAL],
        priority: 'high',
        enabled: true
      },
      {
        id: 'financial_access_rule',
        name: 'Acceso a Información Financiera',
        description: 'Solo roles administrativos pueden ver información financiera',
        resource: 'finances',
        action: 'read',
        roles: [UserRole.GERENTE_ADMINISTRATIVO, UserRole.FINANZAS, UserRole.ADMINISTRADOR_GENERAL],
        priority: 'critical',
        enabled: true
      },
      {
        id: 'evidence_upload_rule',
        name: 'Subida de Evidencias',
        description: 'Solo técnicos pueden subir evidencias',
        resource: 'evidence',
        action: 'upload',
        roles: [UserRole.TECNICO, UserRole.ADMINISTRADOR_GENERAL],
        priority: 'medium',
        enabled: true
      },
      {
        id: 'inventory_management_rule',
        name: 'Gestión de Inventario',
        description: 'Solo jefes de almacén pueden gestionar inventario',
        resource: 'inventory',
        action: 'manage',
        roles: [UserRole.JEFE_ALMACEN, UserRole.ADMINISTRADOR_GENERAL],
        priority: 'high',
        enabled: true
      }
    ];
  }

  // Verificar permiso con contexto
  checkPermission(
    userId: string,
    userRole: UserRole,
    action: string,
    resource: string,
    context?: PermissionContext
  ): { allowed: boolean; reason?: string; missingPermissions?: string[] } {
    const timestamp = new Date().toISOString();
    const log: PermissionLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      userId,
      userRole,
      action,
      resource,
      timestamp,
      success: false,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    try {
      // Verificar reglas específicas
      const applicableRules = this.rules.filter(rule => 
        rule.enabled && 
        rule.resource === resource && 
        rule.action === action
      );

      if (applicableRules.length > 0) {
        const hasRolePermission = applicableRules.some(rule => 
          rule.roles.includes(userRole)
        );

        if (!hasRolePermission) {
          log.reason = 'Role not allowed for this action';
          this.addLog(log);
          return {
            allowed: false,
            reason: 'Tu rol no tiene permisos para realizar esta acción',
            missingPermissions: [action]
          };
        }
      }

      // Verificar permisos por estado de orden
      if (context?.orderStatus) {
        const statusPermissions = ORDER_STATUS_PERMISSIONS[context.orderStatus] || [];
        const userPermissions = this.getUserPermissions(userRole);
        const hasStatusPermission = statusPermissions.some(permission => 
          userPermissions.includes(permission)
        );

        if (!hasStatusPermission) {
          log.reason = 'Insufficient permissions for order status';
          this.addLog(log);
          return {
            allowed: false,
            reason: `No tienes permisos para realizar esta acción en órdenes con estado: ${context.orderStatus}`,
            missingPermissions: statusPermissions
          };
        }
      }

      // Verificar restricciones de tiempo
      const timeRestriction = this.checkTimeRestrictions(context);
      if (!timeRestriction.allowed) {
        log.reason = timeRestriction.reason;
        this.addLog(log);
        return {
          allowed: false,
          reason: timeRestriction.reason
        };
      }

      // Verificar restricciones de dispositivo
      const deviceRestriction = this.checkDeviceRestrictions(context);
      if (!deviceRestriction.allowed) {
        log.reason = deviceRestriction.reason;
        this.addLog(log);
        return {
          allowed: false,
          reason: deviceRestriction.reason
        };
      }

      // Si pasa todas las validaciones
      log.success = true;
      this.addLog(log);

      return { allowed: true };

    } catch (error) {
      log.reason = `Error checking permissions: ${error}`;
      this.addLog(log);
      return {
        allowed: false,
        reason: 'Error al verificar permisos'
      };
    }
  }

  // Verificar permisos por funcionalidad
  checkFunctionalityPermission(
    userId: string,
    userRole: UserRole,
    functionality: string,
    context?: PermissionContext
  ): { allowed: boolean; reason?: string } {
    const permissions = FUNCTIONALITY_PERMISSIONS[functionality] || [];
    const userPermissions = this.getUserPermissions(userRole);
    
    const hasAllPermissions = permissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return {
        allowed: false,
        reason: `No tienes permisos para acceder a la funcionalidad: ${functionality}`
      };
    }

    return { allowed: true };
  }

  // Verificar visibilidad por rol
  checkVisibility(
    userRole: UserRole,
    visibilityType: keyof typeof ROLE_VISIBILITY[UserRole]
  ): boolean {
    return ROLE_VISIBILITY[userRole]?.[visibilityType] || false;
  }

  // Verificar permisos de edición por estado
  checkEditPermission(
    userRole: UserRole,
    orderStatus: string,
    action: 'canEdit' | 'canDelete' | 'canApprove' | 'canReject' | 'canAssign'
  ): boolean {
    const statusConfig = EDIT_PERMISSIONS_BY_STATUS[orderStatus];
    if (!statusConfig) return false;
    
    return statusConfig[action]?.includes(userRole) || false;
  }

  // Obtener permisos del usuario basados en rol
  private getUserPermissions(userRole: UserRole): string[] {
    const rolePermissions: Record<UserRole, string[]> = {
      [UserRole.ADMINISTRADOR_GENERAL]: [PERMISSIONS.SPECIAL.ALL],
      [UserRole.GERENTE_COMERCIAL]: [
        PERMISSIONS.ORDERS.CREATE,
        PERMISSIONS.ORDERS.READ,
        PERMISSIONS.ORDERS.UPDATE,
        PERMISSIONS.FINANCES.READ
      ],
      [UserRole.GERENTE_OPERATIVO]: [
        PERMISSIONS.ORDERS.READ,
        PERMISSIONS.ORDERS.APPROVE,
        PERMISSIONS.ORDERS.REJECT,
        PERMISSIONS.ORDERS.ASSIGN,
        PERMISSIONS.CALENDAR.READ,
        PERMISSIONS.CALENDAR.CREATE,
        PERMISSIONS.CALENDAR.UPDATE,
        PERMISSIONS.TEMPLATES.APPROVE
      ],
      [UserRole.JEFE_ALMACEN]: [
        PERMISSIONS.INVENTORY.READ,
        PERMISSIONS.INVENTORY.UPDATE,
        PERMISSIONS.INVENTORY.MANAGE_STOCK,
        PERMISSIONS.TEMPLATES.CREATE,
        PERMISSIONS.TEMPLATES.READ
      ],
      [UserRole.TECNICO]: [
        PERMISSIONS.TASKS.READ,
        PERMISSIONS.TASKS.UPDATE,
        PERMISSIONS.EVIDENCE.UPLOAD,
        PERMISSIONS.CALENDAR.READ
      ],
      [UserRole.GERENTE_ADMINISTRATIVO]: [
        PERMISSIONS.FINANCES.READ,
        PERMISSIONS.FINANCES.GENERATE_PDF,
        PERMISSIONS.FINANCES.UPLOAD_REMISSION
      ],
      [UserRole.FINANZAS]: [
        PERMISSIONS.FINANCES.READ,
        PERMISSIONS.FINANCES.UPDATE,
        PERMISSIONS.FINANCES.SEND_BILLING
      ],
      [UserRole.MEDICO]: []
    };

    return rolePermissions[userRole] || [];
  }

  // Verificar restricciones de tiempo
  private checkTimeRestrictions(context?: PermissionContext): { allowed: boolean; reason?: string } {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    // Horario de trabajo: 8:00 - 18:00
    const workStart = 8 * 60; // 8:00
    const workEnd = 18 * 60; // 18:00

    if (currentTime < workStart || currentTime > workEnd) {
      return {
        allowed: false,
        reason: 'Esta acción solo está disponible durante el horario de trabajo (8:00 - 18:00)'
      };
    }

    return { allowed: true };
  }

  // Verificar restricciones de dispositivo
  private checkDeviceRestrictions(context?: PermissionContext): { allowed: boolean; reason?: string } {
    const deviceType = context?.deviceType || this.detectDeviceType();

    // Algunas acciones solo están permitidas en dispositivos móviles
    if (context?.resource === 'evidence' && context?.action === 'upload') {
      if (deviceType !== 'mobile') {
        return {
          allowed: false,
          reason: 'La subida de evidencias solo está disponible en dispositivos móviles'
        };
      }
    }

    return { allowed: true };
  }

  // Detectar tipo de dispositivo
  private detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'mobile';
    }
    
    if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    }
    
    return 'desktop';
  }

  // Obtener IP del cliente (simulado)
  private getClientIP(): string {
    // En un entorno real, esto vendría del servidor
    return '192.168.1.1';
  }

  // Agregar log de acceso
  private addLog(log: PermissionLog): void {
    this.logs.push(log);
    
    // Mantener solo los últimos 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Guardar en localStorage para persistencia
    try {
      localStorage.setItem('permission_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Error saving permission logs:', error);
    }
  }

  // Obtener logs de acceso
  getLogs(userId?: string): PermissionLog[] {
    if (userId) {
      return this.logs.filter(log => log.userId === userId);
    }
    return this.logs;
  }

  // Obtener estadísticas de acceso
  getAccessStats(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: number;
    topResources: Array<{ resource: string; count: number }>;
    topActions: Array<{ action: string; count: number }>;
  } {
    const totalRequests = this.logs.length;
    const successfulRequests = this.logs.filter(log => log.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

    // Top recursos
    const resourceCounts = this.logs.reduce((acc, log) => {
      acc[log.resource] = (acc[log.resource] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topResources = Object.entries(resourceCounts)
      .map(([resource, count]) => ({ resource, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top acciones
    const actionCounts = this.logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate,
      topResources,
      topActions
    };
  }

  // Agregar regla personalizada
  addRule(rule: PermissionRule): void {
    this.rules.push(rule);
  }

  // Habilitar/deshabilitar regla
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  // Obtener reglas
  getRules(): PermissionRule[] {
    return this.rules.filter(rule => rule.enabled);
  }
}

// Instancia singleton
export const permissionManager = PermissionManager.getInstance();

// Funciones helper para uso común
export const checkOrderPermission = (
  userId: string,
  userRole: UserRole,
  action: string,
  orderStatus?: string
): { allowed: boolean; reason?: string } => {
  const context: PermissionContext = {
    orderStatus,
    deviceType: /mobile|android|iphone|ipad/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
  };

  const result = permissionManager.checkPermission(userId, userRole, action, 'orders', context);
  return { allowed: result.allowed, reason: result.reason };
};

export const checkFinancialPermission = (
  userId: string,
  userRole: UserRole,
  action: string
): { allowed: boolean; reason?: string } => {
  const result = permissionManager.checkPermission(userId, userRole, action, 'finances');
  return { allowed: result.allowed, reason: result.reason };
};

export const checkEvidencePermission = (
  userId: string,
  userRole: UserRole,
  action: string
): { allowed: boolean; reason?: string } => {
  const context: PermissionContext = {
    deviceType: 'mobile' // Evidencias solo en móvil
  };

  const result = permissionManager.checkPermission(userId, userRole, action, 'evidence', context);
  return { allowed: result.allowed, reason: result.reason };
};

export const canViewFinancialInfo = (userRole: UserRole): boolean => {
  return permissionManager.checkVisibility(userRole, 'canViewFinancialInfo');
};

export const canViewTechnicalDetails = (userRole: UserRole): boolean => {
  return permissionManager.checkVisibility(userRole, 'canViewTechnicalDetails');
};

export const canEditOrder = (userRole: UserRole, orderStatus: string): boolean => {
  return permissionManager.checkEditPermission(userRole, orderStatus, 'canEdit');
};

export default permissionManager; 