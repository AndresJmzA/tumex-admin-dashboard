import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Users, 
  Clock, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  RefreshCw, 
  Settings, 
  Bell, 
  BarChart3, 
  Activity, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Package, 
  Receipt, 
  CreditCard, 
  Banknote, 
  Coins, 
  Wallet, 
  PiggyBank, 
  Percent, 
  Hash, 
  Tag, 
  ShoppingCart, 
  ClipboardList, 
  FileCheck, 
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
  Check,
  X,
  Minus,
  Plus as PlusIcon,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  MessageSquare,
  Send as SendIcon,
  Save,
  Loader2,
  Wrench,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Ear,
  Bone,
  Pill,
  Syringe,
  Thermometer,
  Microscope,
  Monitor,
  Bed,

} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

// Tipos para el sistema de asignación de técnicos
interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  specialties: TechnicianSpecialty[];
  availability: AvailabilityStatus;
  currentLocation: string;
  rating: number;
  experienceYears: number;
  certifications: string[];
  languages: string[];
  currentAssignments: number;
  maxAssignments: number;
  lastActive: string;
  status: 'available' | 'busy' | 'offline' | 'on_leave';
  workingHours: WorkingHours;
  emergencyContact: EmergencyContact;
  notes?: string;
  performanceMetrics: PerformanceMetrics;
}

interface TechnicianSpecialty {
  id: string;
  name: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  certificationDate?: string;
  isPrimary: boolean;
}

interface AvailabilityStatus {
  isAvailable: boolean;
  availableFrom: string;
  availableTo: string;
  timezone: string;
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  exceptions: AvailabilityException[];
  nextAvailableSlot?: string;
  currentAssignment?: string;
}

interface AvailabilityException {
  id: string;
  date: string;
  reason: string;
  type: 'leave' | 'training' | 'maintenance' | 'emergency' | 'other';
}

interface WorkingHours {
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  overtimeAllowed: boolean;
  maxOvertimeHours: number;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

interface PerformanceMetrics {
  totalAssignments: number;
  completedAssignments: number;
  averageRating: number;
  onTimePercentage: number;
  customerSatisfaction: number;
  responseTime: number; // en minutos
  lastMonthAssignments: number;
  lastMonthRating: number;
}

interface AssignmentRequest {
  orderId: string;
  orderNumber: string;
  surgery: string;
  surgeryDate: string;
  surgeryTime: string;
  duration: number; // en minutos
  location: string;
  requiredSpecialties: string[];
  requiredTechnicians: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

interface TechnicianAssignment {
  technicianId: string;
  technicianName: string;
  orderId: string;
  orderNumber: string;
  assignedAt: string;
  assignedBy: string;
  status: 'assigned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  role: 'primary' | 'secondary' | 'backup';
  notes?: string;
}

interface TechnicianAssignmentModalProps {
  assignmentRequest: AssignmentRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignment: (assignments: TechnicianAssignment[]) => void;
  existingAssignments?: TechnicianAssignment[];
}

export const TechnicianAssignment: React.FC<TechnicianAssignmentModalProps> = ({
  assignmentRequest,
  isOpen,
  onClose,
  onAssignment,
  existingAssignments = []
}) => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Cargar datos mock de técnicos
  useEffect(() => {
    if (isOpen) {
      loadMockTechnicians();
    }
  }, [isOpen]);

  // Filtrar técnicos cuando cambian los filtros
  useEffect(() => {
    filterTechnicians();
  }, [technicians, searchTerm, selectedSpecialty, selectedAvailability, selectedRating]);

  const loadMockTechnicians = () => {
    const mockTechnicians: Technician[] = [
      {
        id: '1',
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@tumex.com',
        phone: '+52 55 1234 5678',
        avatar: '/avatars/carlos.jpg',
        specialties: [
          {
            id: '1',
            name: 'Cirugía Cardiovascular',
            level: 'expert',
            yearsOfExperience: 8,
            certificationDate: '2020-03-15',
            isPrimary: true
          },
          {
            id: '2',
            name: 'Cirugía General',
            level: 'advanced',
            yearsOfExperience: 5,
            isPrimary: false
          }
        ],
        availability: {
          isAvailable: true,
          availableFrom: '08:00',
          availableTo: '18:00',
          timezone: 'America/Mexico_City',
          workingDays: [1, 2, 3, 4, 5], // Lunes a Viernes
          exceptions: [],
          nextAvailableSlot: '2024-01-20T08:00:00Z'
        },
        currentLocation: 'Hospital General',
        rating: 4.8,
        experienceYears: 8,
        certifications: ['Cardiovascular Surgery', 'Advanced Life Support'],
        languages: ['Español', 'Inglés'],
        currentAssignments: 1,
        maxAssignments: 3,
        lastActive: new Date().toISOString(),
        status: 'available',
        workingHours: {
          startTime: '08:00',
          endTime: '18:00',
          breakStart: '12:00',
          breakEnd: '13:00',
          overtimeAllowed: true,
          maxOvertimeHours: 4
        },
        emergencyContact: {
          name: 'María Rodríguez',
          relationship: 'Esposa',
          phone: '+52 55 9876 5432',
          email: 'maria.rodriguez@email.com'
        },
        performanceMetrics: {
          totalAssignments: 156,
          completedAssignments: 154,
          averageRating: 4.8,
          onTimePercentage: 98,
          customerSatisfaction: 4.9,
          responseTime: 15,
          lastMonthAssignments: 12,
          lastMonthRating: 4.9
        }
      },
      {
        id: '2',
        name: 'Ana Martínez',
        email: 'ana.martinez@tumex.com',
        phone: '+52 55 2345 6789',
        avatar: '/avatars/ana.jpg',
        specialties: [
          {
            id: '3',
            name: 'Cirugía Laparoscópica',
            level: 'expert',
            yearsOfExperience: 6,
            certificationDate: '2021-06-20',
            isPrimary: true
          },
          {
            id: '4',
            name: 'Endoscopía',
            level: 'advanced',
            yearsOfExperience: 4,
            isPrimary: false
          }
        ],
        availability: {
          isAvailable: true,
          availableFrom: '07:00',
          availableTo: '17:00',
          timezone: 'America/Mexico_City',
          workingDays: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
          exceptions: [],
          nextAvailableSlot: '2024-01-20T07:00:00Z'
        },
        currentLocation: 'Clínica Santa María',
        rating: 4.7,
        experienceYears: 6,
        certifications: ['Laparoscopic Surgery', 'Endoscopy'],
        languages: ['Español', 'Inglés', 'Francés'],
        currentAssignments: 0,
        maxAssignments: 2,
        lastActive: new Date().toISOString(),
        status: 'available',
        workingHours: {
          startTime: '07:00',
          endTime: '17:00',
          breakStart: '12:00',
          breakEnd: '13:00',
          overtimeAllowed: true,
          maxOvertimeHours: 3
        },
        emergencyContact: {
          name: 'Roberto Martínez',
          relationship: 'Hermano',
          phone: '+52 55 8765 4321',
          email: 'roberto.martinez@email.com'
        },
        performanceMetrics: {
          totalAssignments: 89,
          completedAssignments: 87,
          averageRating: 4.7,
          onTimePercentage: 96,
          customerSatisfaction: 4.8,
          responseTime: 18,
          lastMonthAssignments: 8,
          lastMonthRating: 4.8
        }
      },
      {
        id: '3',
        name: 'Luis Fernández',
        email: 'luis.fernandez@tumex.com',
        phone: '+52 55 3456 7890',
        avatar: '/avatars/luis.jpg',
        specialties: [
          {
            id: '5',
            name: 'Endoscopía Digestiva',
            level: 'advanced',
            yearsOfExperience: 4,
            certificationDate: '2022-01-10',
            isPrimary: true
          },
          {
            id: '6',
            name: 'Cirugía General',
            level: 'intermediate',
            yearsOfExperience: 3,
            isPrimary: false
          }
        ],
        availability: {
          isAvailable: false,
          availableFrom: '09:00',
          availableTo: '19:00',
          timezone: 'America/Mexico_City',
          workingDays: [1, 2, 3, 4, 5],
          exceptions: [
            {
              id: '1',
              date: '2024-01-20',
              reason: 'Capacitación',
              type: 'training'
            }
          ],
          currentAssignment: 'ORD-2024-003'
        },
        currentLocation: 'Centro Médico ABC',
        rating: 4.5,
        experienceYears: 4,
        certifications: ['Gastroenterology', 'Endoscopy'],
        languages: ['Español', 'Inglés'],
        currentAssignments: 1,
        maxAssignments: 2,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'busy',
        workingHours: {
          startTime: '09:00',
          endTime: '19:00',
          breakStart: '13:00',
          breakEnd: '14:00',
          overtimeAllowed: false,
          maxOvertimeHours: 0
        },
        emergencyContact: {
          name: 'Carmen Fernández',
          relationship: 'Madre',
          phone: '+52 55 7654 3210',
          email: 'carmen.fernandez@email.com'
        },
        performanceMetrics: {
          totalAssignments: 67,
          completedAssignments: 65,
          averageRating: 4.5,
          onTimePercentage: 94,
          customerSatisfaction: 4.6,
          responseTime: 22,
          lastMonthAssignments: 6,
          lastMonthRating: 4.5
        }
      },
      {
        id: '4',
        name: 'María González',
        email: 'maria.gonzalez@tumex.com',
        phone: '+52 55 4567 8901',
        avatar: '/avatars/maria.jpg',
        specialties: [
          {
            id: '7',
            name: 'Cirugía Ortopédica',
            level: 'expert',
            yearsOfExperience: 7,
            certificationDate: '2019-11-05',
            isPrimary: true
          },
          {
            id: '8',
            name: 'Traumatología',
            level: 'advanced',
            yearsOfExperience: 5,
            isPrimary: false
          }
        ],
        availability: {
          isAvailable: true,
          availableFrom: '08:30',
          availableTo: '18:30',
          timezone: 'America/Mexico_City',
          workingDays: [1, 2, 3, 4, 5],
          exceptions: [],
          nextAvailableSlot: '2024-01-20T08:30:00Z'
        },
        currentLocation: 'Hospital San José',
        rating: 4.9,
        experienceYears: 7,
        certifications: ['Orthopedic Surgery', 'Trauma Surgery'],
        languages: ['Español', 'Inglés', 'Alemán'],
        currentAssignments: 0,
        maxAssignments: 3,
        lastActive: new Date().toISOString(),
        status: 'available',
        workingHours: {
          startTime: '08:30',
          endTime: '18:30',
          breakStart: '12:30',
          breakEnd: '13:30',
          overtimeAllowed: true,
          maxOvertimeHours: 5
        },
        emergencyContact: {
          name: 'Juan González',
          relationship: 'Esposo',
          phone: '+52 55 6543 2109',
          email: 'juan.gonzalez@email.com'
        },
        performanceMetrics: {
          totalAssignments: 134,
          completedAssignments: 132,
          averageRating: 4.9,
          onTimePercentage: 99,
          customerSatisfaction: 4.9,
          responseTime: 12,
          lastMonthAssignments: 10,
          lastMonthRating: 4.9
        }
      }
    ];

    setTechnicians(mockTechnicians);
    setIsLoading(false);
  };

  const filterTechnicians = () => {
    let filtered = technicians;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(tech =>
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.specialties.some(spec => spec.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por especialidad
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(tech =>
        tech.specialties.some(spec => spec.name === selectedSpecialty)
      );
    }

    // Filtro por disponibilidad
    if (selectedAvailability !== 'all') {
      filtered = filtered.filter(tech => {
        switch (selectedAvailability) {
          case 'available':
            return tech.availability.isAvailable && tech.currentAssignments < tech.maxAssignments;
          case 'busy':
            return tech.status === 'busy' || tech.currentAssignments >= tech.maxAssignments;
          case 'offline':
            return tech.status === 'offline';
          default:
            return true;
        }
      });
    }

    // Filtro por rating
    if (selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating);
      filtered = filtered.filter(tech => tech.rating >= minRating);
    }

    setFilteredTechnicians(filtered);
  };

  const handleTechnicianSelection = (technicianId: string, checked: boolean) => {
    if (checked) {
      setSelectedTechnicians(prev => [...prev, technicianId]);
    } else {
      setSelectedTechnicians(prev => prev.filter(id => id !== technicianId));
    }
  };

  const handleAssignment = async () => {
    if (!assignmentRequest || selectedTechnicians.length === 0) return;

    setIsSubmitting(true);

    try {
      const assignments: TechnicianAssignment[] = selectedTechnicians.map((technicianId, index) => {
        const technician = technicians.find(t => t.id === technicianId);
        return {
          technicianId,
          technicianName: technician?.name || 'Técnico Desconocido',
          orderId: assignmentRequest.orderId,
          orderNumber: assignmentRequest.orderNumber,
          assignedAt: new Date().toISOString(),
          assignedBy: user?.name || 'Usuario',
          status: 'assigned',
          role: index === 0 ? 'primary' : 'secondary',
          notes: assignmentRequest.notes
        };
      });

      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Llamar callback de asignación
      onAssignment(assignments);

      // Mostrar confirmación
      setShowConfirmation(true);

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error al asignar técnicos:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailabilityColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-800',
      busy: 'bg-yellow-100 text-yellow-800',
      offline: 'bg-gray-100 text-gray-800',
      on_leave: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.offline;
  };

  const getAvailabilityIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      available: <CheckCircle className="h-4 w-4" />,
      busy: <Clock className="h-4 w-4" />,
      offline: <XCircle className="h-4 w-4" />,
      on_leave: <AlertTriangle className="h-4 w-4" />
    };
    return icons[status] || <XCircle className="h-4 w-4" />;
  };

  const getAvailabilityLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Disponible',
      busy: 'Ocupado',
      offline: 'Desconectado',
      on_leave: 'De Permiso'
    };
    return labels[status] || status;
  };

  const getSpecialtyIcon = (specialtyName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Cirugía Cardiovascular': <Heart className="h-4 w-4" />,
      'Cirugía Laparoscópica': <Stethoscope className="h-4 w-4" />,
      'Endoscopía': <Eye className="h-4 w-4" />,
      'Endoscopía Digestiva': <Stethoscope className="h-4 w-4" />,
      'Cirugía Ortopédica': <Bone className="h-4 w-4" />,
      'Traumatología': <Bone className="h-4 w-4" />,
      'Cirugía General': <Stethoscope className="h-4 w-4" />
    };
    return icons[specialtyName] || <Stethoscope className="h-4 w-4" />;
  };

  const getSpecialtyLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      basic: 'bg-gray-100 text-gray-800',
      intermediate: 'bg-blue-100 text-blue-800',
      advanced: 'bg-yellow-100 text-yellow-800',
      expert: 'bg-green-100 text-green-800'
    };
    return colors[level] || colors.basic;
  };

  const getSpecialtyLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      basic: 'Básico',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
      expert: 'Experto'
    };
    return labels[level] || level;
  };

  const formatTime = (timeString: string) => {
    return timeString;
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

  if (!isOpen || !assignmentRequest) {
    return null;
  }

  const availableSpecialties = Array.from(
    new Set(technicians.flatMap(t => t.specialties.map(s => s.name)))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-tumex-primary-600" />
              <div>
                <CardTitle className="text-xl">Asignación de Técnicos</CardTitle>
                <p className="text-sm text-gray-600">
                  {assignmentRequest.orderNumber} - {assignmentRequest.surgery}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {showConfirmation ? (
            <div className="p-6 text-center">
              <div className="mb-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Técnicos Asignados</h3>
              <p className="text-gray-600">
                Se han asignado {selectedTechnicians.length} técnico(s) a la orden {assignmentRequest.orderNumber}
              </p>
            </div>
          ) : (
            <div className="flex h-[calc(90vh-120px)]">
              {/* Panel izquierdo - Información de la orden */}
              <div className="w-80 p-6 border-r bg-gray-50">
                <h3 className="font-semibold mb-4">Detalles de la Orden</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Orden</Label>
                    <p className="font-medium">{assignmentRequest.orderNumber}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Cirugía</Label>
                    <p className="font-medium">{assignmentRequest.surgery}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Fecha</Label>
                    <p>{formatDate(assignmentRequest.surgeryDate)}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Hora</Label>
                    <p>{formatTime(assignmentRequest.surgeryTime)}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Duración</Label>
                    <p>{assignmentRequest.duration} minutos</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Ubicación</Label>
                    <p>{assignmentRequest.location}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Técnicos Requeridos</Label>
                    <p className="font-medium">{assignmentRequest.requiredTechnicians}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Especialidades</Label>
                    <div className="space-y-1">
                      {assignmentRequest.requiredSpecialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Prioridad</Label>
                    <Badge className={
                      assignmentRequest.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      assignmentRequest.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                      assignmentRequest.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {assignmentRequest.priority === 'critical' ? 'Crítica' :
                       assignmentRequest.priority === 'high' ? 'Alta' :
                       assignmentRequest.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                  
                  {assignmentRequest.notes && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Notas</Label>
                      <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                        {assignmentRequest.notes}
                      </p>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                <div>
                  <h4 className="font-medium mb-3">Técnicos Seleccionados</h4>
                  <div className="space-y-2">
                    {selectedTechnicians.length === 0 ? (
                      <p className="text-sm text-gray-500">No se han seleccionado técnicos</p>
                    ) : (
                      selectedTechnicians.map((technicianId, index) => {
                        const technician = technicians.find(t => t.id === technicianId);
                        return (
                          <div key={technicianId} className="flex items-center gap-2 p-2 bg-white rounded border">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">{technician?.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {index === 0 ? 'Principal' : 'Secundario'}
                            </Badge>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    className="w-full"
                    onClick={handleAssignment}
                    disabled={selectedTechnicians.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Asignando...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Asignar Técnicos ({selectedTechnicians.length})
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Panel derecho - Lista de técnicos */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                  <h3 className="font-semibold mb-4">Técnicos Disponibles</h3>
                  
                  {/* Filtros */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Buscar</Label>
                      <Input
                        placeholder="Nombre, email o especialidad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Especialidad</Label>
                      <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tumex-primary-500 focus:border-transparent"
                      >
                        <option value="all">Todas las especialidades</option>
                        {availableSpecialties.map(specialty => (
                          <option key={specialty} value={specialty}>{specialty}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Disponibilidad</Label>
                      <select
                        value={selectedAvailability}
                        onChange={(e) => setSelectedAvailability(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tumex-primary-500 focus:border-transparent"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="available">Disponible</option>
                        <option value="busy">Ocupado</option>
                        <option value="offline">Desconectado</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Rating mínimo</Label>
                      <select
                        value={selectedRating}
                        onChange={(e) => setSelectedRating(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tumex-primary-500 focus:border-transparent"
                      >
                        <option value="all">Cualquier rating</option>
                        <option value="4.5">4.5+ estrellas</option>
                        <option value="4.0">4.0+ estrellas</option>
                        <option value="3.5">3.5+ estrellas</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Lista de técnicos */}
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p>Cargando técnicos...</p>
                    </div>
                  ) : filteredTechnicians.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No se encontraron técnicos</p>
                      <p className="text-sm text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  ) : (
                    filteredTechnicians.map((technician) => (
                      <Card key={technician.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Checkbox de selección */}
                            <div className="pt-1">
                              <Checkbox
                                checked={selectedTechnicians.includes(technician.id)}
                                onCheckedChange={(checked) => 
                                  handleTechnicianSelection(technician.id, checked as boolean)
                                }
                                disabled={
                                  !technician.availability.isAvailable ||
                                  technician.currentAssignments >= technician.maxAssignments
                                }
                              />
                            </div>

                            {/* Información del técnico */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-lg">{technician.name}</h4>
                                  <p className="text-sm text-gray-600">{technician.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={getAvailabilityColor(technician.status)}>
                                    {getAvailabilityIcon(technician.status)}
                                    <span className="ml-1">{getAvailabilityLabel(technician.status)}</span>
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="text-sm font-medium">{technician.rating}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Especialidades */}
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-2">
                                  {technician.specialties.map((specialty) => (
                                    <div key={specialty.id} className="flex items-center gap-1">
                                      {getSpecialtyIcon(specialty.name)}
                                      <Badge className={getSpecialtyLevelColor(specialty.level)}>
                                        {specialty.name} ({getSpecialtyLevelLabel(specialty.level)})
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Información de disponibilidad */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                <div>
                                  <Label className="text-gray-500">Asignaciones</Label>
                                  <p className="font-medium">
                                    {technician.currentAssignments}/{technician.maxAssignments}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-gray-500">Experiencia</Label>
                                  <p className="font-medium">{technician.experienceYears} años</p>
                                </div>
                                <div>
                                  <Label className="text-gray-500">Horario</Label>
                                  <p className="font-medium">
                                    {formatTime(technician.workingHours.startTime)} - {formatTime(technician.workingHours.endTime)}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-gray-500">Ubicación</Label>
                                  <p className="font-medium">{technician.currentLocation}</p>
                                </div>
                              </div>

                              {/* Métricas de rendimiento */}
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <h5 className="font-medium text-sm mb-2">Métricas de Rendimiento</h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                  <div>
                                    <Label className="text-gray-500">Completadas</Label>
                                    <p className="font-medium">{technician.performanceMetrics.completedAssignments}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-500">A tiempo</Label>
                                    <p className="font-medium">{technician.performanceMetrics.onTimePercentage}%</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-500">Satisfacción</Label>
                                    <p className="font-medium">{technician.performanceMetrics.customerSatisfaction}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-500">Respuesta</Label>
                                    <p className="font-medium">{technician.performanceMetrics.responseTime} min</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicianAssignment; 