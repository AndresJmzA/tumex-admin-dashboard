import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
// Tabs eliminados
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// Flujo de asignación de técnicos retirado
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  Calendar, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Eye,
  ArrowRight,
  FileText,
  Wrench,
  AlertCircle,
  CheckSquare,
  Square,
  Filter,
  MoreHorizontal,
  Plus,
  Settings,
  BarChart3,
  Activity,
  Target,
  Zap,
  DollarSign,
  X,
  Search,
  MapPin,
  Phone,
  MessageSquare,
  Truck,
  UserCheck,
  Timer,
  Shield,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Package as PackageIcon,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Eye as EyeIcon,
  ArrowRight as ArrowRightIcon,
  FileText as FileTextIcon,
  Wrench as WrenchIcon,
  AlertCircle as AlertCircleIcon,
  CheckSquare as CheckSquareIcon,
  Square as SquareIcon,
  Filter as FilterIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Plus as PlusIcon,
  Settings as SettingsIcon,
  BarChart3 as BarChart3Icon,
  Activity as ActivityIcon,
  Target as TargetIcon,
  Zap as ZapIcon,
  DollarSign as DollarSignIcon,
  X as XIcon,
  Search as SearchIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  MessageSquare as MessageSquareIcon,
  Truck as TruckIcon,
  UserCheck as UserCheckIcon,
  Timer as TimerIcon,
  Shield as ShieldIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import NewOrderModal from '@/components/NewOrderModal';
import { permissionManager } from '@/utils/permissions';
import { notificationService } from '@/services/notificationService';
import { useOperationalDashboard } from '@/hooks/useOperationalDashboard';
import { useToast } from '@/components/ui/use-toast';
import { getStatusLabel, getStatusClass } from '@/utils/status';
import { operationalDashboardService } from '@/services/operationalDashboardService';

// Tipos para el dashboard operativo
interface PendingOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  doctorName: string;
  surgeryDate: string;
  surgeryTime: string;
  surgeryLocation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'created' | 'pending_approval' | 'pending_confirmation' | 'pending_equipment' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'templates_ready' | 'technicians_assigned';
  estimatedValue: number;
  assignedTo?: string;
  warnings: string[];
  hasOverlap: boolean;
  overlapDetails: string;
  assignedTechnicians?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

interface InventoryAlert {
  id: string;
  productName: string;
  currentStock: number;
  minStock: number;
  criticalLevel: boolean;
  lastUpdated: string;
  supplier?: string;
  estimatedDelivery?: string;
}

interface TechnicalTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  type: 'installation' | 'maintenance' | 'repair' | 'setup';
  location: string;
  estimatedDuration: string;
}

interface SurgerySchedule {
  id: string;
  time: string;
  patient: string;
  surgery: string;
  doctor: string;
  room: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  equipment: string[];
  notes?: string;
}

interface DashboardStats {
  totalOrders: number;
  pendingApproval: number;
  pendingConfirmation: number;
  pendingEquipment: number;
  inProgress: number;
  completedToday: number;
  totalRevenue: number;
  revenueChange: number;
  inventoryAlerts: number;
  criticalAlerts: number;
  activeTasks: number;
  completedTasks: number;
  efficiency: number;
  averageProcessingTime: number;
  overlapAlerts: number;
  technicianUtilization: number;
}

interface OrderMetrics {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byDate: Record<string, number>;
  processingTimes: Record<string, number>;
  revenueByPeriod: Record<string, number>;
}

interface OverlapAlert {
  id: string;
  order1: string;
  order2: string;
  date: string;
  time: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

const OperationalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Usar el hook del dashboard operativo
  const {
    stats,
    pendingOrders,
    metrics,
    isLoading,
    error,
    refreshData,
    approveOrder,
    rejectOrder,
    getOrderById
  } = useOperationalDashboard();
  
  // Estados para filtros y búsqueda
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  
  // Estado para el modal de nueva orden
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  
  // Estados de asignación retirados
  
  // Estados para datos mock que aún no están conectados
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [technicalTasks, setTechnicalTasks] = useState<TechnicalTask[]>([]);
  const [surgerySchedule, setSurgerySchedule] = useState<SurgerySchedule[]>([]);
  const [overlapAlerts, setOverlapAlerts] = useState<OverlapAlert[]>([]);
  const [orderMetrics, setOrderMetrics] = useState<OrderMetrics>({
    byStatus: {},
    byPriority: {},
    byDate: {},
    processingTimes: {},
    revenueByPeriod: {}
  });

  // Cargar datos mock para componentes no conectados
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Datos mock para componentes que aún no están conectados
    setInventoryAlerts([
      {
        id: '1',
        productName: 'Endoscopio HD',
        currentStock: 2,
        minStock: 5,
        criticalLevel: true,
        lastUpdated: '2024-01-14T10:00:00Z',
        supplier: 'MedTech Solutions',
        estimatedDelivery: '2024-01-20T10:00:00Z'
      }
    ]);

    setTechnicalTasks([
      {
        id: '1',
        title: 'Mantenimiento Preventivo - Quirófano 2',
        description: 'Revisión mensual de equipos quirúrgicos',
        assignedTo: 'Técnico Juan Pérez',
        dueDate: '2024-01-16',
        priority: 'medium',
        status: 'pending',
        type: 'maintenance',
        location: 'Quirófano 2',
        estimatedDuration: '4 horas'
      }
    ]);

    setSurgerySchedule([
      {
        id: '1',
        time: '08:00',
        patient: 'María González',
        surgery: 'Cirugía Laparoscópica',
        doctor: 'Dr. García',
        room: 'Quirófano 3',
        status: 'scheduled',
        equipment: ['Endoscopio', 'Monitor', 'Bisturí'],
        notes: 'Paciente con antecedentes diabéticos'
      }
    ]);

    setOverlapAlerts([
      {
        id: '1',
        order1: 'ORD-2024-001',
        order2: 'ORD-2024-003',
        date: '2024-01-15',
        time: '08:00',
        severity: 'high',
        description: 'Traslape de horarios en Quirófano 3'
      }
    ]);

    setOrderMetrics({
      byStatus: {
        'created': 5,
        'approved': 8,
        'in_progress': 6,
        'completed': 5
      },
      byPriority: {
        'low': 3,
        'medium': 8,
        'high': 10,
        'critical': 3
      },
      byDate: {},
      processingTimes: {},
      revenueByPeriod: {}
    });
  };

  // Funciones de utilidad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => getStatusClass(status);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'pending_confirmation': return <CheckSquare className="h-4 w-4" />;
      case 'pending_equipment': return <Package className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      case 'in_progress': return <Activity className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Square className="h-4 w-4" />;
    }
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
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Funciones de manejo de órdenes
  const handleApproveOrder = async (orderId: string) => {
    try {
      const success = await approveOrder(orderId);
      if (success) {
        toast({
          title: 'Orden aprobada',
          description: 'La orden ha sido aprobada exitosamente',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo aprobar la orden',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al aprobar orden:', error);
      toast({
        title: 'Error',
        description: 'Error al aprobar la orden',
        variant: 'destructive',
      });
    }
  };

  const handleRejectOrder = async (orderId: string, reason: string) => {
    try {
      const success = await rejectOrder(orderId, reason);
      if (success) {
        toast({
          title: 'Orden rechazada',
          description: 'La orden ha sido rechazada',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo rechazar la orden',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error al rechazar orden:', error);
      toast({
        title: 'Error',
        description: 'Error al rechazar la orden',
        variant: 'destructive',
      });
    }
  };

  // Filtrar órdenes
  const filteredOrders = pendingOrders.filter(order => {
    const matchesSearch = order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Obtener estadísticas filtradas
  const getFilteredStats = () => {
    const filtered = filteredOrders;
    return {
      total: filtered.length,
      pendingApproval: filtered.filter(o => o.status === 'created').length,
      pendingConfirmation: filtered.filter(o => o.status === 'pending_confirmation').length,
      pendingEquipment: filtered.filter(o => o.status === 'pending_equipment').length,
      approved: filtered.filter(o => o.status === 'approved').length,
      rejected: filtered.filter(o => o.status === 'rejected').length,
      critical: filtered.filter(o => o.priority === 'critical').length,
      high: filtered.filter(o => o.priority === 'high').length
    };
  };

  const detectScheduleOverlaps = () => {
    // Simular detección de traslapes
    return overlapAlerts;
  };

  const calculatePerformanceMetrics = () => {
    return {
      efficiency: 87,
      averageProcessingTime: 2.5,
      technicianUtilization: 85,
      equipmentUtilization: 92
    };
  };

  const handleOpenNewOrder = () => {
    setIsNewOrderModalOpen(true);
  };

  const handleCloseNewOrder = () => {
    setIsNewOrderModalOpen(false);
  };

  const handleSubmitNewOrder = async (orderData: any) => {
    // TODO: Implementar lógica para crear la orden
    setIsNewOrderModalOpen(false);
    // Recargar datos del dashboard
    await refreshData();
  };

  // Flujo de asignación retirado

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tumex-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard operativo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refreshData}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Operativo</h1>
          <p className="text-gray-600">Gestión central de operaciones y coordinación</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/calendar')}>
            <Calendar className="h-4 w-4 mr-2" />
            Ver Calendario
          </Button>
          <Button onClick={handleOpenNewOrder}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar órdenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="created">Pendiente Aprobación</SelectItem>
              <SelectItem value="pending_confirmation">Pendiente Confirmación</SelectItem>
              <SelectItem value="pending_equipment">Pendiente Equipos</SelectItem>
              <SelectItem value="approved">Aprobadas</SelectItem>
              <SelectItem value="in_preparation">En Preparación</SelectItem>
              <SelectItem value="ready_for_technicians">Lista para Técnicos</SelectItem>
              <SelectItem value="templates_ready">Plantillas Listas</SelectItem>
              <SelectItem value="technicians_assigned">Técnicos Asignados</SelectItem>
              <SelectItem value="rejected">Rechazadas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las prioridades</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{getFilteredStats().total} órdenes</Badge>
          <Badge variant="destructive">{getFilteredStats().critical} críticas</Badge>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApproval}</div>
            <p className="text-xs text-muted-foreground">
              de {stats.totalOrders} total
            </p>
            <Progress value={(stats.pendingApproval / stats.totalOrders) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Aprobadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.approvalRate.toFixed(1)}% tasa de aprobación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Rechazadas</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.rejectedOrders / stats.totalOrders) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProcessingTime}h</div>
            <p className="text-xs text-muted-foreground">
              Tiempo de procesamiento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secciones sin tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Órdenes Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Órdenes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <Badge className={getStatusClass(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                      {order.status === 'templates_ready' && (
                        <Badge className="bg-purple-50 text-purple-700 border border-purple-200">
                          Lista para asignar técnicos
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium">{order.patientName}</p>
                    <p className="text-sm text-gray-600">{order.surgeryDate} - {order.surgeryTime}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/orders', { state: { highlightOrderId: order.id } })}
                    >
                      Ver Orden
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas y Métricas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas y Métricas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Alertas de Inventario</h4>
                <div className="space-y-2">
                  {inventoryAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{alert.productName}</p>
                        <p className="text-xs text-gray-600">
                          Stock: {alert.currentStock}/{alert.minStock}
                        </p>
                      </div>
                      <Badge variant="destructive">Crítico</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Métricas de Rendimiento</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.approvalRate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600">Tasa de Aprobación</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.ordersProcessedToday}
                    </div>
                    <p className="text-xs text-gray-600">Procesadas Hoy</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de Órdenes */}
      <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Órdenes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay órdenes que coincidan con los filtros</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveOrder(order.id)}
                              disabled={order.status !== 'created'}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectOrder(order.id, 'Rechazado por gerente operativo')}
                              disabled={order.status !== 'created'}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                            {/* Botón de asignación de técnicos retirado */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                await operationalDashboardService.updateOrderToTemplatesReady(order.id);
                                await refreshData();
                              }}
                              disabled={order.status === 'templates_ready' || order.status === 'technicians_assigned'}
                              className="bg-blue-100 text-blue-800 border-blue-200 mt-1"
                            >
                              Cambiar a Plantillas Listas
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium">{order.patientName}</p>
                            <p className="text-sm text-gray-600">{order.surgeryDate} - {order.surgeryTime}</p>
                            <p className="text-sm text-gray-600">Dr. {order.doctorName}</p>
                            <p className="text-sm text-gray-600">{order.surgeryLocation}</p>
                          </div>
                          <div>
                            {order.warnings.length > 0 && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-red-600">Advertencias:</p>
                                <ul className="text-xs text-red-600">
                                  {order.warnings.map((warning, index) => (
                                    <li key={index}>• {warning}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {order.hasOverlap && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-orange-600">Traslape detectado:</p>
                                <p className="text-xs text-orange-600">{order.overlapDetails}</p>
                              </div>
                            )}
                            {order.assignedTechnicians && order.assignedTechnicians.length > 0 && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-green-600">Técnicos Asignados:</p>
                                <ul className="text-xs text-green-600">
                                  {order.assignedTechnicians.map((tech, index) => (
                                    <li key={index}>• {tech.name} ({tech.role})</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
      </div>

        {/* Pestaña de asignación de técnicos retirada */}

      {/* (Sección “Inventario” removida de tabs; si se requiere, moverla al menú lateral) */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {inventoryAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{alert.productName}</p>
                      <p className="text-sm text-gray-600">
                        Stock: {alert.currentStock}/{alert.minStock}
                      </p>
                      <p className="text-xs text-gray-500">
                        Última actualización: {formatDate(alert.lastUpdated)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.criticalLevel ? "destructive" : "secondary"}>
                        {alert.criticalLevel ? "Crítico" : "Bajo"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Package className="h-4 w-4 mr-1" />
                        Reabastecer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
      {/* (Sección “Programación” removida de tabs; si se requiere, moverla al menú lateral) */}
          <Card>
            <CardHeader>
              <CardTitle>Programación de Cirugías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {surgerySchedule.map((surgery) => (
                  <div key={surgery.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{surgery.patient}</p>
                      <p className="text-sm text-gray-600">{surgery.surgery}</p>
                      <p className="text-sm text-gray-600">{surgery.time} - {surgery.room}</p>
                      <p className="text-sm text-gray-600">Dr. {surgery.doctor}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{surgery.status}</Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
      

      {/* Modal de Nueva Orden */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={handleCloseNewOrder}
        onSubmit={handleSubmitNewOrder}
      />

      {/* Modal de asignación retirado */}
    </div>
  );
};

export default OperationalDashboard;

 