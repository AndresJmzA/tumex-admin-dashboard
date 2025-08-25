import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Package,
  Calendar,
  Users,
  BarChart3,
  Activity,
  Target,
  Zap,
  ArrowRight,
  Eye,
  Plus,
  Settings,
  Shield,
  Globe,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  Signal,
  Bell,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Link,
  Copy,
  Scissors,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Printer,
  Send,
  Archive,
  FolderOpen,
  FileX,
  FileCheck as FileCheckIcon,
  FileText as FileTextIcon,
  FileImage,
  FileSpreadsheet,
  FileCode,
  FileAudio,
  FileVideo,
  FileArchive,
  FileSignature,
  FileDigit,
  FileHeart,
  FileKey,
  FileLock,
  FileMinus,
  FilePlus,
  FileSearch,
  FileSymlink,
  FileType,
  FileUp,
  FileDown,
  FileWarning,
  FileQuestion,
  FileBarChart,
  FileBox,
  FileClock,
  FileCog,
  FileEdit,
  FileInput,
  FileJson,
  FileOutput,
  FilePieChart,
  FileStack,
  FileTerminal,
  FileX2,
  Wrench
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';

// Tipos para el dashboard general
interface SystemStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalEquipment: number;
  systemHealth: number;
  uptime: number;
  activeUsers: number;
  pendingTasks: number;
  criticalAlerts: number;
  warnings: number;
  infoAlerts: number;
}

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  category: 'system' | 'security' | 'performance' | 'business' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  assignedTo?: string;
  estimatedResolution?: string;
}

interface AreaMetrics {
  commercial: {
    orders: number;
    revenue: number;
    conversion: number;
    growth: number;
  };
  operational: {
    pendingApprovals: number;
    efficiency: number;
    inventoryAlerts: number;
    completedTasks: number;
  };
  administrative: {
    remissionsReady: number;
    remissionsSigned: number;
    sentToBilling: number;
    efficiency: number;
  };
  finances: {
    readyForBilling: number;
    billed: number;
    paid: number;
    overdue: number;
  };
  warehouse: {
    ordersToPrepare: number;
    criticalStock: number;
    efficiency: number;
    totalValue: number;
  };
  technical: {
    activeTasks: number;
    completedTasks: number;
    efficiency: number;
    averageTime: number;
  };
}

interface QuickAccess {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  permissions: string[];
}

export const GeneralDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalEquipment: 0,
    systemHealth: 0,
    uptime: 0,
    activeUsers: 0,
    pendingTasks: 0,
    criticalAlerts: 0,
    warnings: 0,
    infoAlerts: 0
  });

  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [areaMetrics, setAreaMetrics] = useState<AreaMetrics>({
    commercial: { orders: 0, revenue: 0, conversion: 0, growth: 0 },
    operational: { pendingApprovals: 0, efficiency: 0, inventoryAlerts: 0, completedTasks: 0 },
    administrative: { remissionsReady: 0, remissionsSigned: 0, sentToBilling: 0, efficiency: 0 },
    finances: { readyForBilling: 0, billed: 0, paid: 0, overdue: 0 },
    warehouse: { ordersToPrepare: 0, criticalStock: 0, efficiency: 0, totalValue: 0 },
    technical: { activeTasks: 0, completedTasks: 0, efficiency: 0, averageTime: 0 }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos mock para el dashboard general
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Estadísticas del sistema
    setSystemStats({
      totalOrders: 156,
      totalRevenue: 2850000,
      totalUsers: 24,
      totalEquipment: 342,
      systemHealth: 98.5,
      uptime: 99.9,
      activeUsers: 18,
      pendingTasks: 47,
      criticalAlerts: 3,
      warnings: 8,
      infoAlerts: 12
    });

    // Métricas por área
    setAreaMetrics({
      commercial: {
        orders: 47,
        revenue: 125000,
        conversion: 68.1,
        growth: 12.5
      },
      operational: {
        pendingApprovals: 5,
        efficiency: 87,
        inventoryAlerts: 7,
        completedTasks: 18
      },
      administrative: {
        remissionsReady: 8,
        remissionsSigned: 12,
        sentToBilling: 15,
        efficiency: 92
      },
      finances: {
        readyForBilling: 6,
        billed: 18,
        paid: 14,
        overdue: 4
      },
      warehouse: {
        ordersToPrepare: 4,
        criticalStock: 3,
        efficiency: 91,
        totalValue: 1250000
      },
      technical: {
        activeTasks: 12,
        completedTasks: 18,
        efficiency: 85,
        averageTime: 45
      }
    });

    // Alertas del sistema
    setSystemAlerts([
      {
        id: '1',
        type: 'critical',
        title: 'Stock crítico - Cable HDMI 4K',
        message: 'Se han agotado los cables HDMI 4K. Se requieren 10 unidades urgentemente.',
        timestamp: '2024-01-14T10:30:00Z',
        category: 'business',
        priority: 'critical',
        resolved: false,
        assignedTo: 'Roberto Silva',
        estimatedResolution: '2024-01-18'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Mantenimiento programado - Servidor principal',
        message: 'Mantenimiento programado para el servidor principal el próximo domingo.',
        timestamp: '2024-01-14T09:15:00Z',
        category: 'maintenance',
        priority: 'medium',
        resolved: false,
        assignedTo: 'Equipo IT',
        estimatedResolution: '2024-01-21'
      },
      {
        id: '3',
        type: 'info',
        title: 'Nueva actualización disponible',
        message: 'Está disponible la versión 2.1.0 del sistema con mejoras de rendimiento.',
        timestamp: '2024-01-14T08:20:00Z',
        category: 'system',
        priority: 'low',
        resolved: false
      },
      {
        id: '4',
        type: 'success',
        title: 'Backup completado exitosamente',
        message: 'El backup automático del sistema se completó exitosamente.',
        timestamp: '2024-01-14T02:00:00Z',
        category: 'system',
        priority: 'low',
        resolved: true
      }
    ]);

    setIsLoading(false);
  };

  const getAlertColor = (type: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      success: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[type] || colors.info;
  };

  const getAlertIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      critical: <AlertTriangle className="h-4 w-4" />,
      warning: <AlertCircle className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />,
      success: <CheckCircle className="h-4 w-4" />
    };
    return icons[type] || <Info className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.low;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime);
    const hours = Math.floor((uptime - days) * 24);
    const minutes = Math.floor(((uptime - days) * 24 - hours) * 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const quickAccessItems: QuickAccess[] = [
    {
      id: '1',
      title: 'Dashboard Comercial',
      description: 'Gestión de órdenes y ventas',
      icon: <TrendingUp className="h-6 w-6" />,
      route: '/commercial',
      color: 'bg-blue-500',
      permissions: ['commercial:read']
    },
    {
      id: '2',
      title: 'Dashboard Operativo',
      description: 'Coordinación y operaciones',
      icon: <Activity className="h-6 w-6" />,
      route: '/operational',
      color: 'bg-green-500',
      permissions: ['operational:read']
    },
    {
      id: '3',
      title: 'Dashboard Administrativo',
      description: 'Remisiones y documentación',
      icon: <FileText className="h-6 w-6" />,
      route: '/administrative',
      color: 'bg-purple-500',
      permissions: ['administrative:read']
    },
    {
      id: '4',
      title: 'Dashboard Finanzas',
      description: 'Facturación y cobranza',
      icon: <DollarSign className="h-6 w-6" />,
      route: '/finances',
      color: 'bg-yellow-500',
      permissions: ['finances:read']
    },
    {
      id: '5',
      title: 'Dashboard Almacén',
      description: 'Inventario y preparación',
      icon: <Package className="h-6 w-6" />,
      route: '/warehouse',
      color: 'bg-orange-500',
      permissions: ['warehouse:read']
    },
    {
      id: '6',
      title: 'Portal Técnico',
      description: 'Tareas y equipos técnicos',
      icon: <Wrench className="h-6 w-6" />,
      route: '/technician',
      color: 'bg-red-500',
      permissions: ['technical:read']
    },
    {
      id: '7',
      title: 'Reportes',
      description: 'Análisis y estadísticas',
      icon: <BarChart3 className="h-6 w-6" />,
      route: '/reports',
      color: 'bg-indigo-500',
      permissions: ['reports:read']
    },
    {
      id: '8',
      title: 'Configuración',
      description: 'Ajustes del sistema',
      icon: <Settings className="h-6 w-6" />,
      route: '/settings',
      color: 'bg-gray-500',
      permissions: ['settings:read']
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tumex-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard general...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard General</h1>
          <p className="text-gray-600">Vista general del sistema TUMex - Administrador General</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/reports')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Reportes
          </Button>
          <Button onClick={() => navigate('/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Estadísticas Principales del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salud del Sistema</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemStats.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">
              Uptime: {systemStats.uptime}%
            </p>
            <Progress value={systemStats.systemHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Totales</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.pendingTasks} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(systemStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.totalUsers} usuarios activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{systemStats.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.warnings} advertencias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas por Área */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Métricas por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Comercial */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Comercial</p>
                    <p className="text-xs text-gray-500">{areaMetrics.commercial.orders} órdenes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(areaMetrics.commercial.revenue)}</p>
                  <p className="text-xs text-green-600">+{areaMetrics.commercial.growth}%</p>
                </div>
              </div>

              {/* Operativo */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Operativo</p>
                    <p className="text-xs text-gray-500">{areaMetrics.operational.pendingApprovals} aprobaciones</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{areaMetrics.operational.efficiency}%</p>
                  <p className="text-xs text-gray-500">Eficiencia</p>
                </div>
              </div>

              {/* Administrativo */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Administrativo</p>
                    <p className="text-xs text-gray-500">{areaMetrics.administrative.remissionsReady} remisiones</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{areaMetrics.administrative.efficiency}%</p>
                  <p className="text-xs text-gray-500">Eficiencia</p>
                </div>
              </div>

              {/* Finanzas */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Finanzas</p>
                    <p className="text-xs text-gray-500">{areaMetrics.finances.readyForBilling} por facturar</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{areaMetrics.finances.paid}</p>
                  <p className="text-xs text-gray-500">Pagadas</p>
                </div>
              </div>

              {/* Almacén */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Almacén</p>
                    <p className="text-xs text-gray-500">{areaMetrics.warehouse.ordersToPrepare} por preparar</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{areaMetrics.warehouse.efficiency}%</p>
                  <p className="text-xs text-gray-500">Eficiencia</p>
                </div>
              </div>

              {/* Técnico */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Técnico</p>
                    <p className="text-xs text-gray-500">{areaMetrics.technical.activeTasks} tareas activas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{areaMetrics.technical.efficiency}%</p>
                  <p className="text-xs text-gray-500">Eficiencia</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas del Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas del Sistema
              </CardTitle>
              <Badge variant="outline">{systemAlerts.filter(a => !a.resolved).length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.slice(0, 4).map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium">
                          {alert.title}
                        </h4>
                        <Badge className={getPriorityColor(alert.priority)}>
                          {alert.priority}
                        </Badge>
                        {alert.resolved && (
                          <Badge variant="outline" className="text-green-600">
                            Resuelto
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span>{formatDate(alert.timestamp)}</span>
                        {alert.assignedTo && (
                          <span>Asignado a: {alert.assignedTo}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {systemAlerts.length > 4 && (
                <Button variant="outline" className="w-full">
                  Ver todas las alertas ({systemAlerts.length})
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Accesos Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickAccessItems.map((item) => (
              <Button 
                key={item.id}
                variant="outline" 
                className="h-24 flex-col p-4 hover:shadow-md transition-all"
                onClick={() => navigate(item.route)}
              >
                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-2`}>
                  <div className="text-white">
                    {item.icon}
                  </div>
                </div>
                <span className="text-sm font-medium text-center">{item.title}</span>
                <span className="text-xs text-gray-500 text-center">{item.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estado del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Cpu className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">CPU</p>
              <p className="text-xs text-gray-500">45%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <HardDrive className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Almacenamiento</p>
              <p className="text-xs text-gray-500">67%</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Wifi className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Red</p>
              <p className="text-xs text-gray-500">Estable</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Battery className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Uptime</p>
              <p className="text-xs text-gray-500">{formatUptime(systemStats.uptime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralDashboard; 