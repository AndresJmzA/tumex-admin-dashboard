import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Pause, 
  Square, 
  Camera, 
  FileText, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  Home, 
  Settings, 
  Bell, 
  Search, 
  Filter, 
  RefreshCw, 
  Navigation, 
  Wifi, 
  Battery, 
  Signal, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Share, 
  Bookmark, 
  Star, 
  Heart, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Shield, 
  Zap, 
  Target, 
  TrendingUp, 
  Activity, 
  BarChart3, 
  PieChart, 
  LineChart, 
  DollarSign, 
  Package, 
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
  X, 
  Check, 
  XCircle, 
  Minus, 
  Plus as PlusIcon,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import EvidenceUploadModal from '@/components/EvidenceUploadModal';
import { evidenceService } from '@/services/evidenceService';
import { useToast } from '@/components/ui/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import EvidenceUpload, { Evidence } from '@/components/EvidenceUpload';
import AdditionalChargesForm from '@/components/AdditionalChargesForm';
import { orderService } from '@/services/orderService';
import { supabase } from '@/supabaseClient';
import { technicianService } from '@/services/technicianService';


// Tipos para el portal de técnicos
interface TechnicianTask {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: string;
  customerPhone?: string;
  customerEmail?: string;
  surgery: string;
  surgeryDate: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  status: 'pending' | 'in_transit' | 'on_site' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTechnicians: string[];
  equipmentList: TaskEquipment[];
  estimatedDuration: number; // en minutos
  actualDuration?: number;
  notes?: string;
  specialInstructions?: string;
  contactPerson: string;
  contactPhone: string;
  hospitalWing?: string;
  roomNumber?: string;
  accessCode?: string;
  parkingInfo?: string;
  securityNotes?: string;
}

interface TaskEquipment {
  id: string;
  name: string;
  quantity: number;
  status: 'ready' | 'in_use' | 'maintenance' | 'missing';
  location: string;
  serialNumber?: string;
  lastCalibration?: string;
  nextCalibration?: string;
  notes?: string;
}

interface TaskEvidence {
  id: string;
  taskId: string;
  type: 'photo' | 'video' | 'document';
  url: string;
  timestamp: string;
  notes: string;
  stage: 'arrival' | 'setup' | 'procedure' | 'cleanup' | 'departure';
  location?: string;
  technician: string;
}

interface AdditionalCharge {
  id: string;
  taskId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  category: 'consumables' | 'equipment' | 'supplies' | 'other';
  notes?: string;
  timestamp: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  technician: string;
  supplier?: string;
  invoiceNumber?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

interface TechnicianStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  efficiency: number;
  averageTaskTime: number;
  totalDistance: number;
  totalCharges: number;
}

// Nueva interfaz para órdenes asignadas a técnicos
interface TechnicianAssignedOrder {
  id: string;
  patientName: string;
  surgeryDate: string;
  surgeryTime: string;
  status: string; // assignment status when available
  assignmentId?: string;
  createdAt: string;
  surgeryLocation: string;
  coverageType: string;
  insuranceName?: string;
  notes?: string;
  assignedTechnicians?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  doctorName?: string;
  doctorPhone?: string;
}

export const TechnicianPortal: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<TechnicianTask[]>([]);
  const [todayTasks, setTodayTasks] = useState<TechnicianTask[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<TechnicianAssignedOrder[]>([]);
  const [currentTask, setCurrentTask] = useState<TechnicianTask | null>(null);
  const [stats, setStats] = useState<TechnicianStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    efficiency: 0,
    averageTaskTime: 0,
    totalDistance: 0,
    totalCharges: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'completed' | 'assigned'>('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [assignedSort, setAssignedSort] = useState<'asc' | 'desc'>('asc');
  const { toast } = useToast();
  const [showAssignedEvidenceModal, setShowAssignedEvidenceModal] = useState(false);
  const [selectedAssignedOrderId, setSelectedAssignedOrderId] = useState<string | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedTaskForEvidence, setSelectedTaskForEvidence] = useState<TechnicianTask | null>(null);
  const [taskEvidence, setTaskEvidence] = useState<Record<string, Evidence[]>>({});
  const [showChargesModal, setShowChargesModal] = useState(false);
  const [selectedTaskForCharges, setSelectedTaskForCharges] = useState<TechnicianTask | null>(null);
  const [taskCharges, setTaskCharges] = useState<Record<string, AdditionalCharge[]>>({});

  // Cargar asignaciones reales y tareas simuladas (mantener hoy/semana)
  useEffect(() => {
    loadMockData();
    loadAssignedOrders();
  }, []);

  // Re-cargar asignaciones cuando cambia el técnico autenticado
  useEffect(() => {
    if (user?.id) {
      loadAssignedOrders();
    } else {
      setAssignedOrders([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Cargar órdenes asignadas a técnicos
  const loadAssignedOrders = async () => {
    try {
      setIsLoading(true);
      if (user?.id) {
        const assignments = await technicianService.getTechnicianAssignments(user.id);
        const mappedOrders: TechnicianAssignedOrder[] = assignments.map(a => ({
          id: a.order.id,
          patientName: a.order.patient_name || 'Sin nombre',
          surgeryDate: a.order.surgery_date,
          surgeryTime: a.order.surgery_time,
          status: a.assignmentStatus,
          assignmentId: a.assignmentId,
          createdAt: a.order.created_at,
          surgeryLocation: a.order.surgery_location || 'Sin ubicación',
          coverageType: 'none',
          insuranceName: (a.order as any)?.insurance_name,
          notes: undefined,
          assignedTechnicians: (a.order as any).assigned_technicians || [],
          doctorName: (a.order as any).Users ? `${(a.order as any).Users.display_name} ${(a.order as any).Users.last_name}` : undefined,
          doctorPhone: (a.order as any).Users?.phone_number
        }));
        setAssignedOrders(mappedOrders);
        console.log('✅ Asignaciones cargadas:', mappedOrders.length);
      } else {
        const orders = await orderService.getTechnicianAssignedOrders();
        const mappedOrders: TechnicianAssignedOrder[] = orders.map(order => ({
          id: order.id,
          patientName: order.patient_name || 'Sin nombre',
          surgeryDate: order.surgery_date,
          surgeryTime: order.surgery_time,
          status: order.status,
          assignmentId: undefined,
          createdAt: order.created_at,
          surgeryLocation: order.surgery_location || 'Sin ubicación',
          coverageType: order.coverage_type || 'none',
          insuranceName: order.insurance_name,
          notes: order.notes,
          assignedTechnicians: order.assigned_technicians || []
        }));
        setAssignedOrders(mappedOrders);
      }
    } catch (error) {
      console.error('❌ Error cargando órdenes asignadas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Suscripción en tiempo real a asignaciones del técnico
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`realtime-assignments-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'Technician_Assignments',
        filter: `technician_id=eq.${user.id}`,
      }, () => {
        loadAssignedOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Abrir navegación en mapas
  const openMaps = (address: string) => {
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  // Mapear estado de asignación -> etapa de evidencia
  const mapStatusToStage = (status: string): 'in_transit' | 'arrived' | 'installing' | 'operation_completed' => {
    switch (status) {
      case 'assigned':
        return 'in_transit';
      case 'in_transit':
        return 'arrived';
      case 'on_site':
        return 'installing';
      case 'completed':
        return 'operation_completed';
      default:
        return 'in_transit';
    }
  };

  // Lista filtrada/ordenada de asignadas
  const visibleAssignedOrders = assignedOrders
    .filter(o => {
      if (filterStatus === 'all') return true;
      return o.status === filterStatus;
    })
    .sort((a, b) => {
      const da = new Date(a.surgeryDate).getTime();
      const db = new Date(b.surgeryDate).getTime();
      return assignedSort === 'asc' ? da - db : db - da;
    });

  const loadMockData = () => {
    const mockTasks: TechnicianTask[] = [
      {
        id: '1',
        orderId: 'ORD-2024-001',
        orderNumber: 'ORD-2024-001',
        customer: 'Hospital General',
        customerPhone: '+52 55 1234 5678',
        customerEmail: 'contacto@hospitalgeneral.com',
        surgery: 'Cirugía Cardiovascular',
        surgeryDate: '2024-01-15',
        startTime: '08:00',
        endTime: '12:00',
        location: 'Hospital General',
        address: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        status: 'in_transit',
        priority: 'critical',
        assignedTechnicians: ['Carlos Rodríguez', 'María González'],
        estimatedDuration: 240,
        actualDuration: 45,
        contactPerson: 'Dr. Juan Pérez',
        contactPhone: '+52 55 9876 5432',
        hospitalWing: 'Torre Cardiovascular',
        roomNumber: 'CV-301',
        accessCode: 'CV2024',
        parkingInfo: 'Estacionamiento A, nivel 2',
        specialInstructions: 'Equipo crítico, verificar funcionamiento antes de procedimiento',
        equipmentList: [
          {
            id: '1',
            name: 'Monitor Cardíaco',
            quantity: 1,
            status: 'ready',
            location: 'Almacén A - Estante 3',
            serialNumber: 'MC-2024-001',
            lastCalibration: '2024-01-10',
            nextCalibration: '2024-02-10'
          },
          {
            id: '2',
            name: 'Bisturí Eléctrico',
            quantity: 1,
            status: 'ready',
            location: 'Almacén A - Estante 1',
            serialNumber: 'BE-2024-015',
            lastCalibration: '2024-01-08',
            nextCalibration: '2024-01-22'
          },
          {
            id: '3',
            name: 'Endoscopio Cardiovascular',
            quantity: 1,
            status: 'ready',
            location: 'Almacén B - Estante 1',
            serialNumber: 'EC-2024-008',
            lastCalibration: '2024-01-12',
            nextCalibration: '2024-02-12'
          }
        ]
      },
      {
        id: '2',
        orderId: 'ORD-2024-002',
        orderNumber: 'ORD-2024-002',
        customer: 'Clínica Santa María',
        customerPhone: '+52 55 2345 6789',
        customerEmail: 'info@clinicasantamaria.com',
        surgery: 'Cirugía Laparoscópica',
        surgeryDate: '2024-01-15',
        startTime: '14:00',
        endTime: '16:30',
        location: 'Clínica Santa María',
        address: 'Calle Reforma 567, Col. Centro, CDMX',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        status: 'pending',
        priority: 'high',
        assignedTechnicians: ['Ana Martínez'],
        estimatedDuration: 150,
        contactPerson: 'Dra. Laura Sánchez',
        contactPhone: '+52 55 8765 4321',
        hospitalWing: 'Pabellón Quirúrgico',
        roomNumber: 'PQ-205',
        accessCode: 'PQ2024',
        parkingInfo: 'Estacionamiento principal',
        equipmentList: [
          {
            id: '4',
            name: 'Endoscopio Olympus',
            quantity: 1,
            status: 'ready',
            location: 'Almacén A - Estante 2',
            serialNumber: 'EO-2024-023',
            lastCalibration: '2024-01-05',
            nextCalibration: '2024-02-05'
          },
          {
            id: '5',
            name: 'Monitor Quirúrgico',
            quantity: 1,
            status: 'ready',
            location: 'Almacén A - Estante 1',
            serialNumber: 'MQ-2024-012',
            lastCalibration: '2024-01-03',
            nextCalibration: '2024-02-03'
          }
        ]
      },
      {
        id: '3',
        orderId: 'ORD-2024-003',
        orderNumber: 'ORD-2024-003',
        customer: 'Centro Médico ABC',
        customerPhone: '+52 55 3456 7890',
        customerEmail: 'contacto@centromedicoabc.com',
        surgery: 'Endoscopía Digestiva',
        surgeryDate: '2024-01-15',
        startTime: '10:30',
        endTime: '11:30',
        location: 'Centro Médico ABC',
        address: 'Blvd. Miguel Hidalgo 890, Col. Polanco, CDMX',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        status: 'completed',
        priority: 'medium',
        assignedTechnicians: ['Luis Fernández'],
        estimatedDuration: 60,
        actualDuration: 55,
        contactPerson: 'Dr. Roberto García',
        contactPhone: '+52 55 7654 3210',
        hospitalWing: 'Unidad Endoscópica',
        roomNumber: 'UE-102',
        accessCode: 'UE2024',
        parkingInfo: 'Estacionamiento subterráneo',
        equipmentList: [
          {
            id: '6',
            name: 'Endoscopio Digestivo',
            quantity: 1,
            status: 'ready',
            location: 'Almacén B - Estante 3',
            serialNumber: 'ED-2024-045',
            lastCalibration: '2024-01-07',
            nextCalibration: '2024-02-07'
          },
          {
            id: '7',
            name: 'Monitor Endoscópico',
            quantity: 1,
            status: 'ready',
            location: 'Almacén B - Estante 2',
            serialNumber: 'ME-2024-018',
            lastCalibration: '2024-01-09',
            nextCalibration: '2024-02-09'
          }
        ]
      },
      {
        id: '4',
        orderId: 'ORD-2024-004',
        orderNumber: 'ORD-2024-004',
        customer: 'Hospital San José',
        customerPhone: '+52 55 4567 8901',
        customerEmail: 'info@hospitalsanjose.com',
        surgery: 'Cirugía Ortopédica',
        surgeryDate: '2024-01-15',
        startTime: '16:00',
        endTime: '18:00',
        location: 'Hospital San José',
        address: 'Av. Universidad 123, Col. Coyoacán, CDMX',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        status: 'pending',
        priority: 'high',
        assignedTechnicians: ['Carlos Rodríguez'],
        estimatedDuration: 120,
        contactPerson: 'Dr. Miguel Torres',
        contactPhone: '+52 55 6543 2109',
        hospitalWing: 'Pabellón Ortopédico',
        roomNumber: 'PO-401',
        accessCode: 'PO2024',
        parkingInfo: 'Estacionamiento B, nivel 1',
        equipmentList: [
          {
            id: '8',
            name: 'Equipo de Rayos X Portátil',
            quantity: 1,
            status: 'ready',
            location: 'Almacén A - Estante 4',
            serialNumber: 'RX-2024-007',
            lastCalibration: '2024-01-11',
            nextCalibration: '2024-02-11'
          },
          {
            id: '9',
            name: 'Monitor Ortopédico',
            quantity: 1,
            status: 'ready',
            location: 'Almacén A - Estante 1',
            serialNumber: 'MO-2024-033',
            lastCalibration: '2024-01-06',
            nextCalibration: '2024-02-06'
          }
        ]
      }
    ];

    setTasks(mockTasks);

    // Filtrar tareas de hoy
    const today = new Date().toISOString().split('T')[0];
    const todayTasksList = mockTasks.filter(task => task.surgeryDate === today);
    setTodayTasks(todayTasksList);

    // Calcular estadísticas
    const totalTasks = mockTasks.length;
    const completedTasks = mockTasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = mockTasks.filter(task => task.status === 'in_transit' || task.status === 'on_site').length;
    const pendingTasks = mockTasks.filter(task => task.status === 'pending').length;
    const efficiency = totalTasks > 0 ? ((completedTasks / totalTasks) * 100) : 0;
    const averageTaskTime = mockTasks.reduce((sum, task) => sum + (task.actualDuration || task.estimatedDuration), 0) / totalTasks;
    const totalDistance = 45.5; // km (simulado)
    const totalCharges = 1250; // pesos (simulado)

    setStats({
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      efficiency,
      averageTaskTime,
      totalDistance,
      totalCharges
    });

    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      in_transit: 'bg-blue-100 text-blue-800',
      on_site: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="h-4 w-4" />,
      in_transit: <Truck className="h-4 w-4" />,
      on_site: <MapPin className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      in_transit: 'En Tránsito',
      on_site: 'En Sitio',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
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

  const formatTime = (time: string) => {
    return time;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const handleTaskClick = (task: TechnicianTask) => {
    setCurrentTask(task);
    // Aquí se podría abrir un modal o navegar a una vista detallada
    console.log('Tarea seleccionada:', task.orderNumber);
  };

  const handleStatusUpdate = (taskId: string, newStatus: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus as any }
          : task
      )
    );
    
    setTodayTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus as any }
          : task
      )
    );
  };

  // Cambio de estado para órdenes asignadas reales (usando Technician_Assignments)
  const handleAssignedOrderStatusUpdate = async (assignmentId: string, newStatus: 'in_transit' | 'on_site' | 'completed') => {
    const ok = await technicianService.transitionAssignment(assignmentId, newStatus);
    if (ok) {
      await loadAssignedOrders();
    }
  };

  const handleEvidenceUpload = (evidence: Evidence) => {
    if (selectedTaskForEvidence) {
      setTaskEvidence(prev => ({
        ...prev,
        [selectedTaskForEvidence.id]: [...(prev[selectedTaskForEvidence.id] || []), evidence]
      }));
    }
  };

  const openEvidenceModal = (task: TechnicianTask) => {
    setSelectedTaskForEvidence(task);
    setShowEvidenceModal(true);
  };

  const closeEvidenceModal = () => {
    setShowEvidenceModal(false);
    setSelectedTaskForEvidence(null);
  };

  const handleChargesSubmitted = (charges: AdditionalCharge[]) => {
    if (selectedTaskForCharges) {
      setTaskCharges(prev => ({
        ...prev,
        [selectedTaskForCharges.id]: charges
      }));
    }
  };

  const openChargesModal = (task: TechnicianTask) => {
    setSelectedTaskForCharges(task);
    setShowChargesModal(true);
  };

  const closeChargesModal = () => {
    setShowChargesModal(false);
    setSelectedTaskForCharges(null);
  };

  const filteredTasks = todayTasks.filter(task => {
    const matchesSearch = task.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.surgery.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tumex-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando portal de técnico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil optimizado */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Mi Agenda</h1>
                <p className="text-sm text-gray-600">Portal Técnico</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs de navegación */}
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'today'
                ? 'border-tumex-primary-600 text-tumex-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Hoy ({todayTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'week'
                ? 'border-tumex-primary-600 text-tumex-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'completed'
                ? 'border-tumex-primary-600 text-tumex-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Completadas
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'assigned'
                ? 'border-tumex-primary-600 text-tumex-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Asignadas
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 space-y-4">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">Tareas Hoy</p>
                  <p className="text-xl font-bold">{todayTasks.length}</p>
                </div>
                <Calendar className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">Completadas</p>
                  <p className="text-xl font-bold">{stats.completedTasks}</p>
                </div>
                <CheckCircle className="h-8 w-8 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Búsqueda y filtros */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tumex-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              Todas
            </Button>
            <Button
              variant={filterStatus === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('pending')}
            >
              Pendientes
            </Button>
            <Button
              variant={filterStatus === 'in_transit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('in_transit')}
            >
              En Tránsito
            </Button>
            <Button
              variant={filterStatus === 'on_site' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('on_site')}
            >
              En Sitio
            </Button>
            <Button
              variant={filterStatus === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('completed')}
            >
              Completadas
            </Button>
          </div>
        </div>

        {/* Lista de tareas */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No hay tareas para hoy</p>
                <p className="text-sm text-gray-500">¡Disfruta tu día libre!</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card 
                key={task.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleTaskClick(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{task.orderNumber}</span>
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1">{getStatusLabel(task.status)}</span>
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{task.surgery}</p>
                      <p className="text-sm text-gray-600">{task.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatTime(task.startTime)}</p>
                      <p className="text-xs text-gray-500">{formatDuration(task.estimatedDuration)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{task.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{task.contactPerson}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{task.contactPhone}</span>
                    </div>

                    {task.specialInstructions && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                        <p className="text-xs text-yellow-800">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          {task.specialInstructions}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    {task.status === 'pending' && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(task.id, 'in_transit');
                        }}
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        Iniciar Tránsito
                      </Button>
                    )}
                    
                    {task.status === 'in_transit' && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(task.id, 'on_site');
                        }}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Llegué al Sitio
                      </Button>
                    )}
                    
                    {task.status === 'on_site' && (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(task.id, 'completed');
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completar
                      </Button>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEvidenceModal(task);
                      }}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openChargesModal(task);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pestaña de Órdenes Asignadas */}
        {activeTab === 'assigned' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Órdenes Asignadas</h2>
              <div className="flex items-center gap-2">
                {/* Filtros por dropdown */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                  aria-label="Filtrar por estado"
                >
                  <option value="all">Todas</option>
                  <option value="assigned">Disponibles</option>
                  <option value="in_transit">En Tránsito</option>
                  <option value="on_site">En Sitio</option>
                  <option value="completed">Completadas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAssignedOrders}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {visibleAssignedOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No hay órdenes asignadas</p>
                    <p className="text-sm text-gray-500">Las órdenes aparecerán aquí cuando sean asignadas</p>
                  </CardContent>
                </Card>
              ) : (
                visibleAssignedOrders.map((order) => (
                  <Card 
                    key={order.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">Orden #{order.id}</span>
                            <Badge className="bg-purple-100 text-purple-800">
                              Técnicos Asignados
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-gray-900">Paciente: {order.patientName}</p>
                          {order.doctorName && (
                            <p className="text-sm text-gray-600">Doctor: {order.doctorName}</p>
                          )}
                          {order.doctorPhone && (
                            <p className="text-sm text-gray-600">Teléfono: {order.doctorPhone}</p>
                          )}
                          <button
                            className="text-sm text-blue-600 underline mt-1"
                            onClick={(e) => { e.stopPropagation(); openMaps(order.surgeryLocation); }}
                          >
                            Lugar de entrega: {order.surgeryLocation}
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{order.surgeryTime}</p>
                          <p className="text-xs text-gray-500">{new Date(order.surgeryDate).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{order.surgeryLocation}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{order.patientName}</span>
                        </div>

                        {order.assignedTechnicians && order.assignedTechnicians.length > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-md p-2">
                            <p className="text-xs text-green-800 font-medium mb-1">
                              <Users className="h-3 w-3 inline mr-1" />
                              Técnicos Asignados:
                            </p>
                            <div className="space-y-1">
                              {order.assignedTechnicians.map((tech, index) => (
                                <p key={index} className="text-xs text-green-700">
                                  • {tech.name} ({tech.role})
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {order.notes && (
                          <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                            <p className="text-xs text-blue-800">
                              <Info className="h-3 w-3 inline mr-1" />
                              {order.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Acciones para técnicos */}
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implementar vista detallada de la orden
                            console.log('Ver detalles de orden:', order.id);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </Button>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAssignedOrderId(order.id);
                              setShowAssignedEvidenceModal(true);
                            }}
                          >
                            Adjuntar Evidencia
                          </Button>
                        </div>

                        {order.assignmentId && (
                          <>
                            {order.status === 'assigned' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignedOrderStatusUpdate(order.assignmentId!, 'in_transit');
                                }}
                              >
                                <Truck className="h-4 w-4 mr-1" />
                                Iniciar Tránsito
                              </Button>
                            )}
                            {order.status === 'in_transit' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignedOrderStatusUpdate(order.assignmentId!, 'on_site');
                                }}
                              >
                                <MapPin className="h-4 w-4 mr-1" />
                                Llegué al Sitio
                              </Button>
                            )}
                            {order.status === 'on_site' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignedOrderStatusUpdate(order.assignmentId!, 'completed');
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completar
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Botón flotante para acciones rápidas */}
        <div className="fixed bottom-6 right-6">
          <Button 
            size="lg" 
            className="rounded-full shadow-lg"
            onClick={() => {
              // TODO: Abrir modal de nueva tarea o reporte
              console.log('Acción rápida');
            }}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>

        {/* Modales */}
        {showEvidenceModal && selectedTaskForEvidence && (
          <EvidenceUpload
            taskId={selectedTaskForEvidence.id}
            taskNumber={selectedTaskForEvidence.orderNumber}
            currentStage={selectedTaskForEvidence.status === 'pending' ? 'arrival' :
                         selectedTaskForEvidence.status === 'in_transit' ? 'setup' :
                         selectedTaskForEvidence.status === 'on_site' ? 'procedure' : 'cleanup'}
            onEvidenceUploaded={handleEvidenceUpload}
            onClose={closeEvidenceModal}
            existingEvidence={taskEvidence[selectedTaskForEvidence.id] || []}
            maxFiles={5}
            allowedTypes={['photo', 'video']}
          />
        )}

        {showChargesModal && selectedTaskForCharges && (
          <AdditionalChargesForm
            taskId={selectedTaskForCharges.id}
            taskNumber={selectedTaskForCharges.orderNumber}
            onChargesSubmitted={handleChargesSubmitted}
            onClose={closeChargesModal}
            existingCharges={taskCharges[selectedTaskForCharges.id] || []}
            maxItems={10}
            allowApproval={false}
          />
        )}
      </div>
      {/* Modal Evidencia para Órdenes Asignadas */}
      {showAssignedEvidenceModal && (
        <EvidenceUploadModal
          isOpen={showAssignedEvidenceModal}
          onClose={() => { setShowAssignedEvidenceModal(false); setSelectedAssignedOrderId(null); }}
          taskId={selectedAssignedOrderId || ''}
          onUpload={async ({ title, note, items: list }) => {
            if (!selectedAssignedOrderId || !user?.id) return;
            const current = assignedOrders.find(o => o.id === selectedAssignedOrderId);
            const stage = mapStatusToStage(current?.status || 'assigned');
            const items = list.map(ev => ({ id: ev.id, type: ev.type as any, file: (ev as any).file, description: ev.description }));
            const res = await evidenceService.uploadEvidence({
              orderId: selectedAssignedOrderId,
              technicianId: user.id,
              title,
              note,
              items,
              stage,
            });
            toast({ title: res.success ? 'Evidencias guardadas' : 'Guardadas con errores', description: `Subidas: ${res.uploaded}, Errores: ${res.errors}` });
          }}
        />
      )}
    </div>
  );
};

export default TechnicianPortal; 