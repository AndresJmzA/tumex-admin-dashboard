import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  Minus, 
  Wrench, 
  Clock, 
  DollarSign, 
  Package, 
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Bell,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  Truck,
  FileText,
  BarChart3,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

// Tipos para las alertas de inventario
export interface InventoryItem {
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
  status: 'available' | 'low_stock' | 'out_of_stock' | 'maintenance';
  lastOrderDate?: string;
  orderHistory: OrderHistory[];
  maintenanceHistory: MaintenanceRecord[];
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoReorder: boolean;
  reorderQuantity: number;
}

interface OrderHistory {
  id: string;
  date: string;
  quantity: number;
  supplier: string;
  cost: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
}

interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'preventive' | 'corrective' | 'calibration';
  description: string;
  technician: string;
  cost: number;
  nextMaintenance?: string;
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
  criticalAlerts: number;
  pendingOrders: number;
}

interface InventoryAlertProps {
  onItemClick?: (item: InventoryItem) => void;
  onReorder?: (item: InventoryItem) => void;
  onMaintenance?: (item: InventoryItem) => void;
  showActions?: boolean;
  maxItems?: number;
  filterByStatus?: 'all' | 'critical' | 'low_stock' | 'out_of_stock' | 'maintenance';
}

export const InventoryAlert: React.FC<InventoryAlertProps> = ({
  onItemClick,
  onReorder,
  onMaintenance,
  showActions = true,
  maxItems = 10,
  filterByStatus = 'all'
}) => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockStatus, setStockStatus] = useState<StockStatus>({
    totalItems: 0,
    availableItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    maintenanceItems: 0,
    totalValue: 0,
    reorderValue: 0,
    efficiency: 0,
    criticalAlerts: 0,
    pendingOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'stock' | 'cost' | 'date'>('priority');

  // Cargar datos mock para las alertas de inventario
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockItems: InventoryItem[] = [
      {
        id: '1',
        productName: 'Cable HDMI 4K',
        currentStock: 0,
        minStock: 10,
        maxStock: 50,
        criticalLevel: true,
        lastUpdated: '2024-01-14T10:30:00Z',
        supplier: 'TechSupply Co.',
        estimatedDelivery: '2024-01-18',
        reorderPoint: 5,
        category: 'consumables',
        cost: 150,
        location: 'Almacén C - Estante 5',
        status: 'out_of_stock',
        priority: 'critical',
        autoReorder: true,
        reorderQuantity: 20,
        orderHistory: [
          {
            id: '1',
            date: '2024-01-10',
            quantity: 25,
            supplier: 'TechSupply Co.',
            cost: 3750,
            status: 'delivered'
          }
        ],
        maintenanceHistory: [],
        notes: 'Producto de alto consumo, reordenar inmediatamente'
      },
      {
        id: '2',
        productName: 'Endoscopio Olympus',
        currentStock: 2,
        minStock: 5,
        maxStock: 15,
        criticalLevel: true,
        lastUpdated: '2024-01-14T09:15:00Z',
        supplier: 'Olympus Medical',
        estimatedDelivery: '2024-01-20',
        reorderPoint: 3,
        category: 'equipment',
        cost: 25000,
        location: 'Almacén A - Estante 2',
        status: 'low_stock',
        priority: 'high',
        autoReorder: false,
        reorderQuantity: 3,
        orderHistory: [
          {
            id: '2',
            date: '2024-01-08',
            quantity: 5,
            supplier: 'Olympus Medical',
            cost: 125000,
            status: 'confirmed'
          }
        ],
        maintenanceHistory: [
          {
            id: '1',
            date: '2024-01-05',
            type: 'preventive',
            description: 'Limpieza y calibración estándar',
            technician: 'Carlos Rodríguez',
            cost: 500,
            nextMaintenance: '2024-02-05'
          }
        ],
        notes: 'Equipo crítico para cirugías laparoscópicas'
      },
      {
        id: '3',
        productName: 'Bisturí Eléctrico',
        currentStock: 1,
        minStock: 3,
        maxStock: 8,
        criticalLevel: true,
        lastUpdated: '2024-01-14T08:20:00Z',
        supplier: 'MedTech Solutions',
        estimatedDelivery: '2024-01-19',
        reorderPoint: 2,
        category: 'equipment',
        cost: 8000,
        location: 'Taller de Mantenimiento',
        status: 'maintenance',
        priority: 'critical',
        autoReorder: true,
        reorderQuantity: 2,
        orderHistory: [
          {
            id: '3',
            date: '2024-01-12',
            quantity: 2,
            supplier: 'MedTech Solutions',
            cost: 16000,
            status: 'pending'
          }
        ],
        maintenanceHistory: [
          {
            id: '2',
            date: '2024-01-14',
            type: 'corrective',
            description: 'Reparación de cable de alimentación',
            technician: 'María González',
            cost: 1200,
            nextMaintenance: '2024-01-28'
          }
        ],
        notes: 'En mantenimiento por falla eléctrica'
      },
      {
        id: '4',
        productName: 'Monitor Quirúrgico',
        currentStock: 3,
        minStock: 4,
        maxStock: 12,
        criticalLevel: false,
        lastUpdated: '2024-01-14T11:45:00Z',
        supplier: 'Surgical Equipment',
        reorderPoint: 3,
        category: 'equipment',
        cost: 15000,
        location: 'Almacén A - Estante 1',
        status: 'low_stock',
        priority: 'medium',
        autoReorder: true,
        reorderQuantity: 2,
        orderHistory: [
          {
            id: '4',
            date: '2024-01-06',
            quantity: 3,
            supplier: 'Surgical Equipment',
            cost: 45000,
            status: 'delivered'
          }
        ],
        maintenanceHistory: [
          {
            id: '3',
            date: '2024-01-10',
            type: 'calibration',
            description: 'Calibración de color y brillo',
            technician: 'Ana Martínez',
            cost: 800,
            nextMaintenance: '2024-02-10'
          }
        ]
      },
      {
        id: '5',
        productName: 'Guantes Quirúrgicos L',
        currentStock: 8,
        minStock: 20,
        maxStock: 100,
        criticalLevel: false,
        lastUpdated: '2024-01-14T12:00:00Z',
        supplier: 'Medical Supplies Inc.',
        reorderPoint: 15,
        category: 'consumables',
        cost: 25,
        location: 'Almacén C - Estante 1',
        status: 'low_stock',
        priority: 'medium',
        autoReorder: true,
        reorderQuantity: 50,
        orderHistory: [
          {
            id: '5',
            date: '2024-01-02',
            quantity: 100,
            supplier: 'Medical Supplies Inc.',
            cost: 2500,
            status: 'delivered'
          }
        ],
        maintenanceHistory: [],
        notes: 'Consumo alto en cirugías de emergencia'
      },
      {
        id: '6',
        productName: 'Desfibrilador Portátil',
        currentStock: 0,
        minStock: 2,
        maxStock: 5,
        criticalLevel: true,
        lastUpdated: '2024-01-14T13:30:00Z',
        supplier: 'Cardiac Care Systems',
        estimatedDelivery: '2024-01-22',
        reorderPoint: 1,
        category: 'equipment',
        cost: 35000,
        location: 'Almacén A - Estante 4',
        status: 'out_of_stock',
        priority: 'critical',
        autoReorder: true,
        reorderQuantity: 1,
        orderHistory: [
          {
            id: '6',
            date: '2024-01-13',
            quantity: 1,
            supplier: 'Cardiac Care Systems',
            cost: 35000,
            status: 'confirmed'
          }
        ],
        maintenanceHistory: [
          {
            id: '4',
            date: '2024-01-12',
            type: 'preventive',
            description: 'Verificación de baterías y electrodos',
            technician: 'Luis Fernández',
            cost: 300,
            nextMaintenance: '2024-02-12'
          }
        ],
        notes: 'Equipo crítico para emergencias cardíacas'
      }
    ];

    setInventoryItems(mockItems);

    // Calcular estadísticas
    const totalItems = mockItems.length;
    const availableItems = mockItems.filter(item => item.status === 'available').length;
    const lowStockItems = mockItems.filter(item => item.status === 'low_stock').length;
    const outOfStockItems = mockItems.filter(item => item.status === 'out_of_stock').length;
    const maintenanceItems = mockItems.filter(item => item.status === 'maintenance').length;
    const totalValue = mockItems.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);
    const reorderValue = mockItems
      .filter(item => item.criticalLevel)
      .reduce((sum, item) => sum + (item.reorderQuantity * item.cost), 0);
    const efficiency = totalItems > 0 ? ((availableItems / totalItems) * 100) : 0;
    const criticalAlerts = mockItems.filter(item => item.criticalLevel).length;
    const pendingOrders = mockItems.filter(item => 
      item.orderHistory.some(order => order.status === 'pending' || order.status === 'confirmed')
    ).length;

    setStockStatus({
      totalItems,
      availableItems,
      lowStockItems,
      outOfStockItems,
      maintenanceItems,
      totalValue,
      reorderValue,
      efficiency,
      criticalAlerts,
      pendingOrders
    });

    setIsLoading(false);
  };

  // Filtrar y ordenar items
  const filteredItems = inventoryItems
    .filter(item => {
      const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStatus = filterByStatus === 'all' || item.status === filterByStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'stock':
          return a.currentStock - b.currentStock;
        case 'cost':
          return b.cost - a.cost;
        case 'date':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    })
    .slice(0, maxItems);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800',
      maintenance: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || colors.available;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      available: <CheckCircle className="h-4 w-4" />,
      low_stock: <AlertTriangle className="h-4 w-4" />,
      out_of_stock: <Minus className="h-4 w-4" />,
      maintenance: <Wrench className="h-4 w-4" />
    };
    return icons[status] || <CheckCircle className="h-4 w-4" />;
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

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica'
    };
    return labels[priority] || priority;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      equipment: 'Equipos',
      consumables: 'Consumibles',
      spare_parts: 'Repuestos',
      tools: 'Herramientas'
    };
    return labels[category] || category;
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

  const getStockPercentage = (current: number, min: number, max: number) => {
    if (current <= min) return 0;
    if (current >= max) return 100;
    return ((current - min) / (max - min)) * 100;
  };

  const handleReorder = (item: InventoryItem) => {
    if (onReorder) {
      onReorder(item);
    }
  };

  const handleMaintenance = (item: InventoryItem) => {
    if (onMaintenance) {
      onMaintenance(item);
    }
  };

  const handleItemClick = (item: InventoryItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tumex-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando alertas de inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stockStatus.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              de {stockStatus.totalItems} items total
            </p>
            <Progress 
              value={(stockStatus.criticalAlerts / stockStatus.totalItems) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <Minus className="h-4 w-4 text-red-600" />
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
            <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stockStatus.maintenanceItems}</div>
            <p className="text-xs text-muted-foreground">
              equipos fuera de servicio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stockStatus.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              valor: {formatCurrency(stockStatus.reorderValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles de filtro y búsqueda */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Inventario
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tumex-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tumex-primary-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                <option value="equipment">Equipos</option>
                <option value="consumables">Consumibles</option>
                <option value="spare_parts">Repuestos</option>
                <option value="tools">Herramientas</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tumex-primary-500 focus:border-transparent"
              >
                <option value="priority">Por Prioridad</option>
                <option value="stock">Por Stock</option>
                <option value="cost">Por Costo</option>
                <option value="date">Por Fecha</option>
              </select>
            </div>
          </div>

          {/* Lista de alertas */}
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{item.productName}</span>
                      {item.criticalLevel && (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1">
                          {item.status === 'available' ? 'Disponible' :
                           item.status === 'low_stock' ? 'Stock Bajo' :
                           item.status === 'out_of_stock' ? 'Sin Stock' :
                           'Mantenimiento'}
                        </span>
                      </Badge>
                      <Badge className={getPriorityColor(item.priority)}>
                        {getPriorityLabel(item.priority)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Stock Actual</p>
                        <p className="font-medium">{item.currentStock} / {item.minStock} (mín)</p>
                        <Progress 
                          value={getStockPercentage(item.currentStock, item.minStock, item.maxStock)} 
                          className="mt-1" 
                        />
                      </div>
                      <div>
                        <p className="text-gray-600">Ubicación</p>
                        <p className="font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Costo</p>
                        <p className="font-medium">{formatCurrency(item.cost)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Última Actualización</p>
                        <p className="font-medium">{formatTime(item.lastUpdated)}</p>
                      </div>
                    </div>

                    {item.estimatedDelivery && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-700 flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          Entrega estimada: {formatDate(item.estimatedDelivery)}
                        </p>
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-xs text-gray-600 mt-2 italic">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  {showActions && (
                    <div className="flex flex-col gap-2 ml-4">
                      {item.status === 'out_of_stock' && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReorder(item);
                          }}
                        >
                          <Package className="h-3 w-3 mr-1" />
                          Reordenar
                        </Button>
                      )}
                      
                      {item.status === 'maintenance' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMaintenance(item);
                          }}
                        >
                          <Wrench className="h-3 w-3 mr-1" />
                          Mantenimiento
                        </Button>
                      )}

                      {item.autoReorder && (
                        <Badge variant="outline" className="text-xs">
                          <Bell className="h-3 w-3 mr-1" />
                          Auto-reordenar
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron alertas de inventario</p>
                <p className="text-sm text-gray-500">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryAlert; 