import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useDashboardNavigation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDefaultRoute = () => {
    if (!user) return '/login';

    switch (user.role) {
      case UserRole.ADMINISTRADOR_GENERAL:
        return '/';
      case UserRole.GERENTE_COMERCIAL:
        return '/';
      case UserRole.GERENTE_OPERATIVO:
        return '/';
      case UserRole.JEFE_ALMACEN:
        return '/';
      case UserRole.GERENTE_ADMINISTRATIVO:
        return '/';
      case UserRole.FINANZAS:
        return '/';
      case UserRole.TECNICO:
        return '/technician';
      default:
        return '/';
    }
  };

  const getRoleSpecificRoutes = () => {
    if (!user) return [];

    const baseRoutes = [
      { path: '/', label: 'Dashboard', icon: 'Home' },
      { path: '/calendar', label: 'Calendario', icon: 'Calendar' },
      { path: '/orders', label: 'Órdenes', icon: 'FileText' },
      { path: '/inventory', label: 'Inventario', icon: 'Package' },
      { path: '/reports', label: 'Reportes', icon: 'BarChart3' },
      { path: '/settings', label: 'Configuración', icon: 'Settings' }
    ];

    const roleSpecificRoutes: Record<UserRole, Array<{ path: string; label: string; icon: string; permissions?: string[] }>> = {
      [UserRole.ADMINISTRADOR_GENERAL]: [
        ...baseRoutes,
        { path: '/commercial', label: 'Comercial', icon: 'TrendingUp', permissions: ['commercial:read'] },
        { path: '/operational', label: 'Operativo', icon: 'Activity', permissions: ['operational:read'] },
        { path: '/administrative', label: 'Administrativo', icon: 'FileText', permissions: ['administrative:read'] },
        { path: '/finances', label: 'Finanzas', icon: 'DollarSign', permissions: ['finances:read'] },
        { path: '/warehouse', label: 'Almacén', icon: 'Package', permissions: ['warehouse:read'] },
        { path: '/technician', label: 'Técnico', icon: 'Wrench', permissions: ['technical:read'] }
      ],
      [UserRole.GERENTE_COMERCIAL]: [
        ...baseRoutes,
        { path: '/catalog', label: 'Catálogo', icon: 'ShoppingCart' },
        { path: '/rentals', label: 'Rentas', icon: 'Clock' }
      ],
      [UserRole.GERENTE_OPERATIVO]: [
        ...baseRoutes,
        { path: '/requests', label: 'Solicitudes', icon: 'ClipboardList' },
        { path: '/personal', label: 'Personal', icon: 'Users' }
      ],
      [UserRole.GERENTE_ADMINISTRATIVO]: [
        ...baseRoutes,
        { path: '/finances', label: 'Finanzas', icon: 'DollarSign' },
        { path: '/requests', label: 'Solicitudes', icon: 'ClipboardList' }
      ],
      [UserRole.FINANZAS]: [
        ...baseRoutes,
        { path: '/billing', label: 'Facturación', icon: 'Receipt' },
        { path: '/payments', label: 'Pagos', icon: 'CreditCard' }
      ],
      [UserRole.JEFE_ALMACEN]: [
        ...baseRoutes,
        { path: '/templates', label: 'Plantillas', icon: 'ClipboardList' },
        { path: '/suppliers', label: 'Proveedores', icon: 'Truck' }
      ],
      [UserRole.TECNICO]: [
        { path: '/technician', label: 'Dashboard', icon: 'Home' },
        { path: '/tasks', label: 'Tareas', icon: 'CheckSquare' },
        { path: '/equipment', label: 'Equipos', icon: 'Wrench' },
        { path: '/evidence', label: 'Evidencia', icon: 'Camera' },
        { path: '/reports', label: 'Reportes', icon: 'BarChart3' }
      ],
      [UserRole.MEDICO]: [
        // Los médicos no tienen acceso al dashboard
      ]
    };

    return roleSpecificRoutes[user.role] || baseRoutes;
  };

  const navigateToDefaultRoute = () => {
    const defaultRoute = getDefaultRoute();
    navigate(defaultRoute);
  };

  const navigateToRoleSpecificRoute = (route: string) => {
    const availableRoutes = getRoleSpecificRoutes();
    const routeExists = availableRoutes.some(r => r.path === route);
    
    if (routeExists) {
      navigate(route);
    } else {
      console.warn(`Ruta ${route} no disponible para el rol ${user?.role}`);
      navigateToDefaultRoute();
    }
  };

  const canAccessRoute = (route: string) => {
    if (!user) return false;
    
    const availableRoutes = getRoleSpecificRoutes();
    return availableRoutes.some(r => r.path === route);
  };

  return {
    getDefaultRoute,
    getRoleSpecificRoutes,
    navigateToDefaultRoute,
    navigateToRoleSpecificRoute,
    canAccessRoute
  };
}; 