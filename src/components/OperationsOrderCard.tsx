import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Zap,
  Shield,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Settings,
  BarChart3,
  Target,
  Award,
  Star,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  Package as PackageIcon,
  Truck as TruckIcon,
  MapPin as MapPinIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  BarChart3 as BarChart3Icon,
  Target as TargetIcon,
  Award as AwardIcon,
  Star as StarIcon,
  Eye as EyeIcon,
  Edit as EditIcon,
  MoreHorizontal as MoreHorizontalIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  Building as BuildingIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MessageSquare as MessageSquareIcon,
  FileText as FileTextIcon
} from 'lucide-react';
import { ExtendedOrder } from '@/services/orderService';
import { OrderStateTransition } from './OrderStateTransition';
import { TechnicianAssignmentModal } from './TechnicianAssignmentModal';

interface OperationsOrderCardProps {
  order: ExtendedOrder;
  onUpdate?: (updatedOrder: ExtendedOrder) => void;
  showActions?: boolean;
  variant?: 'compact' | 'detailed' | 'full';
}

interface Technician {
  id: string;
  name: string;
  role: 'technician' | 'supervisor' | 'specialist';
  status: 'available' | 'busy' | 'offline' | 'on_call';
  location: string;
  phone: string;
  email: string;
  skills: string[];
  currentTasks: number;
  rating: number;
  lastActive: string;
}

interface EquipmentStatus {
  id: string;
  name: string;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  assignedTo?: string;
}

interface LogisticsAlert {
  id: string;
  type: 'schedule_conflict' | 'equipment_unavailable' | 'technician_unavailable' | 'location_issue' | 'weather';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface PreparationStatus {
  stage: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  estimatedCompletion: string;
  actualCompletion?: string;
  notes: string[];
}

const OperationsOrderCard: React.FC<OperationsOrderCardProps> = ({
  order,
  onUpdate,
  showActions = true,
  variant = 'detailed'
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showTechnicianAssignment, setShowTechnicianAssignment] = useState(false);
  const [showLogisticsAlerts, setShowLogisticsAlerts] = useState(false);

  // Mock data para técnicos asignados
  const assignedTechnicians: Technician[] = [
    {
      id: 'tech-001',
      name: 'Carlos Rodríguez',
      role: 'technician',
      status: 'busy',
      location: 'Hospital General',
      phone: '+52 55 1234 5678',
      email: 'carlos.rodriguez@tumex.com',
      skills: ['Endoscopia', 'Laparoscopia', 'Cirugía General'],
      currentTasks: 2,
      rating: 4.8,
      lastActive: '2024-01-15T14:30:00Z'
    },
    {
      id: 'tech-002',
      name: 'Ana Martínez',
      role: 'supervisor',
      status: 'available',
      location: 'Centro Médico ABC',
      phone: '+52 55 9876 5432',
      email: 'ana.martinez@tumex.com',
      skills: ['Supervisión', 'Coordinación', 'Cirugía Especializada'],
      currentTasks: 1,
      rating: 4.9,
      lastActive: '2024-01-15T15:00:00Z'
    }
  ];

  // Mock data para equipos
  const equipmentStatus: EquipmentStatus[] = [
    {
      id: 'equip-001',
      name: 'Endoscopio Flexible',
      status: 'available',
      location: 'Almacén Principal',
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10',
      condition: 'excellent',
      assignedTo: 'tech-001'
    },
    {
      id: 'equip-002',
      name: 'Monitor de Presión',
      status: 'in_use',
      location: 'Hospital General',
      lastMaintenance: '2024-01-08',
      nextMaintenance: '2024-02-08',
      condition: 'good',
      assignedTo: 'tech-002'
    },
    {
      id: 'equip-003',
      name: 'Bisturí Eléctrico',
      status: 'maintenance',
      location: 'Taller de Mantenimiento',
      lastMaintenance: '2024-01-12',
      nextMaintenance: '2024-01-20',
      condition: 'fair',
      assignedTo: undefined
    }
  ];

  // Mock data para alertas de logística
  const logisticsAlerts: LogisticsAlert[] = [
    {
      id: 'alert-001',
      type: 'schedule_conflict',
      severity: 'medium',
      message: 'Conflicto de horario: Dr. García tiene otra cirugía programada a las 15:00',
      timestamp: '2024-01-15T10:00:00Z',
      resolved: false
    },
    {
      id: 'alert-002',
      type: 'equipment_unavailable',
      severity: 'high',
      message: 'Bisturí Eléctrico en mantenimiento hasta 20/01',
      timestamp: '2024-01-15T09:30:00Z',
      resolved: false
    },
    {
      id: 'alert-003',
      type: 'technician_unavailable',
      severity: 'low',
      message: 'Técnico Carlos Rodríguez tiene 2 tareas simultáneas',
      timestamp: '2024-01-15T08:45:00Z',
      resolved: true
    }
  ];

  // Mock data para estado de preparación
  const preparationStatus: PreparationStatus = {
    stage: 'in_progress',
    progress: 65,
    estimatedCompletion: '2024-01-15T16:00:00Z',
    notes: [
      'Equipos verificados y listos',
      'Técnicos asignados y notificados',
      'Pendiente: Confirmación de horario con médico',
      'Pendiente: Verificación de disponibilidad de quirófano'
    ]
  };

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

  // Obtener estado de logística
  const getLogisticsStatus = () => {
    const criticalAlerts = logisticsAlerts.filter(alert => alert.severity === 'critical' && !alert.resolved).length;
    const highAlerts = logisticsAlerts.filter(alert => alert.severity === 'high' && !alert.resolved).length;
    
    if (criticalAlerts > 0) {
      return { status: 'critical', label: 'Crítico', color: 'bg-red-100 text-red-800' };
    } else if (highAlerts > 0) {
      return { status: 'warning', label: 'Advertencia', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'normal', label: 'Normal', color: 'bg-green-100 text-green-800' };
    }
  };

  // Calcular disponibilidad de técnicos
  const getTechnicianAvailability = () => {
    const total = assignedTechnicians.length;
    const available = assignedTechnicians.filter(tech => tech.status === 'available').length;
    const busy = assignedTechnicians.filter(tech => tech.status === 'busy').length;
    
    return { total, available, busy };
  };

  // Calcular estado de equipos
  const getEquipmentStatus = () => {
    const total = equipmentStatus.length;
    const available = equipmentStatus.filter(equip => equip.status === 'available').length;
    const inUse = equipmentStatus.filter(equip => equip.status === 'in_use').length;
    const maintenance = equipmentStatus.filter(equip => equip.status === 'maintenance').length;
    
    return { total, available, inUse, maintenance };
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

  const prepStatus = getPreparationStatus();
  const logisticsStatus = getLogisticsStatus();
  const techAvailability = getTechnicianAvailability();
  const equipStatus = getEquipmentStatus();

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetails(true)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-medium">{order.orderId}</span>
                <span className="text-sm text-gray-600">{order.patientName}</span>
              </div>
              <Badge className={prepStatus.color}>
                {prepStatus.label}
              </Badge>
            </div>
            <div className="text-right">
              <div className="font-medium">{techAvailability.total} técnicos</div>
              <div className="text-sm text-gray-600">
                {new Date(order.surgeryDate).toLocaleDateString('es-ES')}
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
              <SettingsIcon className="h-5 w-5" />
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
                  onClick={() => setShowLogisticsAlerts(true)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Alertas ({logisticsAlerts.filter(a => !a.resolved).length})
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
                <span>{order.patientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Hospital:</span>
                <span>{order.surgeryLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Fecha:</span>
                <span>{new Date(order.surgeryDate).toLocaleDateString('es-ES')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Técnicos:</span>
                <span>{techAvailability.total} asignados</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Equipos:</span>
                <span>{equipStatus.total} disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Logística:</span>
                <Badge className={logisticsStatus.color}>
                  {logisticsStatus.label}
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
              Estimado: {formatDate(preparationStatus.estimatedCompletion)}
            </div>
          </div>

          {/* Técnicos asignados */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Técnicos Asignados
            </h4>
            <div className="space-y-2">
              {assignedTechnicians.map((technician) => (
                <div key={technician.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="font-medium text-sm">{technician.name}</div>
                      <div className="text-xs text-gray-600">{technician.role}</div>
                    </div>
                    <Badge className={
                      technician.status === 'available' ? 'bg-green-100 text-green-800' :
                      technician.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {technician.status === 'available' ? 'Disponible' :
                       technician.status === 'busy' ? 'Ocupado' : 'Offline'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{technician.currentTasks} tareas</div>
                    <div className="text-xs text-gray-600">★ {technician.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estado de equipos */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Estado de Equipos
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-medium text-green-800">{equipStatus.available}</div>
                <div className="text-xs text-green-600">Disponibles</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-medium text-blue-800">{equipStatus.inUse}</div>
                <div className="text-xs text-blue-600">En Uso</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-medium text-yellow-800">{equipStatus.maintenance}</div>
                <div className="text-xs text-yellow-600">Mantenimiento</div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          {showActions && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Acciones Rápidas</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowTechnicianAssignment(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Asignar Técnicos
                </Button>
                <Button variant="outline" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Verificar Equipos
                </Button>
                <Button variant="outline" size="sm">
                  <Truck className="h-4 w-4 mr-2" />
                  Coordinar Traslado
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
              <SettingsIcon className="h-5 w-5" />
              Detalles Operativos - Orden {order.orderId}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="technicians">Técnicos</TabsTrigger>
              <TabsTrigger value="equipment">Equipos</TabsTrigger>
              <TabsTrigger value="logistics">Logística</TabsTrigger>
              <TabsTrigger value="actions">Acciones</TabsTrigger>
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
                        <p className="text-gray-600">{order.patientName}</p>
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
                        <span className="font-medium">Ubicación:</span>
                        <p className="text-gray-600">{order.surgeryLocation}</p>
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span>
                        <p className="text-gray-600">{order.status}</p>
                      </div>
                      <div>
                        <span className="font-medium">Progreso:</span>
                        <p className="text-gray-600">{preparationStatus.progress}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Métricas operativas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas Operativas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">{techAvailability.total}</div>
                        <div className="text-sm text-blue-600">Técnicos</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">{equipStatus.available}</div>
                        <div className="text-sm text-green-600">Equipos</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <div className="text-2xl font-bold text-yellow-600">{logisticsAlerts.filter(a => !a.resolved).length}</div>
                        <div className="text-sm text-yellow-600">Alertas</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">{preparationStatus.progress}%</div>
                        <div className="text-sm text-purple-600">Preparación</div>
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
                  <div className="space-y-2">
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

            <TabsContent value="technicians" className="space-y-4">
              <div className="space-y-4">
                {assignedTechnicians.map((technician) => (
                  <Card key={technician.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{technician.name}</h4>
                            <Badge className={
                              technician.status === 'available' ? 'bg-green-100 text-green-800' :
                              technician.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {technician.status === 'available' ? 'Disponible' :
                               technician.status === 'busy' ? 'Ocupado' : 'Offline'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Rol:</span> {technician.role}
                            </div>
                            <div>
                              <span className="font-medium">Ubicación:</span> {technician.location}
                            </div>
                            <div>
                              <span className="font-medium">Tareas:</span> {technician.currentTasks}
                            </div>
                            <div>
                              <span className="font-medium">Rating:</span> ★ {technician.rating}
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="font-medium text-sm">Habilidades:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {technician.skills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="equipment" className="space-y-4">
              <div className="space-y-4">
                {equipmentStatus.map((equipment) => (
                  <Card key={equipment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{equipment.name}</h4>
                          <Badge className={
                            equipment.status === 'available' ? 'bg-green-100 text-green-800' :
                            equipment.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                            equipment.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {equipment.status === 'available' ? 'Disponible' :
                             equipment.status === 'in_use' ? 'En Uso' :
                             equipment.status === 'maintenance' ? 'Mantenimiento' : 'Fuera de Servicio'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Ubicación:</span> {equipment.location}
                          </div>
                          <div>
                            <span className="font-medium">Condición:</span> {equipment.condition}
                          </div>
                          <div>
                            <span className="font-medium">Último Mantenimiento:</span> {equipment.lastMaintenance}
                          </div>
                          <div>
                            <span className="font-medium">Próximo Mantenimiento:</span> {equipment.nextMaintenance}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="logistics" className="space-y-4">
              <div className="space-y-4">
                {logisticsAlerts.map((alert) => (
                  <Card key={alert.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
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
                        <div className="text-sm text-gray-600">
                          {formatDate(alert.timestamp)}
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

            <TabsContent value="actions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestión de Técnicos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Asignar Técnicos
                    </Button>
                    <Button variant="outline" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver Rendimiento
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar Horarios
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gestión de Equipos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full">
                      <Package className="h-4 w-4 mr-2" />
                      Verificar Disponibilidad
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Programar Mantenimiento
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Truck className="h-4 w-4 mr-2" />
                      Coordinar Traslado
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal de asignación de técnicos */}
      <TechnicianAssignmentModal
        isOpen={showTechnicianAssignment}
        onClose={() => setShowTechnicianAssignment(false)}
        order={order}
        onAssign={(updatedOrder) => {
          if (onUpdate) onUpdate(updatedOrder);
          setShowTechnicianAssignment(false);
        }}
      />

      {/* Modal de alertas de logística */}
      <Dialog open={showLogisticsAlerts} onOpenChange={setShowLogisticsAlerts}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Logística
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {logisticsAlerts.filter(alert => !alert.resolved).map((alert) => (
              <Card key={alert.id} className="p-4">
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
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
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(alert.timestamp)}
                    </div>
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OperationsOrderCard; 