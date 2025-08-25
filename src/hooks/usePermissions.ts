import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/contexts/AuthContext';

// Definición de permisos por módulo según el lineamiento
export const PERMISSIONS = {
  // Módulo de Órdenes
  ORDERS: {
    CREATE: 'orders:create',
    READ: 'orders:read',
    UPDATE: 'orders:update',
    DELETE: 'orders:delete',
    APPROVE: 'orders:approve',
    REJECT: 'orders:reject',
    ASSIGN: 'orders:assign',
    MARK_READY_FOR_TECHNICIANS: 'orders:mark_ready_for_technicians'
  },
  
  // Módulo de Inventario
  INVENTORY: {
    READ: 'inventory:read',
    UPDATE: 'inventory:update',
    CREATE: 'inventory:create',
    DELETE: 'inventory:delete',
    MANAGE_STOCK: 'inventory:manage_stock'
  },
  
  // Módulo de Plantillas
  TEMPLATES: {
    CREATE: 'templates:create',
    READ: 'templates:read',
    UPDATE: 'templates:update',
    DELETE: 'templates:delete',
    APPROVE: 'templates:approve'
  },
  
  // Módulo de Calendario
  CALENDAR: {
    READ: 'calendar:read',
    CREATE: 'calendar:create',
    UPDATE: 'calendar:update',
    DELETE: 'calendar:delete',
    ASSIGN: 'calendar:assign'
  },
  
  // Módulo de Personal
  PERSONAL: {
    READ: 'personal:read',
    CREATE: 'personal:create',
    UPDATE: 'personal:update',
    DELETE: 'personal:delete',
    MANAGE_ROLES: 'personal:manage_roles'
  },
  
  // Módulo de Finanzas
  FINANCES: {
    READ: 'finances:read',
    UPDATE: 'finances:update',
    GENERATE_PDF: 'finances:generate_pdf',
    UPLOAD_REMISSION: 'finances:upload_remission',
    SEND_BILLING: 'finances:send_billing'
  },
  
  // Módulo de Tareas Técnicas
  TASKS: {
    READ: 'tasks:read',
    UPDATE: 'tasks:update',
    CREATE: 'tasks:create',
    ASSIGN: 'tasks:assign'
  },
  
  // Módulo de Evidencias
  EVIDENCE: {
    UPLOAD: 'evidence:upload',
    READ: 'evidence:read',
    DELETE: 'evidence:delete'
  },
  
  // Permisos especiales
  SPECIAL: {
    ALL: '*', // Permiso wildcard para administradores
    ADMIN: 'admin:*'
  }
} as const;

// Mapeo de roles a permisos según el lineamiento
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMINISTRADOR_GENERAL]: [
    PERMISSIONS.SPECIAL.ALL // Acceso completo a todo
  ],
  
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
    PERMISSIONS.CALENDAR.DELETE,
    PERMISSIONS.CALENDAR.ASSIGN,
    PERMISSIONS.TEMPLATES.APPROVE,
    PERMISSIONS.PERSONAL.READ
  ],
  
  [UserRole.JEFE_ALMACEN]: [
    PERMISSIONS.INVENTORY.READ,
    PERMISSIONS.INVENTORY.UPDATE,
    PERMISSIONS.INVENTORY.MANAGE_STOCK,
    PERMISSIONS.TEMPLATES.CREATE,
    PERMISSIONS.TEMPLATES.READ,
    PERMISSIONS.ORDERS.READ,
    PERMISSIONS.ORDERS.MARK_READY_FOR_TECHNICIANS
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
    PERMISSIONS.FINANCES.UPLOAD_REMISSION,
    PERMISSIONS.ORDERS.READ
  ],
  
  [UserRole.FINANZAS]: [
    PERMISSIONS.FINANCES.READ,
    PERMISSIONS.FINANCES.UPDATE,
    PERMISSIONS.FINANCES.SEND_BILLING,
    PERMISSIONS.ORDERS.READ
  ],
  
  [UserRole.MEDICO]: [
    // Los médicos no tienen permisos en el sistema
  ]
};

// Hook principal de permisos
export const usePermissions = () => {
  const { user } = useAuth();

  // Función helper para convertir string a UserRole
  const getRoleFromString = (roleString: string): UserRole | null => {
    const roleMap: Record<string, UserRole> = {
      'Admin': UserRole.ADMINISTRADOR_GENERAL,
      'Gerente Comercial': UserRole.GERENTE_COMERCIAL,
      'Gerente Operaciones': UserRole.GERENTE_OPERATIVO,
      'Gerente General': UserRole.GERENTE_ADMINISTRATIVO,
      'Gerente Cobranza': UserRole.FINANZAS,
      'Jefe de Almacén': UserRole.JEFE_ALMACEN,
      'Técnico': UserRole.TECNICO,
      'Médico': UserRole.MEDICO
    };
    return roleMap[roleString] || null;
  };

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Si el usuario no tiene permisos definidos, usar permisos basados en rol
    if (!user.permissions || user.permissions.length === 0) {
      const userRole = getRoleFromString(user.role);
      const rolePermissions = userRole ? ROLE_PERMISSIONS[userRole] || [] : [];
      return rolePermissions.includes(permission);
    }
    
    // Si tiene permiso wildcard, tiene acceso a todo
    if (user.permissions.includes(PERMISSIONS.SPECIAL.ALL)) {
      return true;
    }
    
    return user.permissions.includes(permission);
  };

  // Verificar si el usuario tiene todos los permisos especificados
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Verificar si el usuario tiene al menos uno de los permisos especificados
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  // Verificar si el usuario tiene alguno de los roles especificados
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(user?.role as UserRole);
  };

  // Obtener todos los permisos del usuario actual
  const getUserPermissions = (): string[] => {
    return user?.permissions || [];
  };

  // Obtener el rol del usuario actual
  const getUserRole = (): UserRole | null => {
    return user?.role ? getRoleFromString(user.role) : null;
  };

  // Verificar permisos por módulo
  const canAccessModule = (module: keyof typeof PERMISSIONS): boolean => {
    if (!user) return false;
    
    // Si el usuario no tiene permisos definidos, usar permisos basados en rol
    if (!user.permissions || user.permissions.length === 0) {
      const userRole = getRoleFromString(user.role);
      const rolePermissions = userRole ? ROLE_PERMISSIONS[userRole] || [] : [];
      const modulePermissions = Object.values(PERMISSIONS[module]);
      return modulePermissions.some(permission => rolePermissions.includes(permission));
    }
    
    // Si tiene permiso wildcard, puede acceder a todo
    if (user.permissions.includes(PERMISSIONS.SPECIAL.ALL)) {
      return true;
    }
    
    // Verificar si tiene al menos un permiso del módulo
    const modulePermissions = Object.values(PERMISSIONS[module]);
    return hasAnyPermission(modulePermissions);
  };

  // Verificar si puede realizar una acción específica en un módulo
  const canPerformAction = (module: keyof typeof PERMISSIONS, action: string): boolean => {
    const permission = `${module}:${action}`;
    return hasPermission(permission);
  };

  // Obtener permisos faltantes para una acción
  const getMissingPermissions = (requiredPermissions: string[]): string[] => {
    if (!user) return requiredPermissions;
    
    return requiredPermissions.filter(permission => !hasPermission(permission));
  };

  // Verificar si el usuario es administrador
  const isAdmin = (): boolean => {
    return hasPermission(PERMISSIONS.SPECIAL.ALL);
  };

  // Verificar si el usuario es gerente operativo o superior
  const isManager = (): boolean => {
    return hasAnyRole([
      UserRole.GERENTE_OPERATIVO,
      UserRole.GERENTE_COMERCIAL,
      UserRole.GERENTE_ADMINISTRATIVO
    ]);
  };

  return {
    // Estado del usuario
    user,
    isAuthenticated: !!user,
    
    // Verificación de permisos
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    
    // Verificación de roles
    hasRole,
    hasAnyRole,
    
    // Información del usuario
    getUserPermissions,
    getUserRole,
    
    // Verificación por módulos
    canAccessModule,
    canPerformAction,
    
    // Utilidades
    getMissingPermissions,
    isAdmin,
    isManager,
    
    // Constantes
    PERMISSIONS,
    ROLE_PERMISSIONS
  };
};

// Hook específico para verificar permisos de órdenes
export const useOrderPermissions = () => {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();
  
  return {
    canCreateOrder: () => hasPermission(PERMISSIONS.ORDERS.CREATE),
    canReadOrders: () => hasPermission(PERMISSIONS.ORDERS.READ),
    canUpdateOrder: () => hasPermission(PERMISSIONS.ORDERS.UPDATE),
    canDeleteOrder: () => hasPermission(PERMISSIONS.ORDERS.DELETE),
    canApproveOrder: () => hasPermission(PERMISSIONS.ORDERS.APPROVE),
    canRejectOrder: () => hasPermission(PERMISSIONS.ORDERS.REJECT),
    canAssignOrder: () => hasPermission(PERMISSIONS.ORDERS.ASSIGN),
    canManageOrders: () => hasAllPermissions([
      PERMISSIONS.ORDERS.READ,
      PERMISSIONS.ORDERS.UPDATE,
      PERMISSIONS.ORDERS.APPROVE
    ])
  };
};

// Hook específico para verificar permisos de inventario
export const useInventoryPermissions = () => {
  const { hasPermission, hasAllPermissions } = usePermissions();
  
  return {
    canReadInventory: () => hasPermission(PERMISSIONS.INVENTORY.READ),
    canUpdateInventory: () => hasPermission(PERMISSIONS.INVENTORY.UPDATE),
    canCreateInventory: () => hasPermission(PERMISSIONS.INVENTORY.CREATE),
    canDeleteInventory: () => hasPermission(PERMISSIONS.INVENTORY.DELETE),
    canManageStock: () => hasPermission(PERMISSIONS.INVENTORY.MANAGE_STOCK),
    canManageInventory: () => hasAllPermissions([
      PERMISSIONS.INVENTORY.READ,
      PERMISSIONS.INVENTORY.UPDATE,
      PERMISSIONS.INVENTORY.MANAGE_STOCK
    ])
  };
};

// Hook específico para verificar permisos de finanzas
export const useFinancePermissions = () => {
  const { hasPermission, hasAllPermissions } = usePermissions();
  
  return {
    canReadFinances: () => hasPermission(PERMISSIONS.FINANCES.READ),
    canUpdateFinances: () => hasPermission(PERMISSIONS.FINANCES.UPDATE),
    canGeneratePDF: () => hasPermission(PERMISSIONS.FINANCES.GENERATE_PDF),
    canUploadRemission: () => hasPermission(PERMISSIONS.FINANCES.UPLOAD_REMISSION),
    canSendBilling: () => hasPermission(PERMISSIONS.FINANCES.SEND_BILLING),
    canManageFinances: () => hasAllPermissions([
      PERMISSIONS.FINANCES.READ,
      PERMISSIONS.FINANCES.UPDATE,
      PERMISSIONS.FINANCES.GENERATE_PDF
    ])
  };
};

export default usePermissions; 