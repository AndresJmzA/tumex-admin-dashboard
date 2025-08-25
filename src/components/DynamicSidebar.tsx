import { useState } from "react"
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Users, 
  Boxes, 
  DollarSign, 
  Headphones, 
  Settings, 
  HelpCircle, 
  Heart, 
  Menu,
  Shield,
  UserCheck,
  ClipboardList,
  Truck,
  FileCheck,
  CreditCard,
  BarChart3,
  Cog,
  Bell
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { usePermissions } from "@/hooks/usePermissions"
import { UserRole } from "@/contexts/AuthContext"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Interface para elementos de navegación
interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredPermissions?: string[];
  requiredRole?: UserRole;
  badge?: string;
  description?: string;
}

// Configuración de navegación por rol
const getNavItemsByRole = (userRole: UserRole): NavItem[] => {
  const baseItems: NavItem[] = [
    { 
      title: "Panel Principal", 
      url: "/", 
      icon: LayoutDashboard,
      description: "Vista general del sistema"
    }
  ];

  switch (userRole) {
    case UserRole.ADMINISTRADOR_GENERAL:
      return [
        ...baseItems,
        { 
          title: "Órdenes", 
          url: "/orders", 
          icon: FileText,
          description: "Gestión completa de órdenes"
        },
        { 
          title: "Calendario", 
          url: "/calendar", 
          icon: Calendar,
          description: "Agenda y programación"
        },
        { 
          title: "Personal", 
          url: "/personal", 
          icon: Users,
          description: "Gestión de empleados"
        },
        { 
          title: "Inventario", 
          url: "/inventory", 
          icon: Boxes,
          description: "Control de stock"
        },
        { 
          title: "Finanzas", 
          url: "/finances", 
          icon: DollarSign,
          description: "Gestión financiera"
        },
        { 
          title: "Reportes", 
          url: "/reports", 
          icon: BarChart3,
          description: "Análisis y estadísticas"
        }
      ];

    case UserRole.GERENTE_COMERCIAL:
      return [
        ...baseItems,
        { 
          title: "Órdenes", 
          url: "/orders", 
          icon: FileText,
          requiredPermissions: ['orders:create', 'orders:read'],
          description: "Mis órdenes comerciales"
        },
        { 
          title: "Finanzas", 
          url: "/finances", 
          icon: DollarSign,
          requiredPermissions: ['finances:read'],
          description: "Estado de facturación"
        },
        { 
          title: "Reportes", 
          url: "/reports", 
          icon: BarChart3,
          description: "Estadísticas de ventas"
        }
      ];

    case UserRole.GERENTE_OPERATIVO:
      return [
        ...baseItems,
        { 
          title: "Órdenes", 
          url: "/orders", 
          icon: FileText,
          requiredPermissions: ['orders:read', 'orders:approve'],
          description: "Gestión de órdenes"
        },
        { 
          title: "Calendario", 
          url: "/calendar", 
          icon: Calendar,
          requiredPermissions: ['calendar:read', 'calendar:create'],
          description: "Programación operativa"
        },
        { 
          title: "Personal", 
          url: "/personal", 
          icon: Users,
          requiredPermissions: ['personal:read'],
          description: "Gestión de equipo"
        },
        { 
          title: "Inventario", 
          url: "/inventory", 
          icon: Boxes,
          requiredPermissions: ['inventory:read'],
          description: "Revisión de plantillas"
        },
        { 
          title: "Reportes", 
          url: "/reports", 
          icon: BarChart3,
          description: "Análisis operativo"
        }
      ];

    case UserRole.JEFE_ALMACEN:
      return [
        ...baseItems,
        { 
          title: "Inventario", 
          url: "/inventory", 
          icon: Boxes,
          requiredPermissions: ['inventory:read', 'inventory:update'],
          description: "Gestión de stock"
        },
        { 
          title: "Órdenes", 
          url: "/orders", 
          icon: FileText,
          requiredPermissions: ['orders:read'],
          description: "Órdenes por preparar"
        },
        { 
          title: "Plantillas", 
          url: "/templates", 
          icon: ClipboardList,
          requiredPermissions: ['templates:create', 'templates:read'],
          description: "Plantillas de cirugía"
        },
        { 
          title: "Reportes", 
          url: "/reports", 
          icon: BarChart3,
          description: "Reportes de inventario"
        }
      ];

    case UserRole.TECNICO:
      return [
        ...baseItems,
        { 
          title: "Mi Agenda", 
          url: "/calendar", 
          icon: Calendar,
          requiredPermissions: ['calendar:read'],
          description: "Mis tareas del día"
        },
        { 
          title: "Tareas", 
          url: "/tasks", 
          icon: ClipboardList,
          requiredPermissions: ['tasks:read', 'tasks:update'],
          description: "Mis tareas asignadas"
        },
        { 
          title: "Evidencias", 
          url: "/evidence", 
          icon: FileCheck,
          requiredPermissions: ['evidence:upload'],
          description: "Subir evidencias"
        }
      ];

    case UserRole.GERENTE_ADMINISTRATIVO:
      return [
        ...baseItems,
        { 
          title: "Órdenes", 
          url: "/orders", 
          icon: FileText,
          requiredPermissions: ['orders:read'],
          description: "Órdenes completadas"
        },
        { 
          title: "Finanzas", 
          url: "/finances", 
          icon: DollarSign,
          requiredPermissions: ['finances:read', 'finances:generate_pdf'],
          description: "Gestión de remisiones"
        },
        { 
          title: "Reportes", 
          url: "/reports", 
          icon: BarChart3,
          description: "Reportes administrativos"
        }
      ];

    case UserRole.FINANZAS:
      return [
        ...baseItems,
        { 
          title: "Finanzas", 
          url: "/finances", 
          icon: DollarSign,
          requiredPermissions: ['finances:read', 'finances:update'],
          description: "Gestión de facturación"
        },
        { 
          title: "Órdenes", 
          url: "/orders", 
          icon: FileText,
          requiredPermissions: ['orders:read'],
          description: "Órdenes por facturar"
        },
        { 
          title: "Reportes", 
          url: "/reports", 
          icon: BarChart3,
          description: "Reportes financieros"
        }
      ];

    default:
      return baseItems;
  }
};

// Elementos de navegación secundaria (configuración, ayuda, etc.)
const getSecondaryNavItems = (userRole: UserRole): NavItem[] => {
  const items: NavItem[] = [
    { 
      title: "Ayuda", 
      url: "/help", 
      icon: HelpCircle,
      description: "Centro de ayuda"
    }
  ];

  // Solo administradores pueden acceder a configuración
  if (userRole === UserRole.ADMINISTRADOR_GENERAL) {
    items.unshift({
      title: "Configuración",
      url: "/settings",
      icon: Settings,
      description: "Configuración del sistema"
    });
  }

  return items;
};

export function DynamicSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"
  const { user } = useAuth()
  const { hasPermission, hasRole } = usePermissions()

  // Obtener elementos de navegación según el rol del usuario
  const mainNavItems = user ? getNavItemsByRole(user.role as UserRole) : []
  const secondaryNavItems = user ? getSecondaryNavItems(user.role as UserRole) : []

  // Filtrar elementos según permisos
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      // Si no hay usuario, no mostrar nada
      if (!user) return false;

      // Si requiere un rol específico, verificar
      if (item.requiredRole && !hasRole(item.requiredRole)) {
        return false;
      }

      // Si requiere permisos específicos, verificar
      if (item.requiredPermissions) {
        return item.requiredPermissions.every(permission => hasPermission(permission));
      }

      return true;
    });
  };

  const filteredMainItems = filterNavItems(mainNavItems);
  const filteredSecondaryItems = filterNavItems(secondaryNavItems);

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(path)
  }

  const getNavCls = (path: string) => {
    const active = isActive(path)
    return active 
      ? "bg-tumex-primary-600/20 text-tumex-primary-700 font-medium hover:bg-tumex-primary-600/30 backdrop-blur-sm" 
      : "text-gray-700 hover:bg-white/60 hover:text-tumex-primary-600 backdrop-blur-sm"
  }

  // Si no hay usuario autenticado, mostrar sidebar básico
  if (!user) {
    return (
      <Sidebar
        className="bg-white/85 backdrop-blur-[20px] border-r border-white/20"
        collapsible="icon"
      >
        <SidebarHeader className="border-b border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tumex-primary-500 text-white shadow-lg">
              <Heart className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-800">TUMex</h1>
                <p className="text-xs text-gray-600">Plataforma Médica</p>
              </div>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3 py-4">
          <div className="text-center text-gray-500">
            {!collapsed && <p>Inicia sesión para continuar</p>}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar
      className="bg-white/85 backdrop-blur-[20px] border-r border-white/20"
      collapsible="icon"
    >
      {/* Encabezado con Logo y Info del Usuario */}
      <SidebarHeader className="border-b border-white/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tumex-primary-500 text-white shadow-lg">
            <Heart className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-800">TUMex</h1>
              <p className="text-xs text-gray-600">Plataforma Médica</p>
              <div className="mt-1 flex items-center gap-1">
                <Shield className="h-3 w-3 text-tumex-primary-500" />
                <span className="text-xs text-gray-500 capitalize">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 data-[state=expanded]:pr-10">
        {/* Navegación Principal */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-gray-500 text-xs font-medium mb-2">
              MENÚ PRINCIPAL
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10 tumex-button-radius">
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={`${getNavCls(item.url)} transition-all duration-200 border border-transparent hover:border-white/30`}
                      title={item.description}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && (
                        <div className="ml-3 flex-1 min-w-0">
                          <span className="block truncate">{item.title}</span>
                          {item.description && (
                            <span className="text-xs text-gray-500 truncate block">
                              {item.description}
                            </span>
                          )}
                        </div>
                      )}
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navegación Secundaria */}
        {filteredSecondaryItems.length > 0 && (
          <SidebarGroup className="mt-8">
            {!collapsed && (
              <SidebarGroupLabel className="text-gray-500 text-xs font-medium mb-2">
                GESTIONAR
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {filteredSecondaryItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-10 tumex-button-radius">
                      <NavLink 
                        to={item.url} 
                        className={`${getNavCls(item.url)} transition-all duration-200 border border-transparent hover:border-white/30`}
                        title={item.description}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <div className="ml-3 flex-1 min-w-0">
                            <span className="block truncate">{item.title}</span>
                            {item.description && (
                              <span className="text-xs text-gray-500 truncate block">
                                {item.description}
                              </span>
                            )}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Pie de página */}
      <SidebarFooter className="border-t border-white/20 p-4">
      </SidebarFooter>
    </Sidebar>
  )
} 