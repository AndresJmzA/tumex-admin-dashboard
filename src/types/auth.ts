import { UserRole } from '@/contexts/AuthContext';

// Tipos de permisos por módulo
export interface ModulePermissions {
  orders: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
    reject: boolean;
    assign: boolean;
  };
  inventory: {
    read: boolean;
    update: boolean;
    create: boolean;
    delete: boolean;
    manage_stock: boolean;
  };
  templates: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    approve: boolean;
  };
  calendar: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    assign: boolean;
  };
  personal: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    manage_roles: boolean;
  };
  finances: {
    read: boolean;
    update: boolean;
    generate_pdf: boolean;
    upload_remission: boolean;
    send_billing: boolean;
  };
  tasks: {
    read: boolean;
    update: boolean;
    create: boolean;
    assign: boolean;
  };
  evidence: {
    upload: boolean;
    read: boolean;
    delete: boolean;
  };
}

// Interface para usuario autenticado extendida
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  permissions: string[];
  avatar?: string;
  lastLogin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    phone?: string;
    position?: string;
    supervisor?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: 'es' | 'en';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

// Interface para sesión de usuario
export interface UserSession {
  user: AuthenticatedUser;
  token: string;
  expiresAt: string;
  refreshToken?: string;
}

// Interface para configuración de roles
export interface RoleConfig {
  id: UserRole;
  name: string;
  description: string;
  department: string;
  permissions: string[];
  isDefault?: boolean;
  isSystem?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mapeo detallado de roles y sus permisos según el lineamiento
export const ROLE_CONFIGURATIONS: Record<UserRole, RoleConfig> = {
  [UserRole.ADMINISTRADOR_GENERAL]: {
    id: UserRole.ADMINISTRADOR_GENERAL,
    name: 'Administrador General',
    description: 'Acceso completo al sistema. Puede gestionar todos los módulos, usuarios y configuraciones.',
    department: 'Administración',
    permissions: ['*'], // Permiso wildcard para acceso completo
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  [UserRole.GERENTE_COMERCIAL]: {
    id: UserRole.GERENTE_COMERCIAL,
    name: 'Gerente Comercial',
    description: 'Responsable de capturar las órdenes iniciales y servir de puente con los médicos.',
    department: 'Comercial',
    permissions: [
      'orders:create',
      'orders:read',
      'orders:update',
      'finances:read'
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  [UserRole.GERENTE_OPERATIVO]: {
    id: UserRole.GERENTE_OPERATIVO,
    name: 'Gerente Operativo',
    description: 'Coordinador central de las operaciones. Asegura la viabilidad de cada orden y asigna recursos.',
    department: 'Operaciones',
    permissions: [
      'orders:read',
      'orders:approve',
      'orders:reject',
      'orders:assign',
      'calendar:read',
      'calendar:create',
      'calendar:update',
      'calendar:delete',
      'calendar:assign',
      'templates:approve',
      'personal:read'
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  [UserRole.JEFE_ALMACEN]: {
    id: UserRole.JEFE_ALMACEN,
    name: 'Jefe de Almacén',
    description: 'Responsable de la gestión del inventario físico y la preparación de equipos para cirugías.',
    department: 'Almacén',
    permissions: [
      'inventory:read',
      'inventory:update',
      'inventory:manage_stock',
      'templates:create',
      'templates:read',
      'orders:read'
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  [UserRole.TECNICO]: {
    id: UserRole.TECNICO,
    name: 'Técnico',
    description: 'Personal de campo. Ejecuta tareas técnicas y sube evidencias de trabajo.',
    department: 'Técnico',
    permissions: [
      'tasks:read',
      'tasks:update',
      'evidence:upload',
      'calendar:read'
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  [UserRole.GERENTE_ADMINISTRATIVO]: {
    id: UserRole.GERENTE_ADMINISTRATIVO,
    name: 'Gerente Administrativo',
    description: 'Encargado de la documentación y enlace con el área de finanzas.',
    department: 'Administración',
    permissions: [
      'finances:read',
      'finances:generate_pdf',
      'finances:upload_remission',
      'orders:read'
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  [UserRole.FINANZAS]: {
    id: UserRole.FINANZAS,
    name: 'Finanzas',
    description: 'Responsable de la facturación final de las órdenes completadas.',
    department: 'Finanzas',
    permissions: [
      'finances:read',
      'finances:update',
      'finances:send_billing',
      'orders:read'
    ],
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

// Interface para validación de permisos
export interface PermissionValidation {
  hasPermission: boolean;
  missingPermissions: string[];
  requiredPermissions: string[];
  userPermissions: string[];
}

// Interface para respuesta de autenticación
export interface AuthResponse {
  success: boolean;
  user?: AuthenticatedUser;
  token?: string;
  message?: string;
  error?: string;
  expiresAt?: string;
}

// Interface para datos de login
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Interface para cambio de contraseña
export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Interface para actualización de perfil
export interface ProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  avatar?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: 'es' | 'en';
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
}

// Interface para creación de usuario
export interface CreateUserData {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  password: string;
  confirmPassword: string;
  profile?: {
    phone?: string;
    position?: string;
    supervisor?: string;
  };
}

// Interface para auditoría de autenticación
export interface AuthAuditLog {
  id: string;
  userId: string;
  action: 'login' | 'logout' | 'password_change' | 'profile_update' | 'permission_change';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

// Tipos de notificaciones de autenticación
export type AuthNotificationType = 
  | 'login_success'
  | 'login_failed'
  | 'logout_success'
  | 'password_changed'
  | 'profile_updated'
  | 'session_expired'
  | 'access_denied';

// Interface para notificación de autenticación
export interface AuthNotification {
  id: string;
  type: AuthNotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId: string;
}

// Exportar tipos principales
export type { UserRole } from '@/contexts/AuthContext'; 