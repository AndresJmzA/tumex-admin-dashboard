import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Warehouse, 
  Package, 
  Clipboard, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Building,
  Calendar,
  Eye,
  Edit,
  Plus,
  Minus,
  Zap,
  Shield,
  FileText,
  Printer,
  Download,
  Upload,
  Settings,
  BarChart3,
  Target,
  Award,
  Star,
  Truck,
  MapPin,
  Package as PackageIcon,
  Warehouse as WarehouseIcon,
  Clipboard as ClipboardIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Eye as EyeIcon,
  Edit as EditIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  FileText as FileTextIcon,
  Printer as PrinterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  BarChart3 as BarChart3Icon,
  Target as TargetIcon,
  Award as AwardIcon,
  Star as StarIcon,
  Truck as TruckIcon,
  MapPin as MapPinIcon
} from 'lucide-react';
import { ExtendedOrder } from '@/services/orderService';
import OrderStateTransition from './OrderStateTransition';
import TemplateManagementModal from './TemplateManagementModal';
import WarehouseTemplateModal from './WarehouseTemplateModal';

interface WarehouseOrderCardProps {
  order: ExtendedOrder;
  onUpdate?: (updatedOrder: ExtendedOrder) => void;
  showActions?: boolean;
  variant?: 'compact' | 'detailed' | 'full';
}

interface InventoryItem {
  id: string;
  name: string;
  category: 'equipment' | 'consumables' | 'tools' | 'safety';
  quantity: number;
  available: number;
  reserved: number;
  location: string;
  minStock: number;
  maxStock: number;
  lastRestock: string;
  nextRestock: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
  supplier: string;
  cost: number;
  barcode: string;
}

interface WarehouseTemplate {
  id: string;
  name: string;
  type: 'entrada' | 'salida' | 'mixta';
  description: string;
  items: TemplateItem[];
  createdBy: string;
  createdAt: string;
  lastUsed: string;
  usageCount: number;
  isActive: boolean;
}

interface TemplateItem {
  id: string;
  name: string;
  quantity: number;
  required: boolean;
  category: string;
  notes?: string;
}

interface PreparationStatus {
  stage: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  estimatedCompletion: string;
  actualCompletion?: string;
  notes: string[];
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface WarehouseAlert {
  id: string;
  type: 'low_stock' | 'expired_item' | 'equipment_maintenance' | 'delivery_delay' | 'quality_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  affectedItems: string[];
}

interface DeliveryStatus {
  id: string;
  type: 'incoming' | 'outgoing';
  status: 'scheduled' | 'in_transit' | 'delivered' | 'delayed';
  supplier: string;
  expectedDate: string;
  actualDate?: string;
  items: DeliveryItem[];
  trackingNumber?: string;
  notes: string;
}

interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  received: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
}

const WarehouseOrderCard: React.FC<WarehouseOrderCardProps> = ({
  order,
  onUpdate,
  showActions = true,
  variant = 'detailed'
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showTemplateManagement, setShowTemplateManagement] = useState(false);
  const [showWarehouseTemplate, setShowWarehouseTemplate] = useState(false);

  // Mock data para inventario
  const inventoryItems: InventoryItem[] = [
    {
      id: 'inv-001',
      name: 'Endoscopio Flexible Olympus',
      category: 'equipment',
      quantity: 5,
      available: 3,
      reserved: 2,
      location: 'Estante A-1',
      minStock: 2,
      maxStock: 8,
      lastRestock: '2024-01-10',
      nextRestock: '2024-02-10',
      status: 'in_stock',
      supplier: 'Olympus Medical',
      cost: 45000,
      barcode: 'OLY-2024-001'
    },
    {
      id: 'inv-002',
      name: 'Guantes de Látex Talla M',
      category: 'consumables',
      quantity: 500,
      available: 150,
      reserved: 50,
      location: 'Estante B-3',
      minStock: 200,
      maxStock: 1000,
      lastRestock: '2024-01-08',
      nextRestock: '2024-01-22',
      status: 'low_stock',
      supplier: 'Medline',
      cost: 25,
      barcode: 'GLA-2024-002'
    },
    {
      id: 'inv-003',
      name: 'Bisturí Eléctrico Medtronic',
      category: 'equipment',
      quantity: 3,
      available: 0,
      reserved: 3,
      location: 'Taller de Mantenimiento',
      minStock: 2,
      maxStock: 5,
      lastRestock: '2024-01-12',
      nextRestock: '2024-01-20',
      status: 'out_of_stock',
      supplier: 'Medtronic',
      cost: 35000,
      barcode: 'BIS-2024-003'
    }
  ];

  // Mock data para plantillas de almacén
  const warehouseTemplates: WarehouseTemplate[] = [
    {
      id: 'template-001',
      name: 'Cirugía Endoscópica Estándar',
      type: 'mixta',
      description: 'Plantilla para cirugías endoscópicas básicas',
      items: [
        { id: 'item-001', name: 'Endoscopio Flexible', quantity: 1, required: true, category: 'equipment' },
        { id: 'item-002', name: 'Guantes de Látex', quantity: 2, required: true, category: 'consumables' },
        { id: 'item-003', name: 'Bisturí Eléctrico', quantity: 1, required: true, category: 'equipment' }
      ],
      createdBy: 'Jefe de Almacén',
      createdAt: '2024-01-01',
      lastUsed: '2024-01-15',
      usageCount: 12,
      isActive: true
    },
    {
      id: 'template-002',
      name: 'Cirugía Laparoscópica Compleja',
      type: 'mixta',
      description: 'Plantilla para cirugías laparoscópicas avanzadas',
      items: [
        { id: 'item-004', name: 'Laparoscopio', quantity: 1, required: true, category: 'equipment' },
        { id: 'item-005', name: 'Trocares', quantity: 4, required: true, category: 'tools' },
        { id: 'item-006', name: 'Insufflator', quantity: 1, required: true, category: 'equipment' }
      ],
      createdBy: 'Jefe de Almacén',
      createdAt: '2024-01-05',
      lastUsed: '2024-01-14',
      usageCount: 8,
      isActive: true
    }
  ];

  // Mock data para estado de preparación
  const preparationStatus: PreparationStatus = {
    stage: 'in_progress',
    progress: 75,
    estimatedCompletion: '2024-01-15T14:00:00Z',
    assignedTo: 'Carlos Rodríguez',
    priority: 'high',
    notes: [
      'Equipos principales verificados y listos',
      'Pendiente: Bisturí eléctrico en mantenimiento',
      'Pendiente: Reabastecimiento de guantes',
      'Plantilla de entrada/salida generada'
    ]
  };

  // Mock data para alertas de almacén
  const warehouseAlerts: WarehouseAlert[] = [
    {
      id: 'alert-001',
      type: 'low_stock',
      severity: 'medium',
      message: 'Guantes de látex bajo stock (150 unidades)',
      timestamp: '2024-01-15T08:00:00Z',
      resolved: false,
      affectedItems: ['inv-002']
    },
    {
      id: 'alert-002',
      type: 'equipment_maintenance',
      severity: 'high',
      message: 'Bisturí eléctrico en mantenimiento hasta 20/01',
      timestamp: '2024-01-15T07:30:00Z',
      resolved: false,
      affectedItems: ['inv-003']
    },
    {
      id: 'alert-003',
      type: 'delivery_delay',
      severity: 'low',
      message: 'Entrega de endoscopios retrasada 2 días',
      timestamp: '2024-01-15T06:45:00Z',
      resolved: true,
      affectedItems: ['inv-001']
    }
  ];

  // Mock data para entregas
  const deliveryStatus: DeliveryStatus[] = [
    {
      id: 'delivery-001',
      type: 'incoming',
      status: 'scheduled',
      supplier: 'Olympus Medical',
      expectedDate: '2024-01-20',
      items: [
        { id: 'item-001', name: 'Endoscopio Flexible', quantity: 2, received: 0, quality: 'excellent' },
        { id: 'item-002', name: 'Cámaras HD', quantity: 1, received: 0, quality: 'excellent' }
      ],
      notes: 'Entrega programada para el 20 de enero'
    },
    {
      id: 'delivery-002',
      type: 'outgoing',
      status: 'delivered',
      supplier: 'Hospital General',
      expectedDate: '2024-01-15',
      actualDate: '2024-01-15T10:00:00Z',
      items: [
        { id: 'item-003', name: 'Endoscopio Flexible', quantity: 1, received: 1, quality: 'excellent' },
        { id: 'item-004', name: 'Guantes de Látex', quantity: 50, received: 50, quality: 'good' }
      ],
      notes: 'Entrega completada exitosamente'
    }
  ];

  // Obtener estado de preparación
  const getPreparationStatus = () => {
    switch (preparationStatus.stage) {
      case 'not_started':
        return { status: 'not_started', label: 'No Iniciada', color: 'bg-gray-100 text-gray-800' };
      case 'in_progress':
        return { status: 'in_progress', label: 'En Progreso', color: 'bg-blue-100 text-blue-800' };
      case 'completed':
        return { status: 'completed', label: 'Completada', color: 'bg-green-100 text-green-800' };
      case 'delayed':
        return { status: 'delayed', label: 'Retrasada', color: 'bg-red-100 text-red-800' };
      default:
        return { status: 'unknown', label: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Obtener estado de inventario
  const getInventoryStatus = () => {
    const total = inventoryItems.length;
    const inStock = inventoryItems.filter(item => item.status === 'in_stock').length;
    const lowStock = inventoryItems.filter(item => item.status === 'low_stock').length;
    const outOfStock = inventoryItems.filter(item => item.status === 'out_of_stock').length;
    
    return { total, inStock, lowStock, outOfStock };
  };

  // Obtener estado de alertas
  const getAlertStatus = () => {
    const total = warehouseAlerts.length;
    const critical = warehouseAlerts.filter(alert => alert.severity === 'critical' && !alert.resolved).length;
    const high = warehouseAlerts.filter(alert => alert.severity === 'high' && !alert.resolved).length;
    const medium = warehouseAlerts.filter(alert => alert.severity === 'medium' && !alert.resolved).length;
    
    return { total, critical, high, medium };
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener icono de severidad
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Obtener icono de tipo de alerta
  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <Package className="h-4 w-4 text-orange-600" />;
      case 'expired_item':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'equipment_maintenance':
        return <Wrench className="h-4 w-4 text-yellow-600" />;
      case 'delivery_delay':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'quality_issue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const prepStatus = getPreparationStatus();
  const inventoryStatus = getInventoryStatus();
  const alertStatus = getAlertStatus();

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetails(true)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-medium">{order.orderId}</span>
                <span className="text-sm text-gray-600">{order.patient_name}</span>
              </div>
              <Badge className={prepStatus.color}>
                {prepStatus.label}
              </Badge>
            </div>
            <div className="text-right">
              <div className="font-medium">{inventoryStatus.total} items</div>
              <div className="text-sm text-gray-600">
                {new Date(order.surgery_date).toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Orden {order.orderId}
              <Badge className={prepStatus.color}>
                {prepStatus.label}
              </Badge>
            </CardTitle>
            {showActions && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWarehouseTemplate(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Plantilla
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateManagement(true)}
                >
                  <Clipboard className="h-4 w-4 mr-2" />
                  Gestionar Plantillas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Paciente:</span>
                                 <span>{order.patient_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Hospital:</span>
                <span>{order.surgery_location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Fecha:</span>
                <span>{new Date(order.surgery_date).toLocaleDateString('es-ES')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Inventario:</span>
                <span>{inventoryStatus.total} items</span>
              </div>
              <div className="flex items-center gap-2">
                <Clipboard className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Plantillas:</span>
                <span>{warehouseTemplates.length} disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Alertas:</span>
                <Badge className={
                  alertStatus.critical > 0 ? 'bg-red-100 text-red-800' :
                  alertStatus.high > 0 ? 'bg-orange-100 text-orange-800' :
                  alertStatus.medium > 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }>
                  {alertStatus.total} activas
                </Badge>
              </div>
            </div>
          </div>

          {/* Progreso de preparación */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Progreso de Preparación</h4>
              <span className="text-sm text-gray-600">{preparationStatus.progress}%</span>
            </div>
            <Progress value={preparationStatus.progress} className="mb-2" />
            <div className="text-sm text-gray-600">
              Asignado a: {preparationStatus.assignedTo} | 
              Estimado: {formatDate(preparationStatus.estimatedCompletion)}
            </div>
          </div>

          {/* Estado de inventario */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Estado de Inventario
            </h4>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-medium text-green-800">{inventoryStatus.inStock}</div>
                <div className="text-xs text-green-600">En Stock</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-medium text-yellow-800">{inventoryStatus.lowStock}</div>
                <div className="text-xs text-yellow-600">Stock Bajo</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="font-medium text-red-800">{inventoryStatus.outOfStock}</div>
                <div className="text-xs text-red-600">Sin Stock</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-medium text-blue-800">{warehouseTemplates.length}</div>
                <div className="text-xs text-blue-600">Plantillas</div>
              </div>
            </div>
          </div>

          {/* Items críticos */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Items Críticos
            </h4>
            <div className="space-y-2">
              {inventoryItems.filter(item => item.status !== 'in_stock').map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-gray-600">{item.category}</div>
                    </div>
                    <Badge className={
                      item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }>
                      {item.status === 'low_stock' ? 'Stock Bajo' :
                       item.status === 'out_of_stock' ? 'Sin Stock' : 'Expirado'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{item.available}/{item.quantity}</div>
                    <div className="text-xs text-gray-600">{item.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones rápidas */}
          {showActions && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Acciones Rápidas</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowWarehouseTemplate(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Plantilla
                </Button>
                <Button variant="outline" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Verificar Inventario
                </Button>
                <Button variant="outline" size="sm">
                  <Truck className="h-4 w-4 mr-2" />
                  Gestionar Entregas
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles completos */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Detalles de Almacén - Orden {order.orderId}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="inventory">Inventario</TabsTrigger>
              <TabsTrigger value="templates">Plantillas</TabsTrigger>
              <TabsTrigger value="deliveries">Entregas</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de la orden */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información de la Orden</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Paciente:</span>
                                                 <p className="text-gray-600">{order.patient_name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Orden ID:</span>
                        <p className="text-gray-600">{order.orderId}</p>
                      </div>
                      <div>
                        <span className="font-medium">Fecha Cirugía:</span>
                        <p className="text-gray-600">
                          {new Date(order.surgeryDate).toLocaleDateString('es-ES')} a las {order.surgeryTime}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Hospital:</span>
                        <p className="text-gray-600">{order.surgeryLocation}</p>
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span>
                        <p className="text-gray-600">{order.status}</p>
                      </div>
                      <div>
                        <span className="font-medium">Progreso:</span>
                        <p className="text-gray-600">{prepStatus.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Métricas de almacén */}
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Almacén</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">{inventoryStatus.total}</div>
                        <div className="text-sm text-blue-600">Items</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">{inventoryStatus.inStock}</div>
                        <div className="text-sm text-green-600">En Stock</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <div className="text-2xl font-bold text-yellow-600">{alertStatus.total}</div>
                        <div className="text-sm text-yellow-600">Alertas</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">{warehouseTemplates.length}</div>
                        <div className="text-sm text-purple-600">Plantillas</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notas de preparación */}
              <Card>
                <CardHeader>
                  <CardTitle>Notas de Preparación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {preparationStatus.notes.map((note, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 border rounded">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{note}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <div className="space-y-4">
                {inventoryItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <Badge className={
                            item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                            item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'out_of_stock' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }>
                            {item.status === 'in_stock' ? 'En Stock' :
                             item.status === 'low_stock' ? 'Stock Bajo' :
                             item.status === 'out_of_stock' ? 'Sin Stock' : 'Expirado'}
                          </Badge>
                          <Badge variant="outline">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Disponible:</span> {item.available}/{item.quantity}
                          </div>
                          <div>
                            <span className="font-medium">Ubicación:</span> {item.location}
                          </div>
                          <div>
                            <span className="font-medium">Proveedor:</span> {item.supplier}
                          </div>
                          <div>
                            <span className="font-medium">Costo:</span> ${item.cost.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Último Reabastecimiento:</span> {item.lastRestock}
                          </div>
                          <div>
                            <span className="font-medium">Próximo Reabastecimiento:</span> {item.nextRestock}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="space-y-4">
                {warehouseTemplates.map((template) => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge className={
                            template.type === 'entrada' ? 'bg-green-100 text-green-800' :
                            template.type === 'salida' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {template.type === 'entrada' ? 'Entrada' :
                             template.type === 'salida' ? 'Salida' : 'Mixta'}
                          </Badge>
                          <Badge className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {template.isActive ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Creado por:</span> {template.createdBy}
                          </div>
                          <div>
                            <span className="font-medium">Usos:</span> {template.usageCount}
                          </div>
                          <div>
                            <span className="font-medium">Creado:</span> {template.createdAt}
                          </div>
                          <div>
                            <span className="font-medium">Último uso:</span> {template.lastUsed}
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-sm font-medium">Items ({template.items.length}):</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.items.map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item.name} x{item.quantity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="deliveries" className="space-y-4">
              <div className="space-y-4">
                {deliveryStatus.map((delivery) => (
                  <Card key={delivery.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{delivery.supplier}</h4>
                          <Badge className={
                            delivery.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            delivery.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                            delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {delivery.status === 'scheduled' ? 'Programada' :
                             delivery.status === 'in_transit' ? 'En Tránsito' :
                             delivery.status === 'delivered' ? 'Entregada' : 'Retrasada'}
                          </Badge>
                          <Badge variant="outline">
                            {delivery.type === 'incoming' ? 'Entrada' : 'Salida'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Fecha Esperada:</span> {delivery.expectedDate}
                          </div>
                          {delivery.actualDate && (
                            <div>
                              <span className="font-medium">Fecha Real:</span> {formatDate(delivery.actualDate)}
                            </div>
                          )}
                          {delivery.trackingNumber && (
                            <div>
                              <span className="font-medium">Tracking:</span> {delivery.trackingNumber}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Items:</span> {delivery.items.length}
                          </div>
                        </div>
                        {delivery.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">Notas:</span>
                            <p className="text-sm text-gray-600">{delivery.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div className="space-y-4">
                {warehouseAlerts.map((alert) => (
                  <Card key={alert.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {getAlertTypeIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{alert.message}</span>
                          <Badge className={
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {alert.severity === 'critical' ? 'Crítico' :
                             alert.severity === 'high' ? 'Alto' :
                             alert.severity === 'medium' ? 'Medio' : 'Bajo'}
                          </Badge>
                          {alert.resolved && (
                            <Badge className="bg-green-100 text-green-800">
                              Resuelto
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {formatDate(alert.timestamp)}
                        </div>
                        {alert.affectedItems.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Items afectados: {alert.affectedItems.length}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">
                          Resolver
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal de gestión de plantillas */}
      <TemplateManagementModal
        isOpen={showTemplateManagement}
        onClose={() => setShowTemplateManagement(false)}
        order={order}
        onSave={(template) => {
          console.log('Plantilla guardada:', template);
          setShowTemplateManagement(false);
        }}
      />

      {/* Modal de generación de plantillas de almacén */}
      <WarehouseTemplateModal
        isOpen={showWarehouseTemplate}
        onClose={() => setShowWarehouseTemplate(false)}
        order={order}
        onGenerate={(template) => {
          console.log('Plantilla generada:', template);
          setShowWarehouseTemplate(false);
        }}
      />
    </>
  );
};

export default WarehouseOrderCard; 