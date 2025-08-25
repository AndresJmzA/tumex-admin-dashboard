import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Bell,
  MessageSquare,
  Send,
  History,
  Eye,
  Calendar,
  Star,
  Wrench,
  Tool,
  Zap,
  Info,
  Plus,
  Minus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  MapPin,
  User,
  Users,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Clock as ClockIcon,
  Package as PackageIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Bell as BellIcon,
  MessageSquare as MessageSquareIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Eye as EyeIcon,
  Calendar as CalendarIcon,
  Star as StarIcon,
  Wrench as WrenchIcon,
  Tool as ToolIcon,
  Zap as ZapIcon,
  Info as InfoIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  RefreshCw as RefreshCwIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Activity as ActivityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarDays as CalendarDaysIcon,
  MapPin as MapPinIcon,
  User as UserIcon,
  Users as UsersIcon,
  FileText as FileTextIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Target as TargetIcon,
  Award as AwardIcon
} from 'lucide-react';
import { supabase } from '@/supabaseClient';

// Tipos para el modal de asignación de equipos
interface Equipment {
  id: string;
  name: string;
  category: string;
  model: string;
  serialNumber: string;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  totalUsageHours: number;
  currentUsageHours: number;
  maintenanceHistory: Array<{
    id: string;
    date: string;
    type: 'preventive' | 'corrective' | 'inspection';
    description: string;
    technician: string;
    cost: number;
    nextMaintenance?: string;
  }>;
  specifications: {
    manufacturer: string;
    year: number;
    power: string;
    dimensions: string;
    weight: string;
  };
  assignedOrders: Array<{
    orderId: string;
    orderNumber: string;
    startDate: string;
    endDate: string;
    status: 'scheduled' | 'in_progress' | 'completed';
  }>;
  notifications: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface EquipmentAssignment {
  orderId: string;
  equipment: Array<{
    equipmentId: string;
    role: 'primary' | 'backup' | 'optional';
    estimatedStartTime: string;
    estimatedEndTime: string;
    specialInstructions: string;
    assigned: boolean;
    availabilityConfirmed: boolean;
    maintenanceRequired: boolean;
  }>;
  assignmentNotes: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  assignedBy: string;
  assignedAt: string;
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  date: string;
  type: 'preventive' | 'corrective' | 'inspection';
  description: string;
  technician: string;
  cost: number;
  duration: number; // en horas
  parts: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;
  nextMaintenance?: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  notes: string;
}

interface EquipmentUsage {
  id: string;
  equipmentId: string;
  orderId: string;
  startTime: string;
  endTime: string;
  duration: number; // en horas
  usageType: 'scheduled' | 'emergency' | 'training';
  operator: string;
  location: string;
  notes: string;
}

interface EquipmentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    customer: string;
    patientName: string;
    surgery: string;
    date: string;
    time: string;
    duration: number; // en minutos
    location: string;
    requiredEquipment: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      priority: 'low' | 'medium' | 'high' | 'critical';
    }>;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  onAssign: (assignment: EquipmentAssignment) => void;
}

const EquipmentAssignmentModal: React.FC<EquipmentAssignmentModalProps> = ({
  isOpen,
  onClose,
  order,
  onAssign
}) => {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [assignment, setAssignment] = useState<EquipmentAssignment>({
    orderId: order.id,
    equipment: [],
    assignmentNotes: '',
    priority: order.priority,
    status: 'pending',
    assignedBy: 'current_user',
    assignedAt: new Date().toISOString()
  });
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [usageRecords, setUsageRecords] = useState<EquipmentUsage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('assignment');

  // Datos mock de equipos disponibles
  const mockEquipment: Equipment[] = [
    {
      id: '1',
      name: 'Monitor Multiparamétrico',
      category: 'Monitoreo',
      model: 'MP-5000',
      serialNumber: 'SN-MP-2023-001',
      status: 'available',
      location: 'Almacén Principal',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15',
      totalUsageHours: 1250,
      currentUsageHours: 150,
      maintenanceHistory: [
        {
          id: '1',
          date: '2024-01-15',
          type: 'preventive',
          description: 'Mantenimiento preventivo semestral',
          technician: 'Juan Pérez',
          cost: 2500,
          nextMaintenance: '2024-04-15'
        }
      ],
      specifications: {
        manufacturer: 'MedTech Pro',
        year: 2023,
        power: '110V/220V',
        dimensions: '45x30x15 cm',
        weight: '8.5 kg'
      },
      assignedOrders: [],
      notifications: true,
      priority: 'high'
    },
    {
      id: '2',
      name: 'Bomba de Infusión',
      category: 'Infusión',
      model: 'BI-2000',
      serialNumber: 'SN-BI-2023-002',
      status: 'available',
      location: 'Almacén Principal',
      lastMaintenance: '2024-02-01',
      nextMaintenance: '2024-05-01',
      totalUsageHours: 890,
      currentUsageHours: 120,
      maintenanceHistory: [
        {
          id: '2',
          date: '2024-02-01',
          type: 'preventive',
          description: 'Revisión y calibración',
          technician: 'María García',
          cost: 1800,
          nextMaintenance: '2024-05-01'
        }
      ],
      specifications: {
        manufacturer: 'InfusionTech',
        year: 2023,
        power: '110V',
        dimensions: '25x20x10 cm',
        weight: '3.2 kg'
      },
      assignedOrders: [],
      notifications: true,
      priority: 'medium'
    },
    {
      id: '3',
      name: 'Desfibrilador',
      category: 'Emergencia',
      model: 'DEF-3000',
      serialNumber: 'SN-DEF-2023-003',
      status: 'available',
      location: 'Almacén de Emergencias',
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-04-20',
      totalUsageHours: 450,
      currentUsageHours: 80,
      maintenanceHistory: [
        {
          id: '3',
          date: '2024-01-20',
          type: 'preventive',
          description: 'Verificación de baterías y calibración',
          technician: 'Carlos López',
          cost: 3200,
          nextMaintenance: '2024-04-20'
        }
      ],
      specifications: {
        manufacturer: 'EmergencyTech',
        year: 2023,
        power: 'Batería interna',
        dimensions: '35x25x12 cm',
        weight: '5.8 kg'
      },
      assignedOrders: [],
      notifications: true,
      priority: 'critical'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      loadEquipment();
      loadMaintenanceRecords();
      loadUsageRecords();
    }
  }, [isOpen]);

  const loadEquipment = async () => {
    try {
      // Simular carga desde Supabase
      setEquipment(mockEquipment);
    } catch (error) {
      toast({
        title: "Error al cargar equipos",
        description: "No se pudieron cargar los equipos disponibles.",
        variant: "destructive",
      });
    }
  };

  const loadMaintenanceRecords = async () => {
    try {
      // Simular carga de registros de mantenimiento
      const mockMaintenance: MaintenanceRecord[] = [
        {
          id: '1',
          equipmentId: '1',
          equipmentName: 'Monitor Multiparamétrico',
          date: '2024-01-15',
          type: 'preventive',
          description: 'Mantenimiento preventivo semestral',
          technician: 'Juan Pérez',
          cost: 2500,
          duration: 4,
          parts: [
            { name: 'Filtros de aire', quantity: 2, cost: 800 },
            { name: 'Batería de respaldo', quantity: 1, cost: 1200 }
          ],
          nextMaintenance: '2024-04-15',
          status: 'completed',
          notes: 'Equipo funcionando correctamente'
        }
      ];
      setMaintenanceRecords(mockMaintenance);
    } catch (error) {
      toast({
        title: "Error al cargar mantenimiento",
        description: "No se pudieron cargar los registros de mantenimiento.",
        variant: "destructive",
      });
    }
  };

  const loadUsageRecords = async () => {
    try {
      // Simular carga de registros de uso
      const mockUsage: EquipmentUsage[] = [
        {
          id: '1',
          equipmentId: '1',
          orderId: 'ORD-001',
          startTime: '2024-03-15T08:00:00Z',
          endTime: '2024-03-15T14:00:00Z',
          duration: 6,
          usageType: 'scheduled',
          operator: 'Dr. García',
          location: 'Sala de Cirugía 1',
          notes: 'Cirugía programada'
        }
      ];
      setUsageRecords(mockUsage);
    } catch (error) {
      toast({
        title: "Error al cargar uso",
        description: "No se pudieron cargar los registros de uso.",
        variant: "destructive",
      });
    }
  };

  const addEquipment = (equipmentItem: Equipment) => {
    const isAlreadySelected = selectedEquipment.some(eq => eq.id === equipmentItem.id);
    if (!isAlreadySelected) {
      setSelectedEquipment([...selectedEquipment, equipmentItem]);
      setAssignment({
        ...assignment,
        equipment: [
          ...assignment.equipment,
          {
            equipmentId: equipmentItem.id,
            role: 'primary',
            estimatedStartTime: order.time,
            estimatedEndTime: calculateEndTime(order.time, order.duration),
            specialInstructions: '',
            assigned: false,
            availabilityConfirmed: false,
            maintenanceRequired: false
          }
        ]
      });
    }
  };

  const removeEquipment = (equipmentId: string) => {
    setSelectedEquipment(selectedEquipment.filter(eq => eq.id !== equipmentId));
    setAssignment({
      ...assignment,
      equipment: assignment.equipment.filter(eq => eq.equipmentId !== equipmentId)
    });
  };

  const updateEquipmentAssignment = (equipmentId: string, field: string, value: any) => {
    setAssignment({
      ...assignment,
      equipment: assignment.equipment.map(eq => 
        eq.equipmentId === equipmentId ? { ...eq, [field]: value } : eq
      )
    });
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const start = new Date(`2024-01-01T${startTime}`);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return end.toTimeString().slice(0, 5);
  };

  const checkAvailability = (equipmentItem: Equipment) => {
    const orderDate = new Date(order.date);
    const orderStartTime = new Date(`2024-01-01T${order.time}`);
    const orderEndTime = new Date(orderStartTime.getTime() + order.duration * 60000);

    // Verificar si el equipo está disponible en la fecha y hora requeridas
    const conflictingOrders = equipmentItem.assignedOrders.filter(assignedOrder => {
      const assignedDate = new Date(assignedOrder.startDate);
      const assignedStartTime = new Date(assignedOrder.startDate);
      const assignedEndTime = new Date(assignedOrder.endDate);

      return assignedDate.toDateString() === orderDate.toDateString() &&
             assignedStartTime < orderEndTime &&
             assignedEndTime > orderStartTime;
    });

    return conflictingOrders.length === 0 && equipmentItem.status === 'available';
  };

  const checkMaintenanceRequired = (equipmentItem: Equipment) => {
    const nextMaintenance = new Date(equipmentItem.nextMaintenance);
    const orderDate = new Date(order.date);
    const daysUntilMaintenance = Math.ceil((nextMaintenance.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilMaintenance <= 30; // Mantenimiento requerido si es en los próximos 30 días
  };

  const sendNotification = async (equipmentId: string) => {
    try {
      // Simular envío de notificación
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Notificación enviada",
        description: "Se ha enviado la notificación al equipo asignado.",
      });
    } catch (error) {
      toast({
        title: "Error al enviar notificación",
        description: "No se pudo enviar la notificación.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Validar que todos los equipos requeridos estén asignados
      const requiredEquipmentIds = order.requiredEquipment.map(eq => eq.id);
      const assignedEquipmentIds = assignment.equipment.map(eq => eq.equipmentId);
      
      const missingEquipment = requiredEquipmentIds.filter(id => !assignedEquipmentIds.includes(id));
      
      if (missingEquipment.length > 0) {
        toast({
          title: "Equipos faltantes",
          description: `Faltan equipos requeridos: ${missingEquipment.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onAssign(assignment);
      
      toast({
        title: "Asignación guardada",
        description: "La asignación de equipos se ha guardado correctamente.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la asignación de equipos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedEquipment([]);
    setAssignment({
      orderId: order.id,
      equipment: [],
      assignmentNotes: '',
      priority: order.priority,
      status: 'pending',
      assignedBy: 'current_user',
      assignedAt: new Date().toISOString()
    });
    setActiveTab('assignment');
    onClose();
  };

  const filteredEquipment = equipment.filter(eq => {
    const matchesCategory = selectedCategory === 'all' || eq.category === selectedCategory;
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.model.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Asignación de Equipos - Orden {order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assignment">Asignación</TabsTrigger>
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
            <TabsTrigger value="usage">Uso</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          {/* Pestaña de Asignación */}
          <TabsContent value="assignment" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Lista de equipos disponibles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Equipos Disponibles</span>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Buscar equipos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-48"
                      />
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="Monitoreo">Monitoreo</SelectItem>
                          <SelectItem value="Infusión">Infusión</SelectItem>
                          <SelectItem value="Emergencia">Emergencia</SelectItem>
                          <SelectItem value="Respiración">Respiración</SelectItem>
                          <SelectItem value="Iluminación">Iluminación</SelectItem>
                          <SelectItem value="Anestesia">Anestesia</SelectItem>
                          <SelectItem value="Quirúrgico">Quirúrgico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {filteredEquipment.map((equipmentItem) => {
                      const isAvailable = checkAvailability(equipmentItem);
                      const needsMaintenance = checkMaintenanceRequired(equipmentItem);
                      const isSelected = selectedEquipment.some(eq => eq.id === equipmentItem.id);

                      return (
                        <Card key={equipmentItem.id} className={`p-3 cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 
                          !isAvailable ? 'border-red-200 bg-red-50' : 
                          needsMaintenance ? 'border-yellow-200 bg-yellow-50' : 
                          'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{equipmentItem.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {equipmentItem.category}
                                </Badge>
                                <Badge className={`text-xs ${getStatusColor(equipmentItem.status)}`}>
                                  {equipmentItem.status}
                                </Badge>
                                {needsMaintenance && (
                                  <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                    Mantenimiento
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Modelo: {equipmentItem.model} | SN: {equipmentItem.serialNumber}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Ubicación: {equipmentItem.location}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!isAvailable && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                              {needsMaintenance && (
                                <Wrench className="h-4 w-4 text-yellow-500" />
                              )}
                              {isSelected ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeEquipment(equipmentItem.id)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => addEquipment(equipmentItem)}
                                  disabled={!isAvailable}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Equipos asignados */}
              <Card>
                <CardHeader>
                  <CardTitle>Equipos Asignados</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedEquipment.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No hay equipos asignados
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {selectedEquipment.map((equipmentItem) => {
                        const assignment = assignment.equipment.find(eq => eq.equipmentId === equipmentItem.id);
                        
                        return (
                          <Card key={equipmentItem.id} className="p-3">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{equipmentItem.name}</h4>
                                <Badge className={`text-xs ${getPriorityColor(equipmentItem.priority)}`}>
                                  {equipmentItem.priority}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Rol</Label>
                                  <Select
                                    value={assignment?.role || 'primary'}
                                    onValueChange={(value: any) => updateEquipmentAssignment(equipmentItem.id, 'role', value)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="primary">Primario</SelectItem>
                                      <SelectItem value="backup">Respaldo</SelectItem>
                                      <SelectItem value="optional">Opcional</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label className="text-xs">Hora de inicio</Label>
                                  <Input
                                    type="time"
                                    value={assignment?.estimatedStartTime || order.time}
                                    onChange={(e) => updateEquipmentAssignment(equipmentItem.id, 'estimatedStartTime', e.target.value)}
                                    className="h-8"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-xs">Instrucciones especiales</Label>
                                <Textarea
                                  placeholder="Instrucciones específicas para este equipo..."
                                  value={assignment?.specialInstructions || ''}
                                  onChange={(e) => updateEquipmentAssignment(equipmentItem.id, 'specialInstructions', e.target.value)}
                                  className="h-16"
                                />
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={assignment?.availabilityConfirmed || false}
                                  onCheckedChange={(checked) => updateEquipmentAssignment(equipmentItem.id, 'availabilityConfirmed', checked)}
                                />
                                <Label className="text-xs">Disponibilidad confirmada</Label>
                                
                                <Checkbox
                                  checked={assignment?.maintenanceRequired || false}
                                  onCheckedChange={(checked) => updateEquipmentAssignment(equipmentItem.id, 'maintenanceRequired', checked)}
                                />
                                <Label className="text-xs">Requiere mantenimiento</Label>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notas de asignación */}
            <Card>
              <CardHeader>
                <CardTitle>Notas de Asignación</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Notas adicionales sobre la asignación de equipos..."
                  value={assignment.assignmentNotes}
                  onChange={(e) => setAssignment({ ...assignment, assignmentNotes: e.target.value })}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Mantenimiento */}
          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Registros de Mantenimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Técnico</TableHead>
                      <TableHead>Costo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.equipmentName}</TableCell>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>
                          <Badge variant={record.type === 'preventive' ? 'default' : 'secondary'}>
                            {record.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.technician}</TableCell>
                        <TableCell>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(record.cost)}</TableCell>
                        <TableCell>
                          <Badge variant={record.status === 'completed' ? 'default' : 'secondary'}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Uso */}
          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Registros de Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipo</TableHead>
                      <TableHead>Orden</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.equipmentId}</TableCell>
                        <TableCell>{record.orderId}</TableCell>
                        <TableCell>{formatDate(record.startTime)}</TableCell>
                        <TableCell>{record.duration}h</TableCell>
                        <TableCell>{record.operator}</TableCell>
                        <TableCell>{record.location}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pestaña de Historial */}
          <TabsContent value="history" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estadísticas de Uso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total de horas de uso</span>
                      <span className="text-sm font-bold">1,250h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Órdenes completadas</span>
                      <span className="text-sm font-bold">45</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tiempo promedio por orden</span>
                      <span className="text-sm font-bold">6.2h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Disponibilidad</span>
                      <span className="text-sm font-bold">94.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tendencias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Uso este mes</span>
                      <span className="text-sm font-bold text-green-600">+12.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Mantenimientos</span>
                      <span className="text-sm font-bold text-blue-600">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Eficiencia</span>
                      <span className="text-sm font-bold text-green-600">+8.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Costos</span>
                      <span className="text-sm font-bold text-red-600">-5.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Botones de acción */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Guardar Asignación
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentAssignmentModal; 