import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Users, 
  MapPin, 
  FileText, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  RefreshCw,
  History,
  Settings,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  Info,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Package
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

// Tipos para el sistema de alertas de traslape
export interface ScheduleConflict {
  id: string;
  type: 'time_overlap' | 'resource_conflict' | 'location_conflict' | 'staff_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'resolved' | 'ignored' | 'escalated';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
  
  // Entidades involucradas en el conflicto
  entities: {
    order1: ConflictEntity;
    order2: ConflictEntity;
  };
  
  // Detalles del conflicto
  details: {
    overlapDuration?: number; // en minutos
    conflictingResources?: string[];
    conflictingLocations?: string[];
    conflictingStaff?: string[];
    impactLevel: 'minor' | 'moderate' | 'major' | 'critical';
    estimatedLoss?: number;
  };
  
  // Opciones de resolución sugeridas
  suggestedResolutions: ResolutionOption[];
}

interface ConflictEntity {
  id: string;
  type: 'order' | 'surgery' | 'task' | 'maintenance';
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  staff: string[];
  resources: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  value?: number;
  customer?: string;
}

interface ResolutionOption {
  id: string;
  type: 'reschedule' | 'relocate' | 'reassign' | 'split' | 'combine' | 'cancel';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  estimatedCost?: number;
  timeRequired?: number; // en minutos
  affectedEntities: string[];
  recommended: boolean;
}

interface ConflictResolution {
  id: string;
  conflictId: string;
  resolutionType: string;
  description: string;
  appliedBy: string;
  appliedAt: string;
  status: 'applied' | 'pending' | 'failed';
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

// Configuración de conflictos por tipo
const CONFLICT_CONFIG = {
  time_overlap: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  resource_conflict: {
    icon: <Package className="h-4 w-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  location_conflict: {
    icon: <MapPin className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  staff_conflict: {
    icon: <Users className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
};

// Configuración de severidad
const SEVERITY_CONFIG = {
  low: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200'
  },
  medium: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200'
  },
  high: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200'
  },
  critical: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200'
  }
};

interface OverlapAlertProps {
  conflicts?: ScheduleConflict[];
  onConflictResolved?: (conflictId: string, resolution: ConflictResolution) => void;
  onConflictIgnored?: (conflictId: string, reason: string) => void;
  onConflictEscalated?: (conflictId: string, escalationReason: string) => void;
  className?: string;
}

export const OverlapAlert: React.FC<OverlapAlertProps> = ({
  conflicts = [],
  onConflictResolved,
  onConflictIgnored,
  onConflictEscalated,
  className = ''
}) => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [activeConflicts, setActiveConflicts] = useState<ScheduleConflict[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<ScheduleConflict | null>(null);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<ResolutionOption | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'severity' | 'created' | 'type'>('severity');

  // Cargar conflictos mock
  useEffect(() => {
    loadMockConflicts();
  }, []);

  const loadMockConflicts = () => {
    const mockConflicts: ScheduleConflict[] = [
      {
        id: '1',
        type: 'time_overlap',
        severity: 'critical',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        entities: {
          order1: {
            id: 'ORD-001',
            type: 'order',
            title: 'Cirugía Cardiovascular - Dr. García',
            startTime: '2024-01-15T10:00:00Z',
            endTime: '2024-01-15T14:00:00Z',
            location: 'Quirófano 1',
            staff: ['Dr. García', 'Enf. López', 'Téc. Rodríguez'],
            resources: ['Monitor Cardíaco', 'Bisturí Eléctrico', 'Endoscopio'],
            priority: 'critical',
            value: 45000,
            customer: 'Hospital General'
          },
          order2: {
            id: 'ORD-002',
            type: 'order',
            title: 'Cirugía Laparoscópica - Dr. Martínez',
            startTime: '2024-01-15T12:00:00Z',
            endTime: '2024-01-15T16:00:00Z',
            location: 'Quirófano 1',
            staff: ['Dr. Martínez', 'Enf. González', 'Téc. Fernández'],
            resources: ['Endoscopio', 'Monitor', 'Bisturí'],
            priority: 'high',
            value: 28000,
            customer: 'Clínica Santa María'
          }
        },
        details: {
          overlapDuration: 120,
          conflictingResources: ['Endoscopio', 'Monitor'],
          conflictingLocations: ['Quirófano 1'],
          conflictingStaff: [],
          impactLevel: 'critical',
          estimatedLoss: 73000
        },
        suggestedResolutions: [
          {
            id: 'res1',
            type: 'reschedule',
            title: 'Reprogramar cirugía del Dr. Martínez',
            description: 'Mover la cirugía laparoscópica al quirófano 2 a las 14:00',
            impact: 'low',
            estimatedCost: 0,
            timeRequired: 30,
            affectedEntities: ['ORD-002'],
            recommended: true
          },
          {
            id: 'res2',
            type: 'relocate',
            title: 'Mover cirugía cardiovascular al quirófano 2',
            description: 'Transferir la cirugía crítica al quirófano 2 con equipos especializados',
            impact: 'medium',
            estimatedCost: 5000,
            timeRequired: 60,
            affectedEntities: ['ORD-001'],
            recommended: false
          }
        ]
      },
      {
        id: '2',
        type: 'resource_conflict',
        severity: 'high',
        status: 'pending',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        entities: {
          order1: {
            id: 'ORD-003',
            type: 'order',
            title: 'Endoscopía Digestiva - Dr. López',
            startTime: '2024-01-16T09:00:00Z',
            endTime: '2024-01-16T11:00:00Z',
            location: 'Quirófano 3',
            staff: ['Dr. López', 'Enf. Silva'],
            resources: ['Endoscopio Olympus'],
            priority: 'medium',
            value: 18000,
            customer: 'Centro Médico ABC'
          },
          order2: {
            id: 'ORD-004',
            type: 'order',
            title: 'Cirugía Plástica - Dr. Fernández',
            startTime: '2024-01-16T10:00:00Z',
            endTime: '2024-01-16T13:00:00Z',
            location: 'Quirófano 2',
            staff: ['Dr. Fernández', 'Enf. Torres'],
            resources: ['Endoscopio Olympus'],
            priority: 'low',
            value: 15000,
            customer: 'Clínica del Norte'
          }
        },
        details: {
          conflictingResources: ['Endoscopio Olympus'],
          conflictingLocations: [],
          conflictingStaff: [],
          impactLevel: 'major',
          estimatedLoss: 33000
        },
        suggestedResolutions: [
          {
            id: 'res3',
            type: 'reschedule',
            title: 'Reprogramar endoscopía',
            description: 'Mover la endoscopía al día siguiente',
            impact: 'low',
            estimatedCost: 0,
            timeRequired: 15,
            affectedEntities: ['ORD-003'],
            recommended: true
          }
        ]
      },
      {
        id: '3',
        type: 'staff_conflict',
        severity: 'medium',
        status: 'pending',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        entities: {
          order1: {
            id: 'ORD-005',
            type: 'order',
            title: 'Cirugía Ortopédica - Dr. Silva',
            startTime: '2024-01-17T08:00:00Z',
            endTime: '2024-01-17T12:00:00Z',
            location: 'Quirófano 1',
            staff: ['Dr. Silva', 'Enf. López', 'Téc. Rodríguez'],
            resources: ['Monitor', 'Bisturí', 'Equipo de Rayos X'],
            priority: 'high',
            value: 32000,
            customer: 'Hospital San José'
          },
          order2: {
            id: 'ORD-006',
            type: 'order',
            title: 'Cirugía Plástica - Dr. Torres',
            startTime: '2024-01-17T09:00:00Z',
            endTime: '2024-01-17T11:00:00Z',
            location: 'Quirófano 2',
            staff: ['Dr. Torres', 'Enf. López', 'Téc. Fernández'],
            resources: ['Monitor', 'Bisturí'],
            priority: 'medium',
            value: 22000,
            customer: 'Clínica del Sur'
          }
        },
        details: {
          conflictingResources: [],
          conflictingLocations: [],
          conflictingStaff: ['Enf. López'],
          impactLevel: 'moderate',
          estimatedLoss: 54000
        },
        suggestedResolutions: [
          {
            id: 'res4',
            type: 'reassign',
            title: 'Reasignar enfermera',
            description: 'Asignar Enf. González a la cirugía ortopédica',
            impact: 'low',
            estimatedCost: 0,
            timeRequired: 10,
            affectedEntities: ['ORD-005'],
            recommended: true
          }
        ]
      }
    ];

    setActiveConflicts(mockConflicts);
  };

  const filteredConflicts = activeConflicts.filter(conflict => {
    if (filter === 'pending') return conflict.status === 'pending';
    if (filter === 'resolved') return conflict.status === 'resolved';
    if (filter === 'critical') return conflict.severity === 'critical';
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'severity':
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  const handleConflictClick = (conflict: ScheduleConflict) => {
    setSelectedConflict(conflict);
    setIsResolutionModalOpen(true);
  };

  const handleResolutionSelect = (resolution: ResolutionOption) => {
    setSelectedResolution(resolution);
  };

  const handleResolveConflict = () => {
    if (!selectedConflict || !selectedResolution || !user) return;

    const resolution: ConflictResolution = {
      id: `res_${Date.now()}`,
      conflictId: selectedConflict.id,
      resolutionType: selectedResolution.type,
      description: selectedResolution.description,
      appliedBy: user.name,
      appliedAt: new Date().toISOString(),
      status: 'applied',
      notes: resolutionNotes,
      followUpRequired: selectedResolution.impact === 'high' || selectedResolution.impact === 'medium'
    };

    // Actualizar estado local
    setActiveConflicts(prev => 
      prev.map(conflict => 
        conflict.id === selectedConflict.id 
          ? { ...conflict, status: 'resolved', resolvedAt: new Date().toISOString(), resolvedBy: user.name, resolution: resolutionNotes }
          : conflict
      )
    );

    // Llamar callback
    onConflictResolved?.(selectedConflict.id, resolution);

    // Limpiar estado
    setSelectedConflict(null);
    setSelectedResolution(null);
    setResolutionNotes('');
    setIsResolutionModalOpen(false);
  };

  const handleIgnoreConflict = () => {
    if (!selectedConflict || !user) return;

    const reason = resolutionNotes || 'Sin motivo especificado';

    // Actualizar estado local
    setActiveConflicts(prev => 
      prev.map(conflict => 
        conflict.id === selectedConflict.id 
          ? { ...conflict, status: 'ignored', resolvedAt: new Date().toISOString(), resolvedBy: user.name, resolution: reason }
          : conflict
      )
    );

    // Llamar callback
    onConflictIgnored?.(selectedConflict.id, reason);

    // Limpiar estado
    setSelectedConflict(null);
    setResolutionNotes('');
    setIsResolutionModalOpen(false);
  };

  const handleEscalateConflict = () => {
    if (!selectedConflict || !user) return;

    const escalationReason = resolutionNotes || 'Escalación automática por conflicto crítico';

    // Actualizar estado local
    setActiveConflicts(prev => 
      prev.map(conflict => 
        conflict.id === selectedConflict.id 
          ? { ...conflict, status: 'escalated', resolvedAt: new Date().toISOString(), resolvedBy: user.name, resolution: escalationReason }
          : conflict
      )
    );

    // Llamar callback
    onConflictEscalated?.(selectedConflict.id, escalationReason);

    // Limpiar estado
    setSelectedConflict(null);
    setResolutionNotes('');
    setIsResolutionModalOpen(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getConflictTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      time_overlap: 'Traslape de Horarios',
      resource_conflict: 'Conflicto de Recursos',
      location_conflict: 'Conflicto de Ubicación',
      staff_conflict: 'Conflicto de Personal'
    };
    return labels[type] || type;
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica'
    };
    return labels[severity] || severity;
  };

  const pendingCount = activeConflicts.filter(c => c.status === 'pending').length;
  const criticalCount = activeConflicts.filter(c => c.severity === 'critical' && c.status === 'pending').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con estadísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Alertas de Traslape
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistoryModalOpen(true)}
              >
                <History className="h-4 w-4 mr-2" />
                Historial
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadMockConflicts}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>

          {/* Filtros y ordenamiento */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filtrar:</span>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="resolved">Resueltos</SelectItem>
                  <SelectItem value="critical">Críticos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Ordenar por:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="severity">Severidad</SelectItem>
                  <SelectItem value="created">Fecha</SelectItem>
                  <SelectItem value="type">Tipo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de conflictos */}
      <div className="space-y-3">
        {filteredConflicts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <p className="text-lg font-medium text-gray-900">No hay conflictos</p>
              <p className="text-sm text-gray-600">Todos los horarios están coordinados correctamente</p>
            </CardContent>
          </Card>
        ) : (
          filteredConflicts.map((conflict) => {
            const config = CONFLICT_CONFIG[conflict.type];
            const severityConfig = SEVERITY_CONFIG[conflict.severity];
            
            return (
              <Card 
                key={conflict.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  conflict.status === 'pending' ? 'border-l-4 border-l-orange-500' : ''
                }`}
                onClick={() => handleConflictClick(conflict)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                          <div className={config.color}>
                            {config.icon}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {getConflictTypeLabel(conflict.type)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Detectado {formatDate(conflict.createdAt)} a las {formatTime(conflict.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Entidad 1:</p>
                          <p className="text-sm text-gray-600">{conflict.entities.order1.title}</p>
                          <p className="text-xs text-gray-500">
                            {formatTime(conflict.entities.order1.startTime)} - {formatTime(conflict.entities.order1.endTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">Entidad 2:</p>
                          <p className="text-sm text-gray-600">{conflict.entities.order2.title}</p>
                          <p className="text-xs text-gray-500">
                            {formatTime(conflict.entities.order2.startTime)} - {formatTime(conflict.entities.order2.endTime)}
                          </p>
                        </div>
                      </div>

                      {conflict.details.overlapDuration && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Traslape: {formatDuration(conflict.details.overlapDuration)}
                          </p>
                        </div>
                      )}

                      {conflict.details.conflictingResources && conflict.details.conflictingResources.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <Package className="h-3 w-3 inline mr-1" />
                            Recursos en conflicto: {conflict.details.conflictingResources.join(', ')}
                          </p>
                        </div>
                      )}

                      {conflict.details.conflictingStaff && conflict.details.conflictingStaff.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <Users className="h-3 w-3 inline mr-1" />
                            Personal en conflicto: {conflict.details.conflictingStaff.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${severityConfig.bgColor} ${severityConfig.color}`}>
                        {getSeverityLabel(conflict.severity)}
                      </Badge>
                      
                      {conflict.status === 'pending' && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          Pendiente
                        </Badge>
                      )}
                      
                      {conflict.status === 'resolved' && (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Resuelto
                        </Badge>
                      )}

                      {conflict.details.estimatedLoss && (
                        <p className="text-sm font-medium text-red-600">
                          Pérdida estimada: ${conflict.details.estimatedLoss.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de resolución de conflictos */}
      <Dialog open={isResolutionModalOpen} onOpenChange={setIsResolutionModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Resolver Conflicto de Traslape
            </DialogTitle>
          </DialogHeader>

          {selectedConflict && (
            <div className="space-y-6">
              {/* Detalles del conflicto */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Entidad 1</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{selectedConflict.entities.order1.title}</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(selectedConflict.entities.order1.startTime)} - {formatTime(selectedConflict.entities.order1.endTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {selectedConflict.entities.order1.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <Users className="h-3 w-3 inline mr-1" />
                        {selectedConflict.entities.order1.staff.join(', ')}
                      </p>
                      <Badge className={getPriorityColor(selectedConflict.entities.order1.priority)}>
                        {selectedConflict.entities.order1.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Entidad 2</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{selectedConflict.entities.order2.title}</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(selectedConflict.entities.order2.startTime)} - {formatTime(selectedConflict.entities.order2.endTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {selectedConflict.entities.order2.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <Users className="h-3 w-3 inline mr-1" />
                        {selectedConflict.entities.order2.staff.join(', ')}
                      </p>
                      <Badge className={getPriorityColor(selectedConflict.entities.order2.priority)}>
                        {selectedConflict.entities.order2.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Opciones de resolución */}
              <div>
                <h3 className="text-lg font-medium mb-3">Opciones de Resolución</h3>
                <div className="space-y-3">
                  {selectedConflict.suggestedResolutions.map((resolution) => (
                    <Card 
                      key={resolution.id}
                      className={`cursor-pointer transition-all ${
                        selectedResolution?.id === resolution.id 
                          ? 'border-2 border-blue-500 bg-blue-50' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => handleResolutionSelect(resolution)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{resolution.title}</h4>
                              {resolution.recommended && (
                                <Badge className="bg-green-100 text-green-800">
                                  Recomendado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{resolution.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Impacto: {resolution.impact}</span>
                              {resolution.estimatedCost && (
                                <span>Costo: ${resolution.estimatedCost.toLocaleString()}</span>
                              )}
                              {resolution.timeRequired && (
                                <span>Tiempo: {formatDuration(resolution.timeRequired)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getImpactColor(resolution.impact)}>
                              {resolution.impact}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Notas adicionales */}
              <div>
                <label className="text-sm font-medium">Notas adicionales:</label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Agregar notas sobre la resolución..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleIgnoreConflict}
              disabled={!selectedConflict}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Ignorar
            </Button>
            
            {selectedConflict?.severity === 'critical' && (
              <Button
                variant="destructive"
                onClick={handleEscalateConflict}
                disabled={!selectedConflict}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Escalar
              </Button>
            )}
            
            <Button
              onClick={handleResolveConflict}
              disabled={!selectedConflict || !selectedResolution}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aplicar Resolución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de historial */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Decisiones
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {activeConflicts
              .filter(conflict => conflict.status !== 'pending')
              .map((conflict) => (
                <Card key={conflict.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{getConflictTypeLabel(conflict.type)}</h4>
                          <Badge className={getStatusColor(conflict.status)}>
                            {conflict.status === 'resolved' ? 'Resuelto' : 
                             conflict.status === 'ignored' ? 'Ignorado' : 'Escalado'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {conflict.entities.order1.title} vs {conflict.entities.order2.title}
                        </p>
                        {conflict.resolution && (
                          <p className="text-sm text-gray-600">
                            <strong>Resolución:</strong> {conflict.resolution}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Resuelto por {conflict.resolvedBy} el {formatDate(conflict.resolvedAt || '')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Funciones helper
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
    resolved: 'bg-green-100 text-green-800',
    ignored: 'bg-gray-100 text-gray-800',
    escalated: 'bg-red-100 text-red-800'
  };
  return colors[status] || colors.resolved;
};

const getImpactColor = (impact: string) => {
  const colors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800'
  };
  return colors[impact] || colors.low;
};

export default OverlapAlert; 