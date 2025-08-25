import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Smartphone, 
  Camera, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Upload,
  Download,
  Phone,
  MessageSquare,
  Navigation,
  Package,
  Truck,
  Wrench,
  User,
  Calendar,
  FileText,
  Image,
  Video,
  Mic,
  Send,
  RefreshCw,
  Plus,
  Minus,
  Edit,
  Trash2,
  Filter,
  Search,
  Bell,
  Copy,
  ExternalLink,
  Location,
  Timer,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Star,
  Flag,
  AlertCircle,
  Info,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  Home,
  List,
  Grid,
  BarChart3,
  UserCheck,
  Clipboard,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  BatteryCharging
} from 'lucide-react';

// Tipos para el portal de técnicos
interface TechnicianTask {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: string;
  patientName: string;
  surgery: string;
  date: string;
  time: string;
  location: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  status: 'pending' | 'in_transit' | 'on_site' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  equipment: Array<{
    id: string;
    name: string;
    quantity: number;
    checked: boolean;
  }>;
  assignedTechnicians: Array<{
    id: string;
    name: string;
    role: 'primary' | 'secondary' | 'backup';
  }>;
  estimatedStartTime: string;
  estimatedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  notes: string;
  evidence: Array<{
    id: string;
    type: 'photo' | 'video' | 'audio' | 'text';
    url: string;
    timestamp: string;
    description: string;
    stage: 'arrival' | 'setup' | 'procedure' | 'cleanup' | 'departure';
  }>;
  additionalCharges: Array<{
    id: string;
    description: string;
    amount: number;
    approved: boolean;
  }>;
  notifications: Array<{
    id: string;
    type: 'assignment' | 'reminder' | 'update' | 'alert';
    message: string;
    timestamp: string;
    read: boolean;
  }>;
}

interface TechnicianPortalProps {
  technicianId: string;
}

// Datos mock para técnicos
const mockTechnicianTasks: TechnicianTask[] = [
  {
    id: '1',
    orderId: 'ORD-001',
    orderNumber: 'ORD-001',
    customer: 'Hospital General',
    patientName: 'María González',
    surgery: 'Cirugía Cardíaca',
    date: '2024-01-20',
    time: '08:00',
    location: 'Quirófano 3 - Piso 2',
    address: 'Av. Reforma 123, Col. Centro, CDMX',
    coordinates: { lat: 19.4326, lng: -99.1332 },
    status: 'in_transit',
    priority: 'high',
    equipment: [
      { id: '1', name: 'Monitor Multiparamétrico', quantity: 2, checked: true },
      { id: '2', name: 'Bomba de Infusión', quantity: 3, checked: true },
      { id: '3', name: 'Desfibrilador', quantity: 1, checked: false }
    ],
    assignedTechnicians: [
      { id: '1', name: 'Carlos Méndez', role: 'primary' },
      { id: '2', name: 'Ana López', role: 'secondary' }
    ],
    estimatedStartTime: '07:30',
    estimatedEndTime: '08:00',
    actualStartTime: '07:25',
    notes: 'Equipos cargados en camión. En ruta al hospital.',
    evidence: [
      {
        id: '1',
        type: 'photo',
        url: '/placeholder.svg',
        timestamp: '2024-01-20T07:25:00Z',
        description: 'Equipos cargados en camión',
        stage: 'arrival'
      }
    ],
    additionalCharges: [],
    notifications: [
      {
        id: '1',
        type: 'assignment',
        message: 'Nueva orden asignada: ORD-001',
        timestamp: '2024-01-20T07:00:00Z',
        read: false
      }
    ]
  },
  {
    id: '2',
    orderId: 'ORD-002',
    orderNumber: 'ORD-002',
    customer: 'Clínica Privada',
    patientName: 'Juan Pérez',
    surgery: 'Cirugía Ortopédica',
    date: '2024-01-20',
    time: '10:00',
    location: 'Quirófano 1 - Piso 1',
    address: 'Calle Insurgentes 456, Col. Roma, CDMX',
    coordinates: { lat: 19.4194, lng: -99.1616 },
    status: 'pending',
    priority: 'medium',
    equipment: [
      { id: '4', name: 'Lámpara Quirúrgica', quantity: 2, checked: false },
      { id: '5', name: 'Ventilador Mecánico', quantity: 1, checked: false }
    ],
    assignedTechnicians: [
      { id: '1', name: 'Carlos Méndez', role: 'primary' }
    ],
    estimatedStartTime: '09:30',
    estimatedEndTime: '10:00',
    notes: 'Pendiente de confirmación del hospital.',
    evidence: [],
    additionalCharges: [],
    notifications: []
  }
];

const TechnicianPortal: React.FC<TechnicianPortalProps> = ({ technicianId }) => {
  const [tasks, setTasks] = useState<TechnicianTask[]>(mockTechnicianTasks);
  const [selectedTask, setSelectedTask] = useState<TechnicianTask | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isCharging, setIsCharging] = useState(false);
  const { toast } = useToast();

  // Simular estado de batería y conexión
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
      if (batteryLevel < 20) {
        toast({
          title: "Batería baja",
          description: "Conecta tu dispositivo para continuar trabajando.",
          variant: "destructive"
        });
      }
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [batteryLevel, toast]);

  // Filtrar tareas
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'on_site': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener icono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'on_site': return <MapPin className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Obtener texto de estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_transit': return 'En Tránsito';
      case 'on_site': return 'En Sitio';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calcular progreso de equipos
  const calculateEquipmentProgress = (task: TechnicianTask) => {
    const total = task.equipment.length;
    const checked = task.equipment.filter(item => item.checked).length;
    return total > 0 ? (checked / total) * 100 : 0;
  };

  // Marcar equipo como verificado
  const toggleEquipmentCheck = (taskId: string, equipmentId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          equipment: task.equipment.map(item => 
            item.id === equipmentId 
              ? { ...item, checked: !item.checked }
              : item
          )
        };
      }
      return task;
    }));
  };

  // Actualizar estado de tarea
  const updateTaskStatus = (taskId: string, newStatus: TechnicianTask['status']) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus,
          actualStartTime: newStatus === 'in_transit' ? new Date().toISOString() : task.actualStartTime,
          actualEndTime: newStatus === 'completed' ? new Date().toISOString() : task.actualEndTime
        };
      }
      return task;
    }));

    toast({
      title: "Estado actualizado",
      description: `Tarea marcada como ${getStatusText(newStatus)}`,
    });
  };

  // Copiar dirección al portapapeles
  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Dirección copiada",
        description: "La dirección ha sido copiada al portapapeles.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar la dirección.",
        variant: "destructive"
      });
    }
  };

  // Abrir navegación
  const openNavigation = (task: TechnicianTask) => {
    if (task.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${task.coordinates.lat},${task.coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      toast({
        title: "Error",
        description: "No hay coordenadas disponibles para esta ubicación.",
        variant: "destructive"
      });
    }
  };

  // Simular subida de evidencia
  const handleUploadEvidence = async (taskId: string, type: 'photo' | 'video' | 'audio' | 'text') => {
    setIsUploading(true);
    
    // Simular delay de subida
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newEvidence = {
      id: `ev-${Date.now()}`,
      type,
      url: '/placeholder.svg',
      timestamp: new Date().toISOString(),
      description: `Evidencia ${type} subida`,
      stage: 'arrival' as const
    };

    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          evidence: [...task.evidence, newEvidence]
        };
      }
      return task;
    }));

    setIsUploading(false);
    toast({
      title: "Evidencia subida",
      description: "La evidencia ha sido subida exitosamente.",
    });
  };

  // Agregar cargo adicional
  const addAdditionalCharge = (taskId: string) => {
    const newCharge = {
      id: `charge-${Date.now()}`,
      description: 'Nuevo cargo',
      amount: 0,
      approved: false
    };

    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          additionalCharges: [...task.additionalCharges, newCharge]
        };
      }
      return task;
    }));
  };

  // Marcar notificación como leída
  const markNotificationAsRead = (taskId: string, notificationId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          notifications: task.notifications.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        };
      }
      return task;
    }));
  };

  // Obtener estadísticas
  const getStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inTransit = tasks.filter(t => t.status === 'in_transit').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const unreadNotifications = tasks.reduce((acc, task) => 
      acc + task.notifications.filter(n => !n.read).length, 0
    );

    return { total, pending, inTransit, completed, unreadNotifications };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil optimizado */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="p-4">
          {/* Barra de estado */}
          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <span>{new Date().toLocaleTimeString('es-MX', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
            <div className="flex items-center gap-1">
              {onlineStatus ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              {isCharging ? (
                <BatteryCharging className="h-3 w-3 text-green-500" />
              ) : (
                <Battery className="h-3 w-3" />
              )}
              <span className="text-xs">{Math.round(batteryLevel)}%</span>
            </div>
          </div>

          {/* Header principal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Carlos Méndez</h1>
                <p className="text-sm text-gray-600">Técnico Principal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                {stats.unreadNotifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    {stats.unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Button size="sm" variant="ghost">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-xs text-gray-600">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{stats.inTransit}</div>
              <div className="text-xs text-gray-600">En Tránsito</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-gray-600">Completadas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Tareas</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {/* Filtros y búsqueda */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar órdenes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_transit">En Tránsito</SelectItem>
                      <SelectItem value="on_site">En Sitio</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
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
              )}
            </div>

            {/* Lista de tareas */}
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <Card key={task.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{task.orderNumber}</h3>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{task.customer}</p>
                        <p className="text-sm font-medium">{task.patientName} - {task.surgery}</p>
                      </div>
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1 hidden sm:inline">{getStatusText(task.status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Información de tiempo y ubicación */}
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(task.date).toLocaleDateString('es-ES')} {task.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="truncate flex-1">{task.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Location className="h-4 w-4 text-gray-500" />
                        <span className="truncate flex-1">{task.address}</span>
                      </div>
                    </div>

                    {/* Botones de ubicación */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyAddress(task.address)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openNavigation(task)}
                        className="flex-1"
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Navegar
                      </Button>
                    </div>

                    {/* Progreso de equipos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Equipos Verificados</span>
                        <span>{task.equipment.filter(e => e.checked).length}/{task.equipment.length}</span>
                      </div>
                      <Progress value={calculateEquipmentProgress(task)} className="h-2" />
                    </div>

                    {/* Lista de equipos */}
                    <div className="space-y-2">
                      {task.equipment.map(equipment => (
                        <div key={equipment.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <Button
                            size="sm"
                            variant={equipment.checked ? "default" : "outline"}
                            onClick={() => toggleEquipmentCheck(task.id, equipment.id)}
                            className="h-8 w-8 p-0"
                          >
                            {equipment.checked ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{equipment.name}</p>
                            <p className="text-xs text-gray-600">Cantidad: {equipment.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Evidencias */}
                    {task.evidence.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Evidencias ({task.evidence.length})</h4>
                        <div className="flex gap-2 overflow-x-auto">
                          {task.evidence.map(evidence => (
                            <div key={evidence.id} className="flex-shrink-0">
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                {evidence.type === 'photo' ? (
                                  <Image className="h-6 w-6 text-gray-500" />
                                ) : evidence.type === 'video' ? (
                                  <Video className="h-6 w-6 text-gray-500" />
                                ) : evidence.type === 'audio' ? (
                                  <Mic className="h-6 w-6 text-gray-500" />
                                ) : (
                                  <FileText className="h-6 w-6 text-gray-500" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notificaciones */}
                    {task.notifications.filter(n => !n.read).length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Notificaciones</h4>
                        {task.notifications.filter(n => !n.read).map(notification => (
                          <div key={notification.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                            <Bell className="h-4 w-4 text-blue-600" />
                            <span className="text-sm flex-1">{notification.message}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markNotificationAsRead(task.id, notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex flex-wrap gap-2">
                      {task.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateTaskStatus(task.id, 'in_transit')}
                          className="flex-1"
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Iniciar Tránsito
                        </Button>
                      )}
                      
                      {task.status === 'in_transit' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateTaskStatus(task.id, 'on_site')}
                          className="flex-1"
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          Llegué al Sitio
                        </Button>
                      )}
                      
                      {task.status === 'on_site' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completar
                        </Button>
                      )}

                      {/* Botones de evidencia */}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUploadEvidence(task.id, 'photo')}
                        disabled={isUploading}
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        Foto
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUploadEvidence(task.id, 'text')}
                        disabled={isUploading}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Nota
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addAdditionalCharge(task.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Cargo
                      </Button>
                    </div>

                    {/* Cargos adicionales */}
                    {task.additionalCharges.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Cargos Adicionales</h4>
                        {task.additionalCharges.map(charge => (
                          <div key={charge.id} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                            <input
                              type="text"
                              value={charge.description}
                              className="flex-1 text-sm border rounded px-2 py-1"
                              placeholder="Descripción del cargo"
                            />
                            <input
                              type="number"
                              value={charge.amount}
                              className="w-20 text-sm border rounded px-2 py-1"
                              placeholder="0"
                            />
                            <Badge variant={charge.approved ? "default" : "outline"}>
                              {charge.approved ? "Aprobado" : "Pendiente"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-semibold">Mapa de Tareas</h3>
                  <p className="text-gray-600">Vista de mapa próximamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-semibold">Estadísticas</h3>
                  <p className="text-gray-600">Métricas detalladas próximamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Botón flotante para nueva tarea */}
      <div className="fixed bottom-6 right-6">
        <Button size="lg" className="rounded-full w-14 h-14 p-0 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default TechnicianPortal; 