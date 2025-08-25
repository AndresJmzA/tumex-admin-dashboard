import React from 'react';
import { AlertTriangle, Lock, Shield, UserCheck, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

interface AccessDeniedMessageProps {
  requiredPermissions?: string[];
  requiredRole?: string;
  requiredModule?: string;
  action?: string;
  resource?: string;
  variant?: 'inline' | 'card' | 'alert';
  showDetails?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const AccessDeniedMessage: React.FC<AccessDeniedMessageProps> = ({
  requiredPermissions = [],
  requiredRole,
  requiredModule,
  action = 'acceder',
  resource = 'este recurso',
  variant = 'alert',
  showDetails = false,
  onDismiss,
  className = ''
}) => {
  const { user } = useAuth();
  const { hasPermission, hasRole } = usePermissions();

  const getMissingPermissions = () => {
    if (!user) return requiredPermissions;
    return requiredPermissions.filter(permission => !hasPermission(permission));
  };

  const getPermissionDescription = (permission: string) => {
    const descriptions: Record<string, string> = {
      'orders:read': 'Leer órdenes',
      'orders:create': 'Crear órdenes',
      'orders:update': 'Actualizar órdenes',
      'orders:delete': 'Eliminar órdenes',
      'orders:approve': 'Aprobar órdenes',
      'orders:reject': 'Rechazar órdenes',
      'orders:assign': 'Asignar órdenes',
      'inventory:read': 'Leer inventario',
      'inventory:update': 'Actualizar inventario',
      'inventory:create': 'Crear productos',
      'inventory:delete': 'Eliminar productos',
      'inventory:manage_stock': 'Gestionar stock',
      'finances:read': 'Leer finanzas',
      'finances:update': 'Actualizar finanzas',
      'finances:generate_pdf': 'Generar PDFs',
      'finances:upload_remission': 'Subir remisiones',
      'finances:send_billing': 'Enviar facturación',
      'personal:read': 'Leer personal',
      'personal:create': 'Crear empleados',
      'personal:update': 'Actualizar empleados',
      'personal:delete': 'Eliminar empleados',
      'personal:manage_roles': 'Gestionar roles',
      'calendar:read': 'Leer calendario',
      'calendar:create': 'Crear eventos',
      'calendar:update': 'Actualizar eventos',
      'calendar:delete': 'Eliminar eventos',
      'calendar:assign': 'Asignar eventos',
      'tasks:read': 'Leer tareas',
      'tasks:update': 'Actualizar tareas',
      'tasks:create': 'Crear tareas',
      'tasks:assign': 'Asignar tareas',
      'evidence:upload': 'Subir evidencias',
      'evidence:read': 'Leer evidencias',
      'evidence:delete': 'Eliminar evidencias',
      'templates:create': 'Crear plantillas',
      'templates:read': 'Leer plantillas',
      'templates:update': 'Actualizar plantillas',
      'templates:delete': 'Eliminar plantillas',
      'templates:approve': 'Aprobar plantillas'
    };
    return descriptions[permission] || permission;
  };

  const getModuleDescription = (module: string) => {
    const descriptions: Record<string, string> = {
      'ORDERS': 'Módulo de Órdenes',
      'INVENTORY': 'Módulo de Inventario',
      'FINANCES': 'Módulo de Finanzas',
      'PERSONAL': 'Módulo de Personal',
      'CALENDAR': 'Módulo de Calendario',
      'TASKS': 'Módulo de Tareas',
      'EVIDENCE': 'Módulo de Evidencias',
      'TEMPLATES': 'Módulo de Plantillas'
    };
    return descriptions[module] || module;
  };

  const missingPermissions = getMissingPermissions();

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-md border border-amber-200 ${className}`}>
        <Lock className="h-4 w-4" />
        <span>
          No tienes permisos para {action} {resource}.
          {showDetails && missingPermissions.length > 0 && (
            <span className="ml-1 text-xs">
              Permisos requeridos: {missingPermissions.map(p => getPermissionDescription(p)).join(', ')}
            </span>
          )}
        </span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 ml-auto"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white border border-amber-200 rounded-lg p-4 shadow-sm ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Lock className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-amber-800 mb-1">
              Acceso Denegado
            </h4>
            <p className="text-sm text-amber-700 mb-2">
              No tienes permisos para {action} {resource}.
            </p>
            
            {showDetails && (
              <div className="space-y-2">
                {requiredModule && (
                  <div className="bg-blue-50 p-2 rounded text-xs">
                    <span className="font-medium text-blue-800">Módulo requerido:</span>
                    <span className="text-blue-700 ml-1">{getModuleDescription(requiredModule)}</span>
                  </div>
                )}
                
                {requiredRole && (
                  <div className="bg-orange-50 p-2 rounded text-xs">
                    <span className="font-medium text-orange-800">Rol requerido:</span>
                    <span className="text-orange-700 ml-1">{requiredRole.replace('_', ' ')}</span>
                    {user && (
                      <span className="text-orange-600 ml-2">
                        (Tu rol: {user.role.replace('_', ' ')})
                      </span>
                    )}
                  </div>
                )}
                
                {missingPermissions.length > 0 && (
                  <div className="bg-purple-50 p-2 rounded text-xs">
                    <span className="font-medium text-purple-800 mb-1 block">Permisos requeridos:</span>
                    <ul className="space-y-1">
                      {missingPermissions.map((permission, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Shield className="h-3 w-3 text-purple-600" />
                          <span className="text-purple-700">{getPermissionDescription(permission)}</span>
                          {user?.permissions.includes(permission) ? (
                            <UserCheck className="h-3 w-3 text-green-500 ml-auto" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-red-500 ml-auto" />
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Variant 'alert' (default)
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Acceso Denegado</AlertTitle>
      <AlertDescription>
        No tienes permisos para {action} {resource}.
        {showDetails && missingPermissions.length > 0 && (
          <div className="mt-2 text-xs">
            <strong>Permisos requeridos:</strong> {missingPermissions.map(p => getPermissionDescription(p)).join(', ')}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

// Componente para mostrar acceso denegado en botones
export const AccessDeniedButton: React.FC<{
  requiredPermissions?: string[];
  requiredRole?: string;
  children: React.ReactNode;
  variant?: 'tooltip' | 'modal';
  className?: string;
}> = ({
  requiredPermissions = [],
  requiredRole,
  children,
  variant = 'tooltip',
  className = ''
}) => {
  const { user } = useAuth();
  const { hasPermission, hasRole } = usePermissions();

  const hasAccess = () => {
    if (!user) return false;
    
    if (requiredRole && !hasRole(requiredRole as any)) {
      return false;
    }
    
    if (requiredPermissions.length > 0) {
      return requiredPermissions.every(permission => hasPermission(permission));
    }
    
    return true;
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  if (variant === 'tooltip') {
    return (
      <div className={`relative group ${className}`}>
        <div className="opacity-50 cursor-not-allowed">
          {children}
        </div>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
          Acceso denegado
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  // Variant 'modal' - mostrar mensaje completo
  return (
    <AccessDeniedMessage
      requiredPermissions={requiredPermissions}
      requiredRole={requiredRole}
      action="ejecutar esta acción"
      variant="card"
      showDetails={true}
      className={className}
    />
  );
};

export default AccessDeniedMessage; 