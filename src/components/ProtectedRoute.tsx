import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredPermissions = [] 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-tumex-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    // Guardar la ubicación actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar rol requerido si se especifica
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Acceso Denegado
            </h2>
            <p className="text-red-600 mb-4">
              No tienes permisos para acceder a esta página.
            </p>
            <p className="text-sm text-red-500">
              Rol requerido: <strong>{requiredRole}</strong><br />
              Tu rol: <strong>{user.role}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Verificar permisos requeridos si se especifican
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      user.permissions.includes('*') || user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Permisos Insuficientes
              </h2>
              <p className="text-red-600 mb-4">
                No tienes los permisos necesarios para acceder a esta página.
              </p>
              <div className="text-sm text-red-500">
                <p className="mb-2"><strong>Permisos requeridos:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  {requiredPermissions.map(permission => (
                    <li key={permission}>{permission}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Si pasa todas las verificaciones, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute; 