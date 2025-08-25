import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions, PERMISSIONS } from '@/hooks/usePermissions';
import { UserRole } from '@/contexts/AuthContext';
import { Shield, AlertTriangle, Lock, UserCheck, Clock, MapPin, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { permissionManager, PermissionContext } from '@/utils/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: UserRole | UserRole[];
  requiredModule?: keyof typeof PERMISSIONS;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
  redirectTo?: string;
  context?: PermissionContext;
  logAccess?: boolean;
}

interface AccessDeniedProps {
  requiredPermissions?: string[];
  requiredRole?: UserRole | UserRole[];
  requiredModule?: string;
  userPermissions?: string[];
  userRole?: UserRole;
  onGoBack?: () => void;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredPermissions,
  requiredRole,
  requiredModule,
  userPermissions = [],
  userRole,
  onGoBack
}) => {
  const navigate = useNavigate();
  const { getAccessStats } = permissionManager;

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigate(-1);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Acceso Denegado
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              No tienes permisos para acceder a esta sección.
            </p>
            
            {requiredModule && (
              <div className="bg-blue-50 p-3 rounded-lg mb-3">
                <p className="text-sm text-blue-800">
                  <strong>Módulo requerido:</strong> {requiredModule}
                </p>
              </div>
            )}

            {requiredRole && (
              <div className="bg-orange-50 p-3 rounded-lg mb-3">
                <p className="text-sm text-orange-800">
                  <strong>Rol requerido:</strong> {Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole.replace('_', ' ')}
                </p>
                {userRole && (
                  <p className="text-sm text-orange-700 mt-1">
                    <strong>Tu rol:</strong> {userRole.replace('_', ' ')}
                  </p>
                )}
              </div>
            )}

            {requiredPermissions && requiredPermissions.length > 0 && (
              <div className="bg-purple-50 p-3 rounded-lg mb-3">
                <p className="text-sm text-purple-800 mb-2">
                  <strong>Permisos requeridos:</strong>
                </p>
                <ul className="text-xs text-purple-700 space-y-1">
                  {requiredPermissions.map((permission, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      {permission}
                      {userPermissions.includes(permission) ? (
                        <UserCheck className="h-3 w-3 text-green-500 ml-auto" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-red-500 ml-auto" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Información adicional de seguridad */}
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <Clock className="h-3 w-3" />
                <span>Acceso registrado: {new Date().toLocaleString('es-MX')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <MapPin className="h-3 w-3" />
                <span>IP: 192.168.1.1</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Smartphone className="h-3 w-3" />
                <span>Dispositivo: {/mobile|android|iphone|ipad/i.test(navigator.userAgent) ? 'Móvil' : 'Desktop'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex-1"
            >
              Volver
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex-1 bg-tumex-primary-600 hover:bg-tumex-primary-700"
            >
              Ir al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  requiredModule,
  fallback,
  showAccessDenied = true,
  redirectTo,
  context,
  logAccess = true
}) => {
  const { user, isAuthenticated } = useAuth();
  const { hasPermission, hasRole, canAccessModule } = usePermissions();
  const navigate = useNavigate();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    if (redirectTo) {
      navigate(redirectTo);
    } else {
      navigate('/login', { state: { from: window.location.pathname } });
    }
    return null;
  }

  // Verificar rol requerido
  if (requiredRole) {
    let hasRequiredRole = false;
    
    if (Array.isArray(requiredRole)) {
      // Si es un array, verificar si el usuario tiene al menos uno de los roles
      hasRequiredRole = requiredRole.some(role => hasRole(role));
    } else {
      // Si es un solo rol, verificar si el usuario tiene ese rol
      hasRequiredRole = hasRole(requiredRole);
    }
    
    if (!hasRequiredRole) {
      if (fallback) {
        return <>{fallback}</>;
      }
      if (showAccessDenied) {
        return (
          <AccessDenied
            requiredRole={Array.isArray(requiredRole) ? requiredRole[0] : requiredRole}
            userRole={user.role as UserRole}
          />
        );
      }
      return null;
    }
  }

  // Verificar módulo requerido
  if (requiredModule && !canAccessModule(requiredModule)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (showAccessDenied) {
      return (
        <AccessDenied
          requiredModule={requiredModule}
          userRole={user.role as UserRole}
        />
      );
    }
    return null;
  }

    // Verificar permisos específicos
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );

    if (!hasAllPermissions) {
      // Log del intento de acceso denegado
      if (logAccess && user) {
        permissionManager.checkPermission(
          user.id,
          user.role as UserRole,
          requiredPermissions.join(','),
          'permissions',
          context
        );
      }

      if (fallback) {
        return <>{fallback}</>;
      }
      if (showAccessDenied) {
        return (
          <AccessDenied
            requiredPermissions={requiredPermissions}
            userPermissions={user.permissions}
            userRole={user.role as UserRole}
          />
        );
      }
      return null;
    }
  }

  // Log del acceso exitoso
  if (logAccess && user) {
    permissionManager.checkPermission(
      user.id,
      user.role as UserRole,
      'access_granted',
      'permissions',
      context
    );
  }

  // Si pasa todas las validaciones, mostrar el contenido
  return <>{children}</>;
};

// Hook personalizado para verificar permisos en componentes
export const usePermissionGuard = () => {
  const { user, isAuthenticated } = useAuth();
  const { hasPermission, hasRole, canAccessModule } = usePermissions();

  const checkAccess = ({
    requiredPermissions = [],
    requiredRole,
    requiredModule
  }: {
    requiredPermissions?: string[];
    requiredRole?: UserRole | UserRole[];
    requiredModule?: keyof typeof PERMISSIONS;
  }) => {
    if (!isAuthenticated || !user) {
      return { hasAccess: false, reason: 'not_authenticated' };
    }

    if (requiredRole) {
      let hasRequiredRole = false;
      
      if (Array.isArray(requiredRole)) {
        hasRequiredRole = requiredRole.some(role => hasRole(role));
      } else {
        hasRequiredRole = hasRole(requiredRole);
      }
      
      if (!hasRequiredRole) {
        return { hasAccess: false, reason: 'insufficient_role' };
      }
    }

    if (requiredModule && !canAccessModule(requiredModule)) {
      return { hasAccess: false, reason: 'module_access_denied' };
    }

    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(permission)
      );
      if (!hasAllPermissions) {
        return { hasAccess: false, reason: 'insufficient_permissions' };
      }
    }

    return { hasAccess: true, reason: null };
  };

  return { checkAccess, user, isAuthenticated };
};

// Componente para mostrar contenido condicional basado en permisos
export const ConditionalContent: React.FC<{
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: UserRole | UserRole[];
  requiredModule?: keyof typeof PERMISSIONS;
  fallback?: React.ReactNode;
}> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  requiredModule,
  fallback
}) => {
  const { checkAccess } = usePermissionGuard();
  
  const { hasAccess } = checkAccess({
    requiredPermissions,
    requiredRole,
    requiredModule
  });

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default PermissionGuard; 