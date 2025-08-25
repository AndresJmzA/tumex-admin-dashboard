import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Wrench, 
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
  Camera,
  Upload,
  Download,
  Printer,
  Settings,
  BarChart3,
  Target,
  Award,
  Star,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  Package as PackageIcon,
  Wrench as WrenchIcon,
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
  Camera as CameraIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Printer as PrinterIcon,
  Settings as SettingsIcon,
  BarChart3 as BarChart3Icon,
  Target as TargetIcon,
  Award as AwardIcon,
  Star as StarIcon
} from 'lucide-react';
import { ExtendedOrder } from '@/services/orderService';
import { OrderStateTransition } from './OrderStateTransition';
import { EvidenceUploadModal } from './EvidenceUploadModal';

interface TechnicianOrderCardProps {
  order: ExtendedOrder;
  onUpdate?: (updatedOrder: ExtendedOrder) => void;
  showActions?: boolean;
  variant?: 'compact' | 'detailed' | 'full';
}

interface EquipmentAssignment {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'backup';
  status: 'ready' | 'in_use' | 'maintenance' | 'issue';
  location: string;
  lastCalibration: string;
  nextCalibration: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
  serialNumber: string;
  manufacturer: string;
}

interface PreparationChecklist {
  id: string;
  category: 'equipment' | 'patient' | 'surgery_room' | 'documentation';
  items: ChecklistItem[];
  completed: boolean;
}

interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
  notes?: string;
  completedBy?: string;
  completedAt?: string;
}

interface SurgeryStatus {
  stage: 'preparation' | 'in_progress' | 'completed' | 'post_op';
  startTime?: string;
  endTime?: string;
  duration?: number;
  complications?: string[];
  notes: string[];
  surgeonNotes?: string;
  anesthesiologistNotes?: string;
}

interface ExecutionReport {
  id: string;
  type: 'pre_op' | 'during_surgery' | 'post_op' | 'equipment_issue' | 'complication';
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  technicianId: string;
  attachments?: string[];
}

const TechnicianOrderCard: React.FC<TechnicianOrderCardProps> = ({
  order,
  onUpdate,
  showActions = true,
  variant = 'detailed'
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [showExecutionReport, setShowExecutionReport] = useState(false);

  // Mock data para equipos asignados
  const equipmentAssignments: EquipmentAssignment[] = [
    {
      id: 'equip-001',
      name: 'Endoscopio Flexible Olympus',
      type: 'primary',
      status: 'ready',
      location: 'Quirófano 3',
      lastCalibration: '2024-01-10',
      nextCalibration: '2024-02-10',
      condition: 'excellent',
      notes: 'Calibrado y listo para uso',
      serialNumber: 'OLY-2024-001',
      manufacturer: 'Olympus'
    },
    {
      id: 'equip-002',
      name: 'Monitor de Presión Arterial',
      type: 'secondary',
      status: 'in_use',
      location: 'Quirófano 3',
      lastCalibration: '2024-01-08',
      nextCalibration: '2024-02-08',
      condition: 'good',
      notes: 'Funcionando correctamente',
      serialNumber: 'MON-2024-002',
      manufacturer: 'Philips'
    },
    {
      id: 'equip-003',
      name: 'Bisturí Eléctrico',
      type: 'primary',
      status: 'maintenance',
      location: 'Taller de Mantenimiento',
      lastCalibration: '2024-01-12',
      nextCalibration: '2024-01-20',
      condition: 'fair',
      notes: 'En mantenimiento preventivo',
      serialNumber: 'BIS-2024-003',
      manufacturer: 'Medtronic'
    }
  ];

  // Mock data para checklist de preparación
  const preparationChecklist: PreparationChecklist[] = [
    {
      id: 'check-001',
      category: 'equipment',
      completed: true,
      items: [
        {
          id: 'item-001',
          description: 'Verificar funcionamiento del endoscopio',
          completed: true,
          required: true,
          completedBy: 'Carlos Rodríguez',
          completedAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'item-002',
          description: 'Calibrar monitor de presión',
          completed: true,
          required: true,
          completedBy: 'Carlos Rodríguez',
          completedAt: '2024-01-15T08:15:00Z'
        },
        {
          id: 'item-003',
          description: 'Preparar bisturí eléctrico',
          completed: false,
          required: true,
          notes: 'En mantenimiento hasta 20/01'
        }
      ]
    },
    {
      id: 'check-002',
      category: 'patient',
      completed: false,
      items: [
        {
          id: 'item-004',
          description: 'Confirmar identidad del paciente',
          completed: true,
          required: true,
          completedBy: 'Ana Martínez',
          completedAt: '2024-01-15T08:30:00Z'
        },
        {
          id: 'item-005',
          description: 'Verificar consentimiento informado',
          completed: true,
          required: true,
          completedBy: 'Ana Martínez',
          completedAt: '2024-01-15T08:35:00Z'
        },
        {
          id: 'item-006',
          description: 'Revisar alergias del paciente',
          completed: false,
          required: true
        }
      ]
    },
    {
      id: 'check-003',
      category: 'surgery_room',
      completed: false,
      items: [
        {
          id: 'item-007',
          description: 'Verificar temperatura del quirófano',
          completed: true,
          required: true,
          completedBy: 'Carlos Rodríguez',
          completedAt: '2024-01-15T08:45:00Z'
        },
        {
          id: 'item-008',
          description: 'Confirmar iluminación adecuada',
          completed: false,
          required: true
        },
        {
          id: 'item-009',
          description: 'Verificar sistema de ventilación',
          completed: false,
          required: true
        }
      ]
    },
    {
      id: 'check-004',
      category: 'documentation',
      completed: true,
      items: [
        {
          id: 'item-010',
          description: 'Revisar protocolo de cirugía',
          completed: true,
          required: true,
          completedBy: 'Ana Martínez',
          completedAt: '2024-01-15T08:50:00Z'
        },
        {
          id: 'item-011',
          description: 'Verificar lista de verificación',
          completed: true,
          required: true,
          completedBy: 'Ana Martínez',
          completedAt: '2024-01-15T08:55:00Z'
        }
      ]
    }
  ];

  // Mock data para estado de cirugía
  const surgeryStatus: SurgeryStatus = {
    stage: 'preparation',
    notes: [
      'Equipos principales verificados',
      'Pendiente: Bisturí eléctrico en mantenimiento',
      'Pendiente: Verificación de iluminación',
      'Pendiente: Revisión de alergias del paciente'
    ],
    surgeonNotes: 'Cirugía programada para 15:00. Paciente con antecedentes de alergia a látex.',
    anesthesiologistNotes: 'Paciente requiere monitoreo especial por hipertensión.'
  };

  // Mock data para reportes de ejecución
  const executionReports: ExecutionReport[] = [
    {
      id: 'report-001',
      type: 'pre_op',
      title: 'Verificación de Equipos',
      description: 'Endoscopio y monitor calibrados correctamente. Bisturí eléctrico en mantenimiento.',
      timestamp: '2024-01-15T08:00:00Z',
      severity: 'medium',
      resolved: false,
      technicianId: 'tech-001'
    },
    {
      id: 'report-002',
      type: 'equipment_issue',
      title: 'Bisturí Eléctrico No Disponible',
      description: 'Equipo en mantenimiento hasta 20/01. Se requiere alternativa.',
      timestamp: '2024-01-15T08:30:00Z',
      severity: 'high',
      resolved: false,
      technicianId: 'tech-001'
    },
    {
      id: 'report-003',
      type: 'during_surgery',
      title: 'Complicación Menor',
      description: 'Pequeño sangrado controlado. No requiere intervención adicional.',
      timestamp: '2024-01-15T15:30:00Z',
      severity: 'low',
      resolved: true,
      technicianId: 'tech-002'
    }
  ];

  // Obtener estado de preparación
  const getPreparationStatus = () => {
    const totalItems = preparationChecklist.reduce((acc, checklist) => 
      acc + checklist.items.length, 0);
    const completedItems = preparationChecklist.reduce((acc, checklist) => 
      acc + checklist.items.filter(item => item.completed).length, 0);
    
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    
    if (progress === 100) {
      return { status: 'completed', label: 'Completada', color: 'bg-green-100 text-green-800' };
    } else if (progress >= 75) {
      return { status: 'almost_ready', label: 'Casi Lista', color: 'bg-blue-100 text-blue-800' };
    } else if (progress >= 50) {
      return { status: 'in_progress', label: 'En Progreso', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'not_started', label: 'No Iniciada', color: 'bg-red-100 text-red-800' };
    }
  };

  // Obtener estado de equipos
  const getEquipmentStatus = () => {
    const total = equipmentAssignments.length;
    const ready = equipmentAssignments.filter(equip => equip.status === 'ready').length;
    const inUse = equipmentAssignments.filter(equip => equip.status === 'in_use').length;
    const maintenance = equipmentAssignments.filter(equip => equip.status === 'maintenance').length;
    const issues = equipmentAssignments.filter(equip => equip.status === 'issue').length;
    
    return { total, ready, inUse, maintenance, issues };
  };

  // Obtener estado de cirugía
  const getSurgeryStatus = () => {
    switch (surgeryStatus.stage) {
      case 'preparation':
        return { status: 'preparation', label: 'Preparación', color: 'bg-blue-100 text-blue-800' };
      case 'in_progress':
        return { status: 'in_progress', label: 'En Progreso', color: 'bg-yellow-100 text-yellow-800' };
      case 'completed':
        return { status: 'completed', label: 'Completada', color: 'bg-green-100 text-green-800' };
      case 'post_op':
        return { status: 'post_op', label: 'Post-operatorio', color: 'bg-purple-100 text-purple-800' };
      default:
        return { status: 'unknown', label: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
    }
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

  // Obtener icono de tipo de reporte
  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'pre_op':
        return <Clipboard className="h-4 w-4 text-blue-600" />;
      case 'during_surgery':
        return <Wrench className="h-4 w-4 text-green-600" />;
      case 'post_op':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case 'equipment_issue':
        return <Package className="h-4 w-4 text-orange-600" />;
      case 'complication':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const prepStatus = getPreparationStatus();
  const equipStatus = getEquipmentStatus();
  const surgeryStatusInfo = getSurgeryStatus();

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
              <div className="font-medium">{equipStatus.total} equipos</div>
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
              <Wrench className="h-5 w-5" />
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
                  onClick={() => setShowExecutionReport(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Reportes ({executionReports.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEvidenceUpload(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Evidencias
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
                <span className="font-medium">Quirófano:</span>
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
                <Package className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Equipos:</span>
                <span>{equipStatus.total} asignados</span>
              </div>
              <div className="flex items-center gap-2">
                <Clipboard className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Checklist:</span>
                <Badge className={prepStatus.color}>
                  {prepStatus.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Cirugía:</span>
                <Badge className={surgeryStatusInfo.color}>
                  {surgeryStatusInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Progreso de preparación */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Progreso de Preparación</h4>
              <span className="text-sm text-gray-600">
                {preparationChecklist.reduce((acc, checklist) => 
                  acc + checklist.items.filter(item => item.completed).length, 0)} / 
                {preparationChecklist.reduce((acc, checklist) => 
                  acc + checklist.items.length, 0)} completados
              </span>
            </div>
            <Progress 
              value={preparationChecklist.reduce((acc, checklist) => 
                acc + checklist.items.filter(item => item.completed).length, 0) / 
                Math.max(preparationChecklist.reduce((acc, checklist) => 
                  acc + checklist.items.length, 0), 1) * 100} 
              className="mb-2" 
            />
          </div>

          {/* Equipos asignados */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Equipos Asignados
            </h4>
            <div className="space-y-2">
              {equipmentAssignments.map((equipment) => (
                <div key={equipment.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="font-medium text-sm">{equipment.name}</div>
                      <div className="text-xs text-gray-600">{equipment.manufacturer}</div>
                    </div>
                    <Badge className={
                      equipment.status === 'ready' ? 'bg-green-100 text-green-800' :
                      equipment.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                      equipment.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {equipment.status === 'ready' ? 'Listo' :
                       equipment.status === 'in_use' ? 'En Uso' :
                       equipment.status === 'maintenance' ? 'Mantenimiento' : 'Problema'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{equipment.type}</div>
                    <div className="text-xs text-gray-600">{equipment.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist de preparación */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              Checklist de Preparación
            </h4>
            <div className="space-y-3">
              {preparationChecklist.map((checklist) => (
                <div key={checklist.id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm capitalize">{checklist.category.replace('_', ' ')}</h5>
                    <Badge className={checklist.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {checklist.completed ? 'Completado' : 'Pendiente'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {checklist.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Checkbox 
                          checked={item.completed}
                          disabled={true}
                        />
                        <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                          {item.description}
                        </span>
                        {item.required && (
                          <Badge variant="outline" className="text-xs">
                            Requerido
                          </Badge>
                        )}
                      </div>
                    ))}
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
                  onClick={() => setShowEvidenceUpload(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Evidencias
                </Button>
                <Button variant="outline" size="sm">
                  <Clipboard className="h-4 w-4 mr-2" />
                  Completar Checklist
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
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
              <Wrench className="h-5 w-5" />
              Detalles Técnicos - Orden {order.orderId}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="equipment">Equipos</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
              <TabsTrigger value="surgery">Cirugía</TabsTrigger>
              <TabsTrigger value="reports">Reportes</TabsTrigger>
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
                        <span className="font-medium">Quirófano:</span>
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

                {/* Métricas técnicas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas Técnicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">{equipStatus.total}</div>
                        <div className="text-sm text-blue-600">Equipos</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">{equipStatus.ready}</div>
                        <div className="text-sm text-green-600">Listos</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <div className="text-2xl font-bold text-yellow-600">{equipStatus.maintenance}</div>
                        <div className="text-sm text-yellow-600">Mantenimiento</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">{executionReports.length}</div>
                        <div className="text-sm text-purple-600">Reportes</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notas de cirugía */}
              <Card>
                <CardHeader>
                  <CardTitle>Notas de Cirugía</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {surgeryStatus.notes.map((note, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 border rounded">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{note}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipment" className="space-y-4">
              <div className="space-y-4">
                {equipmentAssignments.map((equipment) => (
                  <Card key={equipment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{equipment.name}</h4>
                          <Badge className={
                            equipment.status === 'ready' ? 'bg-green-100 text-green-800' :
                            equipment.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                            equipment.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {equipment.status === 'ready' ? 'Listo' :
                             equipment.status === 'in_use' ? 'En Uso' :
                             equipment.status === 'maintenance' ? 'Mantenimiento' : 'Problema'}
                          </Badge>
                          <Badge variant="outline">
                            {equipment.type === 'primary' ? 'Principal' :
                             equipment.type === 'secondary' ? 'Secundario' : 'Respaldo'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Fabricante:</span> {equipment.manufacturer}
                          </div>
                          <div>
                            <span className="font-medium">Serial:</span> {equipment.serialNumber}
                          </div>
                          <div>
                            <span className="font-medium">Ubicación:</span> {equipment.location}
                          </div>
                          <div>
                            <span className="font-medium">Condición:</span> {equipment.condition}
                          </div>
                          <div>
                            <span className="font-medium">Última Calibración:</span> {equipment.lastCalibration}
                          </div>
                          <div>
                            <span className="font-medium">Próxima Calibración:</span> {equipment.nextCalibration}
                          </div>
                        </div>
                        {equipment.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium">Notas:</span>
                            <p className="text-sm text-gray-600">{equipment.notes}</p>
                          </div>
                        )}
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

            <TabsContent value="checklist" className="space-y-4">
              <div className="space-y-4">
                {preparationChecklist.map((checklist) => (
                  <Card key={checklist.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium capitalize">{checklist.category.replace('_', ' ')}</h4>
                      <Badge className={checklist.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {checklist.completed ? 'Completado' : 'Pendiente'}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {checklist.items.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-2 border rounded">
                          <Checkbox 
                            checked={item.completed}
                            disabled={true}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                                {item.description}
                              </span>
                              {item.required && (
                                <Badge variant="outline" className="text-xs">
                                  Requerido
                                </Badge>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-xs text-gray-600 mt-1">{item.notes}</p>
                            )}
                            {item.completedBy && (
                              <div className="text-xs text-gray-500 mt-1">
                                Completado por {item.completedBy} el {formatDate(item.completedAt!)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="surgery" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Estado de la Cirugía</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={surgeryStatusInfo.color}>
                        {surgeryStatusInfo.label}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {surgeryStatus.stage.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {surgeryStatus.startTime && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Inicio:</span>
                          <p className="text-gray-600">{formatDate(surgeryStatus.startTime)}</p>
                        </div>
                        {surgeryStatus.endTime && (
                          <div>
                            <span className="font-medium">Fin:</span>
                            <p className="text-gray-600">{formatDate(surgeryStatus.endTime)}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {surgeryStatus.surgeonNotes && (
                      <div className="p-3 bg-blue-50 rounded">
                        <h5 className="font-medium text-sm mb-1">Notas del Cirujano:</h5>
                        <p className="text-sm text-gray-600">{surgeryStatus.surgeonNotes}</p>
                      </div>
                    )}

                    {surgeryStatus.anesthesiologistNotes && (
                      <div className="p-3 bg-green-50 rounded">
                        <h5 className="font-medium text-sm mb-1">Notas del Anestesiólogo:</h5>
                        <p className="text-sm text-gray-600">{surgeryStatus.anesthesiologistNotes}</p>
                      </div>
                    )}

                    {surgeryStatus.complications && surgeryStatus.complications.length > 0 && (
                      <div className="p-3 bg-red-50 rounded">
                        <h5 className="font-medium text-sm mb-1 text-red-800">Complicaciones:</h5>
                        <ul className="text-sm text-red-600">
                          {surgeryStatus.complications.map((complication, index) => (
                            <li key={index}>• {complication}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="space-y-4">
                {executionReports.map((report) => (
                  <Card key={report.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {getReportTypeIcon(report.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{report.title}</span>
                          <Badge className={
                            report.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            report.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {report.severity === 'critical' ? 'Crítico' :
                             report.severity === 'high' ? 'Alto' :
                             report.severity === 'medium' ? 'Medio' : 'Bajo'}
                          </Badge>
                          {report.resolved && (
                            <Badge className="bg-green-100 text-green-800">
                              Resuelto
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                        <div className="text-xs text-gray-500">
                          {formatDate(report.timestamp)}
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
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal de subida de evidencias */}
      <EvidenceUploadModal
        isOpen={showEvidenceUpload}
        onClose={() => setShowEvidenceUpload(false)}
        order={order}
        onUpload={(evidence) => {
          console.log('Evidencia subida:', evidence);
          setShowEvidenceUpload(false);
        }}
      />

      {/* Modal de reportes de ejecución */}
      <Dialog open={showExecutionReport} onOpenChange={setShowExecutionReport}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reportes de Ejecución
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {executionReports.map((report) => (
              <Card key={report.id} className="p-4">
                <div className="flex items-start gap-3">
                  {getReportTypeIcon(report.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{report.title}</span>
                      <Badge className={
                        report.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        report.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        report.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {report.severity === 'critical' ? 'Crítico' :
                         report.severity === 'high' ? 'Alto' :
                         report.severity === 'medium' ? 'Medio' : 'Bajo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    <div className="text-xs text-gray-500">
                      {formatDate(report.timestamp)}
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

export default TechnicianOrderCard; 