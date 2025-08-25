import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
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
  Truck,
  Box,
  ClipboardList,
  FileCheck,
  ShoppingCart,
  RotateCcw,
  Search,
  Download,
  Upload,
  Printer,
  Tag,
  DollarSign,
  Percent,
  Minus,
  Plus as PlusIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import InventoryAlert, { InventoryItem } from './InventoryAlert';
import { WarehouseOrderModal } from './WarehouseOrderModal';
import { useToast } from '@/components/ui/use-toast';
import { orderService, ExtendedOrder } from '@/services/orderService';
import { inventoryService, InventoryStats } from '@/services/inventoryService';

// Tipos para el dashboard de almacén
interface ApprovedOrder {
  id: string;
  orderNumber: string;
  customer: string;
  surgery: string;
  surgeryDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'approved' | 'in_preparation' | 'ready_for_technicians' | 'delivered';
  assignedTo?: string;
  estimatedValue: number;
  equipmentList: EquipmentItem[];
  preparationDeadline: string;
  notes?: string;
}

interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  available: number;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'maintenance';
  location: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

interface InventoryAlert {
  id: string;
  productName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  criticalLevel: boolean;
  lastUpdated: string;
  supplier?: string;
  estimatedDelivery?: string;
  reorderPoint: number;
  category: 'equipment' | 'consumables' | 'spare_parts' | 'tools';
  cost: number;
  location: string;
}

interface StockStatus {
  totalItems: number;
  availableItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  maintenanceItems: number;
  totalValue: number;
  reorderValue: number;
  efficiency: number;
}

interface SurgeryTemplate {
  id: string;
  name: string;
  category: string;
  equipmentList: TemplateEquipment[];
  estimatedPreparationTime: number; // en minutos
  complexity: 'simple' | 'medium' | 'complex';
  lastUsed?: string;
  usageCount: number;
  isActive: boolean;
}

interface TemplateEquipment {
  id: string;
  name: string;
  quantity: number;
  critical: boolean;
  alternatives?: string[];
}

interface PreparationTask {
  id: string;
  orderId: string;
  orderNumber: string;
  task: string;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  estimatedDuration: number; // en minutos
  actualDuration?: number;
  notes?: string;
}

export const WarehouseDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stockStatus, setStockStatus] = useState<StockStatus>({
    totalItems: 0,
    availableItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    maintenanceItems: 0,
    totalValue: 0,
    reorderValue: 0,
    efficiency: 0
  });

  const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [surgeryTemplates, setSurgeryTemplates] = useState<SurgeryTemplate[]>([]);
  const [preparationTasks, setPreparationTasks] = useState<PreparationTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el modal de órdenes en preparación
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Cargar datos reales para el dashboard
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    try {
      setIsLoading(true);

      // Cargar órdenes aprobadas y en preparación
      await loadOrders();

      // Cargar estadísticas de inventario
      await loadInventoryStats();

      // Cargar alertas de inventario
      await loadInventoryAlerts();

      // Cargar datos mock para plantillas y tareas (por ahora)
      loadMockTemplatesAndTasks();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los datos del dashboard.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      // Obtener órdenes aprobadas y en preparación
      const ordersResponse = await orderService.getOrders({
        status: 'approved',
        limit: 10
      });

      // Obtener órdenes en preparación
      const preparationResponse = await orderService.getOrders({
        status: 'in_preparation',
        limit: 10
      });

      // Combinar y transformar las órdenes
      const allOrders = [...ordersResponse.data, ...preparationResponse.data];
      
      const transformedOrders: ApprovedOrder[] = allOrders.map(order => {
        // Determinar prioridad basada en la fecha de cirugía
        const surgeryDate = new Date(order.surgery_date);
        const today = new Date();
        const daysUntilSurgery = Math.ceil((surgeryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
        if (daysUntilSurgery <= 1) priority = 'critical';
        else if (daysUntilSurgery <= 3) priority = 'high';
        else if (daysUntilSurgery <= 7) priority = 'medium';
        else priority = 'low';

        // Transformar productos a equipos
        const equipmentList: EquipmentItem[] = order.products?.map(product => ({
          id: product.id,
          name: product.name,
          quantity: product.quantity,
          available: Math.floor(Math.random() * 10) + 1, // Simulado por ahora
          status: product.quantity > 5 ? 'available' : 'low_stock' as const,
          location: `Almacén ${String.fromCharCode(65 + Math.floor(Math.random() * 3))} - Estante ${Math.floor(Math.random() * 10) + 1}`
        })) || [];

        return {
          id: order.id,
          orderNumber: order.orderId,
          customer: order.patient_name,
          surgery: order.procedureInfo?.procedureName || 'Cirugía General',
          surgeryDate: order.surgery_date,
          priority,
          status: order.status as 'in_preparation' | 'ready_for_technicians' | 'delivered',
          assignedTo: order.doctorInfo?.doctorName,
          estimatedValue: order.totalAmount || 0,
          equipmentList,
          preparationDeadline: new Date(order.surgery_date).toISOString(),
          notes: order.notes
        };
      });

      setApprovedOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar las órdenes.",
        variant: "destructive"
      });
    }
  };

  const loadInventoryStats = async () => {
    try {
      const stats = await inventoryService.getInventoryStats();
      
      setStockStatus({
        totalItems: stats.totalProducts,
        availableItems: stats.availableProducts,
        lowStockItems: stats.lowStockProducts,
        outOfStockItems: stats.outOfStockProducts,
        maintenanceItems: 0, // Por ahora
        totalValue: 1250000, // Simulado por ahora
        reorderValue: 45000, // Simulado por ahora
        efficiency: stats.totalProducts > 0 ? Math.round((stats.availableProducts / stats.totalProducts) * 100) : 0
      });
    } catch (error) {
      console.error('Error loading inventory stats:', error);
    }
  };

  const loadInventoryAlerts = async () => {
    try {
      // Obtener productos con stock bajo
      const productsResponse = await inventoryService.getProducts({
        inStock: true,
        limit: 20
      });

      const alerts: InventoryAlert[] = productsResponse.data
        .filter(product => product.stock <= 5)
        .map(product => ({
          id: product.id,
          productName: product.name,
          currentStock: product.stock,
          minStock: 5,
          maxStock: 50,
          criticalLevel: product.stock === 0,
          lastUpdated: new Date().toISOString(),
          supplier: 'TUMex Supplies',
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          reorderPoint: 5,
          category: product.category as any,
          cost: product.price,
          location: `Almacén ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`
        }));

      setInventoryAlerts(alerts);
    } catch (error) {
      console.error('Error loading inventory alerts:', error);
    }
  };

  const loadMockTemplatesAndTasks = () => {
    // Plantillas de cirugía (mock por ahora)
    setSurgeryTemplates([
      {
        id: '1',
        name: 'Cirugía Cardiovascular Estándar',
        category: 'Cardiovascular',
        complexity: 'complex',
        estimatedPreparationTime: 45,
        usageCount: 12,
        isActive: true,
        lastUsed: '2024-01-10',
        equipmentList: [
          { id: '1', name: 'Monitor Cardíaco', quantity: 1, critical: true },
          { id: '2', name: 'Bisturí Eléctrico', quantity: 1, critical: true },
          { id: '3', name: 'Endoscopio Cardiovascular', quantity: 1, critical: true },
          { id: '11', name: 'Desfibrilador', quantity: 1, critical: true }
        ]
      },
      {
        id: '2',
        name: 'Cirugía Laparoscópica Básica',
        category: 'Laparoscópica',
        complexity: 'medium',
        estimatedPreparationTime: 30,
        usageCount: 25,
        isActive: true,
        lastUsed: '2024-01-12',
        equipmentList: [
          { id: '4', name: 'Endoscopio Olympus', quantity: 1, critical: true },
          { id: '5', name: 'Monitor Quirúrgico', quantity: 1, critical: true },
          { id: '6', name: 'Cable HDMI 4K', quantity: 2, critical: false },
          { id: '12', name: 'Insufflador', quantity: 1, critical: true }
        ]
      },
      {
        id: '3',
        name: 'Endoscopía Digestiva',
        category: 'Endoscópica',
        complexity: 'simple',
        estimatedPreparationTime: 20,
        usageCount: 18,
        isActive: true,
        lastUsed: '2024-01-13',
        equipmentList: [
          { id: '7', name: 'Endoscopio Digestivo', quantity: 1, critical: true },
          { id: '8', name: 'Monitor Endoscópico', quantity: 1, critical: true },
          { id: '13', name: 'Bomba de Succión', quantity: 1, critical: false }
        ]
      }
    ]);

    // Tareas de preparación (mock por ahora)
    setPreparationTasks([
      {
        id: '1',
        orderId: '1',
        orderNumber: 'ORD-2024-001',
        task: 'Preparar equipos para cirugía cardiovascular',
        assignedTo: 'María González',
        dueDate: '2024-01-14T16:00:00Z',
        priority: 'critical',
        status: 'in_progress',
        estimatedDuration: 45,
        actualDuration: 25,
        notes: 'Bisturí eléctrico en mantenimiento, usar alternativo'
      },
      {
        id: '2',
        orderId: '2',
        orderNumber: 'ORD-2024-002',
        task: 'Verificar disponibilidad de cables HDMI',
        assignedTo: 'Carlos Rodríguez',
        dueDate: '2024-01-15T14:00:00Z',
        priority: 'high',
        status: 'pending',
        estimatedDuration: 15,
        notes: 'Cables agotados, solicitar urgente'
      },
      {
        id: '3',
        orderId: '3',
        orderNumber: 'ORD-2024-003',
        task: 'Preparar endoscopio digestivo',
        assignedTo: 'Ana Martínez',
        dueDate: '2024-01-16T12:00:00Z',
        priority: 'medium',
        status: 'pending',
        estimatedDuration: 20
      }
    ]);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-blue-100 text-blue-800',
      in_preparation: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getStockStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
      maintenance: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || colors.available;
  };

  const getStockStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      available: <CheckCircle className="h-4 w-4" />,
      low_stock: <AlertTriangle className="h-4 w-4" />,
      out_of_stock: <Minus className="h-4 w-4" />,
      maintenance: <Wrench className="h-4 w-4" />
    };
    return icons[status] || <CheckCircle className="h-4 w-4" />;
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      approved: 'Aprobada',
      in_preparation: 'En Preparación',
      ready: 'Lista para Recoger',
      delivered: 'Entregada',
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completada',
      overdue: 'Atrasada'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica'
    };
    return labels[priority] || priority;
  };

  // Funciones para el modal de órdenes en preparación
  const handleOpenOrderModal = async (order: ApprovedOrder) => {
    try {
      // Obtener la orden completa desde la base de datos
      const fullOrder = await orderService.getOrderById(order.id);
      
      if (!fullOrder) {
        toast({
          title: "❌ Error",
          description: "No se pudo cargar la información completa de la orden.",
          variant: "destructive"
        });
        return;
      }

      // Transformar ApprovedOrder a WarehouseOrder con información real
      const warehouseOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        doctor: fullOrder.doctorInfo?.doctorName || order.assignedTo || 'No asignado',
        surgery: fullOrder.procedureInfo?.procedureName || order.surgery,
        surgeryDate: fullOrder.surgery_date,
        surgeryTime: fullOrder.surgery_time || '08:00',
        surgeryLocation: fullOrder.surgery_location || 'Sala de Cirugía',
        priority: order.priority,
        status: order.status as 'in_preparation' | 'ready_for_technicians' | 'delivered',
        estimatedValue: fullOrder.totalAmount || order.estimatedValue,
        equipmentList: fullOrder.products?.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          quantity: product.quantity,
          price: product.price,
          notes: undefined,
          confirmed: true, // Por defecto confirmado
          status: product.quantity > 5 ? 'available' : 'low_stock' as const,
          location: `Almacén ${String.fromCharCode(65 + Math.floor(Math.random() * 3))} - Estante ${Math.floor(Math.random() * 10) + 1}`
        })) || order.equipmentList.map(equipment => ({
          id: equipment.id,
          name: equipment.name,
          category: 'Equipo',
          quantity: equipment.quantity,
          price: 1000,
          notes: undefined,
          confirmed: equipment.status === 'available',
          status: equipment.status,
          location: equipment.location
        })),
        preparationDeadline: order.preparationDeadline,
        notes: fullOrder.notes || order.notes,
        assignedTo: fullOrder.doctorInfo?.doctorName || order.assignedTo
      };

      setSelectedOrder(warehouseOrder);
      setIsOrderModalOpen(true);
    } catch (error) {
      console.error('Error loading order details:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo cargar la información completa de la orden.",
        variant: "destructive"
      });
    }
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Actualizar el estado en la base de datos
      await orderService.updateOrderStatus(orderId, newStatus as any);
      
      // Actualizar el estado local
      setApprovedOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as any }
            : order
        )
      );
      
      toast({
        title: "✅ Estado Actualizado",
        description: `La orden ha sido marcada como ${newStatus === 'ready_for_technicians' ? 'lista para técnicos' : newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar el estado de la orden.",
        variant: "destructive"
      });
    }
  };

  const handleEditEquipment = (orderId: string) => {
    // Aquí se abriría el editor de equipos
    console.log('Editar equipos de la orden:', orderId);
    toast({
      title: "🔧 Editor de Equipos",
      description: "Funcionalidad de edición de equipos en desarrollo.",
    });
  };

  const handleDownloadTemplate = async (orderId: string, format: 'pdf' | 'excel') => {
    try {
      // Aquí se generaría y descargaría la plantilla
      console.log(`Descargando plantilla ${format} para orden:`, orderId);
      
      // Simular descarga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Crear un enlace de descarga temporal
      const link = document.createElement('a');
      link.href = `data:text/${format === 'pdf' ? 'pdf' : 'vnd.ms-excel'};charset=utf-8,Plantilla_Orden_${orderId}.${format}`;
      link.download = `Plantilla_Orden_${orderId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tumex-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard de almacén...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Almacén</h1>
          <p className="text-gray-600">Gestión de inventario y preparación de equipos</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/inventory')}>
            <Package className="h-4 w-4 mr-2" />
            Ver Inventario
          </Button>
          <Button onClick={() => navigate('/templates')}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes por Preparar</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedOrders.filter(o => o.status === 'approved').length}</div>
            <p className="text-xs text-muted-foreground">
              de {approvedOrders.length} total
            </p>
            <Progress value={(approvedOrders.filter(o => o.status === 'approved').length / approvedOrders.length) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stockStatus.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              {stockStatus.lowStockItems} con stock bajo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stockStatus.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              {stockStatus.reorderValue > 0 && `Reordenar: ${formatCurrency(stockStatus.reorderValue)}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockStatus.efficiency}%</div>
            <p className="text-xs text-muted-foreground">
              {stockStatus.availableItems} de {stockStatus.totalItems} disponibles
            </p>
            <Progress value={stockStatus.efficiency} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Órdenes Aprobadas por Preparar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Órdenes Aprobadas por Preparar
              </CardTitle>
              <Badge variant="outline">{approvedOrders.filter(o => o.status === 'approved').length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvedOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="border rounded-lg p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{order.orderNumber}</span>
                        <Badge className={getPriorityColor(order.priority)}>
                          {getPriorityLabel(order.priority)}
                        </Badge>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.surgery}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(order.estimatedValue)}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.surgeryDate)}</p>
                    </div>
                  </div>
                  
                  {/* Equipos requeridos */}
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Equipos:</p>
                    <div className="flex flex-wrap gap-1">
                      {order.equipmentList.slice(0, 3).map((equipment) => (
                        <div key={equipment.id} className="flex items-center gap-1">
                          {getStockStatusIcon(equipment.status)}
                          <span className="text-xs text-gray-600">
                            {equipment.name} ({equipment.quantity})
                          </span>
                        </div>
                      ))}
                      {order.equipmentList.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{order.equipmentList.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>

                  {order.assignedTo && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Asignado a: {order.assignedTo}
                      </span>
                      <span className="text-xs text-gray-500">
                        Fecha límite: {formatTime(order.preparationDeadline)}
                      </span>
                    </div>
                  )}

                  {/* Botón de Ver Orden (navega a /orders y resalta) */}
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/orders', { state: { highlightOrderId: order.id } })}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Orden
                    </Button>
                  </div>
                </div>
              ))}
              
              {approvedOrders.length > 4 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/orders')}>
                  Ver todas las órdenes ({approvedOrders.length})
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Inventario Mejoradas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Inventario
              </CardTitle>
              <Badge variant="destructive">{inventoryAlerts.filter(item => item.criticalLevel).length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <InventoryAlert 
              maxItems={4}
              filterByStatus="critical"
              showActions={true}
              onItemClick={(item) => {
                // Navegar al detalle del inventario
                navigate(`/inventory/${item.id}`);
              }}
              onReorder={(item) => {
                // Abrir modal de reordenar
                console.log('Reordenar:', item.productName);
                // TODO: Implementar modal de reordenar
              }}
              onMaintenance={(item) => {
                // Abrir modal de mantenimiento
                console.log('Mantenimiento:', item.productName);
                // TODO: Implementar modal de mantenimiento
              }}
            />
            
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/inventory')}>
              Ver inventario completo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Estado de Stock con Códigos de Color */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estado de Stock
              </CardTitle>
              <Badge variant="outline">{stockStatus.totalItems} items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{stockStatus.availableItems}</span>
                  <span className="text-xs text-gray-500">
                    ({((stockStatus.availableItems / stockStatus.totalItems) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Stock Bajo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{stockStatus.lowStockItems}</span>
                  <span className="text-xs text-gray-500">
                    ({((stockStatus.lowStockItems / stockStatus.totalItems) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Minus className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Sin Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{stockStatus.outOfStockItems}</span>
                  <span className="text-xs text-gray-500">
                    ({((stockStatus.outOfStockItems / stockStatus.totalItems) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">En Mantenimiento</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{stockStatus.maintenanceItems}</span>
                  <span className="text-xs text-gray-500">
                    ({((stockStatus.maintenanceItems / stockStatus.totalItems) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {((stockStatus.availableItems / stockStatus.totalItems) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500">Disponibilidad</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stockStatus.totalValue)}
                  </p>
                  <p className="text-xs text-gray-500">Valor Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plantillas de Cirugía */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Plantillas de Cirugía
              </CardTitle>
              <Badge variant="outline">{surgeryTemplates.filter(t => t.isActive).length} activas</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {surgeryTemplates.slice(0, 3).map((template) => (
                <div key={template.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{template.name}</span>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{template.category}</p>
                      <p className="text-xs text-gray-500">
                        Complejidad: {template.complexity} • Tiempo: {formatDuration(template.estimatedPreparationTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{template.usageCount} usos</p>
                      {template.lastUsed && (
                        <p className="text-xs text-gray-500">
                          Último: {formatDate(template.lastUsed)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Equipos ({template.equipmentList.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {template.equipmentList.slice(0, 3).map((equipment) => (
                        <Badge key={equipment.id} variant="outline" className="text-xs">
                          {equipment.name} {equipment.critical && '*'}
                        </Badge>
                      ))}
                      {template.equipmentList.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{template.equipmentList.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full" onClick={() => navigate('/templates')}>
                Ver todas las plantillas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tareas de Preparación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Tareas de Preparación Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {preparationTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{task.orderNumber}</span>
                      <Badge className={getPriorityColor(task.priority)}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusLabel(task.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{task.task}</p>
                    <p className="text-xs text-gray-500">
                      Asignado a: {task.assignedTo}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    Estimado: {formatDuration(task.estimatedDuration)}
                  </span>
                  <span className="text-xs text-gray-500">
                    Fecha: {formatTime(task.dueDate)}
                  </span>
                </div>

                {task.notes && (
                  <p className="text-xs text-gray-600 mt-2 italic">
                    "{task.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/orders')}
            >
              <FileCheck className="h-6 w-6 mb-2" />
              <span className="text-sm">Revisar Órdenes</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/inventory')}
            >
              <Package className="h-6 w-6 mb-2" />
              <span className="text-sm">Gestionar Stock</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/templates')}
            >
              <ClipboardList className="h-6 w-6 mb-2" />
              <span className="text-sm">Plantillas</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
            >
              <ShoppingCart className="h-6 w-6 mb-2" />
              <span className="text-sm">Solicitar Stock</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Orden en Preparación */}
      <WarehouseOrderModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
        order={selectedOrder}
        onUpdateStatus={handleUpdateOrderStatus}
        onEditEquipment={handleEditEquipment}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
};

export default WarehouseDashboard; 