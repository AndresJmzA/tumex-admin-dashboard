import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Upload, 
  Mail, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
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
  FileX2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';

// Tipos para el dashboard administrativo
interface RemissionOrder {
  id: string;
  orderNumber: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  surgery: string;
  surgeryDate: string;
  completionDate: string;
  totalAmount: number;
  status: 'completed' | 'remission_ready' | 'remission_generated' | 'remission_signed' | 'sent_to_billing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTechnicians: string[];
  equipmentList: RemissionEquipment[];
  additionalCharges: RemissionCharge[];
  remissionData: RemissionData;
  billingData: BillingData;
  notes?: string;
  specialInstructions?: string;
}

interface RemissionEquipment {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  category: string;
  serialNumber?: string;
  location: string;
}

interface RemissionCharge {
  id: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  category: 'consumables' | 'equipment' | 'supplies' | 'other';
  notes?: string;
  technician: string;
  timestamp: string;
  approved: boolean;
}

interface RemissionData {
  remissionNumber: string;
  generatedAt: string;
  generatedBy: string;
  template: string;
  pdfUrl?: string;
  signedRemissionUrl?: string;
  signedAt?: string;
  signedBy?: string;
  notes?: string;
}

interface BillingData {
  billingEmail: string;
  billingContact: string;
  billingPhone: string;
  sentAt?: string;
  sentBy?: string;
  confirmationReceived?: boolean;
  confirmationDate?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
}

interface AdministrativeStats {
  totalCompletedOrders: number;
  remissionReadyOrders: number;
  remissionGeneratedOrders: number;
  remissionSignedOrders: number;
  sentToBillingOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  efficiency: number;
  pendingRemissions: number;
  overdueRemissions: number;
}

export const AdministrativeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  
  const [remissionOrders, setRemissionOrders] = useState<RemissionOrder[]>([]);
  const [stats, setStats] = useState<AdministrativeStats>({
    totalCompletedOrders: 0,
    remissionReadyOrders: 0,
    remissionGeneratedOrders: 0,
    remissionSignedOrders: 0,
    sentToBillingOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    efficiency: 0,
    pendingRemissions: 0,
    overdueRemissions: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<RemissionOrder | null>(null);
  const [showRemissionModal, setShowRemissionModal] = useState(false);

  // Cargar datos mock para el dashboard administrativo
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    const mockOrders: RemissionOrder[] = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        customer: 'Hospital General',
        customerEmail: 'contacto@hospitalgeneral.com',
        customerPhone: '+52 55 1234 5678',
        surgery: 'Cirugía Cardiovascular',
        surgeryDate: '2024-01-15',
        completionDate: '2024-01-15T12:30:00Z',
        totalAmount: 45000,
        status: 'remission_signed',
        priority: 'critical',
        assignedTechnicians: ['Carlos Rodríguez', 'María González'],
        equipmentList: [
          {
            id: '1',
            name: 'Monitor Cardíaco',
            quantity: 1,
            unitCost: 15000,
            totalCost: 15000,
            category: 'Equipos Críticos',
            serialNumber: 'MC-2024-001',
            location: 'Almacén A - Estante 3'
          },
          {
            id: '2',
            name: 'Bisturí Eléctrico',
            quantity: 1,
            unitCost: 8000,
            totalCost: 8000,
            category: 'Equipos Quirúrgicos',
            serialNumber: 'BE-2024-015',
            location: 'Almacén A - Estante 1'
          },
          {
            id: '3',
            name: 'Endoscopio Cardiovascular',
            quantity: 1,
            unitCost: 22000,
            totalCost: 22000,
            category: 'Equipos Especializados',
            serialNumber: 'EC-2024-008',
            location: 'Almacén B - Estante 1'
          }
        ],
        additionalCharges: [
          {
            id: '1',
            itemName: 'Guantes Quirúrgicos L',
            quantity: 2,
            unitCost: 25,
            totalCost: 50,
            category: 'consumables',
            notes: 'Uso durante procedimiento',
            technician: 'Carlos Rodríguez',
            timestamp: '2024-01-15T10:30:00Z',
            approved: true
          }
        ],
        remissionData: {
          remissionNumber: 'REM-2024-001',
          generatedAt: '2024-01-15T13:00:00Z',
          generatedBy: 'Sistema Automático',
          template: 'Remisión Estándar',
          pdfUrl: '/remissions/REM-2024-001.pdf',
          signedRemissionUrl: '/remissions/REM-2024-001-signed.pdf',
          signedAt: '2024-01-15T14:30:00Z',
          signedBy: 'Dr. Juan Pérez',
          notes: 'Remisión firmada y entregada al paciente'
        },
        billingData: {
          billingEmail: 'facturacion@hospitalgeneral.com',
          billingContact: 'Lic. Ana García',
          billingPhone: '+52 55 9876 5432'
        }
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        customer: 'Clínica Santa María',
        customerEmail: 'info@clinicasantamaria.com',
        customerPhone: '+52 55 2345 6789',
        surgery: 'Cirugía Laparoscópica',
        surgeryDate: '2024-01-16',
        completionDate: '2024-01-16T16:30:00Z',
        totalAmount: 28000,
        status: 'remission_generated',
        priority: 'high',
        assignedTechnicians: ['Ana Martínez'],
        equipmentList: [
          {
            id: '4',
            name: 'Endoscopio Olympus',
            quantity: 1,
            unitCost: 18000,
            totalCost: 18000,
            category: 'Equipos Endoscópicos',
            serialNumber: 'EO-2024-023',
            location: 'Almacén A - Estante 2'
          },
          {
            id: '5',
            name: 'Monitor Quirúrgico',
            quantity: 1,
            unitCost: 10000,
            totalCost: 10000,
            category: 'Equipos de Monitoreo',
            serialNumber: 'MQ-2024-012',
            location: 'Almacén A - Estante 1'
          }
        ],
        additionalCharges: [],
        remissionData: {
          remissionNumber: 'REM-2024-002',
          generatedAt: '2024-01-16T17:00:00Z',
          generatedBy: 'Sistema Automático',
          template: 'Remisión Estándar',
          pdfUrl: '/remissions/REM-2024-002.pdf'
        },
        billingData: {
          billingEmail: 'facturacion@clinicasantamaria.com',
          billingContact: 'Lic. Roberto López',
          billingPhone: '+52 55 8765 4321'
        }
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        customer: 'Centro Médico ABC',
        customerEmail: 'contacto@centromedicoabc.com',
        customerPhone: '+52 55 3456 7890',
        surgery: 'Endoscopía Digestiva',
        surgeryDate: '2024-01-17',
        completionDate: '2024-01-17T11:30:00Z',
        totalAmount: 18000,
        status: 'sent_to_billing',
        priority: 'medium',
        assignedTechnicians: ['Luis Fernández'],
        equipmentList: [
          {
            id: '6',
            name: 'Endoscopio Digestivo',
            quantity: 1,
            unitCost: 12000,
            totalCost: 12000,
            category: 'Equipos Endoscópicos',
            serialNumber: 'ED-2024-045',
            location: 'Almacén B - Estante 3'
          },
          {
            id: '7',
            name: 'Monitor Endoscópico',
            quantity: 1,
            unitCost: 6000,
            totalCost: 6000,
            category: 'Equipos de Monitoreo',
            serialNumber: 'ME-2024-018',
            location: 'Almacén B - Estante 2'
          }
        ],
        additionalCharges: [
          {
            id: '2',
            itemName: 'Cable HDMI 4K',
            quantity: 1,
            unitCost: 150,
            totalCost: 150,
            category: 'equipment',
            notes: 'Cable de repuesto utilizado',
            technician: 'Luis Fernández',
            timestamp: '2024-01-17T10:15:00Z',
            approved: true
          }
        ],
        remissionData: {
          remissionNumber: 'REM-2024-003',
          generatedAt: '2024-01-17T12:00:00Z',
          generatedBy: 'Sistema Automático',
          template: 'Remisión Estándar',
          pdfUrl: '/remissions/REM-2024-003.pdf',
          signedRemissionUrl: '/remissions/REM-2024-003-signed.pdf',
          signedAt: '2024-01-17T13:30:00Z',
          signedBy: 'Dr. Roberto García'
        },
        billingData: {
          billingEmail: 'facturacion@centromedicoabc.com',
          billingContact: 'Lic. María Torres',
          billingPhone: '+52 55 7654 3210',
          sentAt: '2024-01-17T14:00:00Z',
          sentBy: 'Sistema Automático',
          confirmationReceived: true,
          confirmationDate: '2024-01-17T14:15:00Z'
        }
      },
      {
        id: '4',
        orderNumber: 'ORD-2024-004',
        customer: 'Hospital San José',
        customerEmail: 'info@hospitalsanjose.com',
        customerPhone: '+52 55 4567 8901',
        surgery: 'Cirugía Ortopédica',
        surgeryDate: '2024-01-18',
        completionDate: '2024-01-18T18:00:00Z',
        totalAmount: 32000,
        status: 'completed',
        priority: 'high',
        assignedTechnicians: ['Carlos Rodríguez'],
        equipmentList: [
          {
            id: '8',
            name: 'Equipo de Rayos X Portátil',
            quantity: 1,
            unitCost: 20000,
            totalCost: 20000,
            category: 'Equipos de Imagen',
            serialNumber: 'RX-2024-007',
            location: 'Almacén A - Estante 4'
          },
          {
            id: '9',
            name: 'Monitor Ortopédico',
            quantity: 1,
            unitCost: 12000,
            totalCost: 12000,
            category: 'Equipos de Monitoreo',
            serialNumber: 'MO-2024-033',
            location: 'Almacén A - Estante 1'
          }
        ],
        additionalCharges: [],
        remissionData: {
          remissionNumber: '',
          generatedAt: '',
          generatedBy: '',
          template: 'Remisión Estándar'
        },
        billingData: {
          billingEmail: 'facturacion@hospitalsanjose.com',
          billingContact: 'Lic. Miguel Torres',
          billingPhone: '+52 55 6543 2109'
        }
      }
    ];

    setRemissionOrders(mockOrders);

    // Calcular estadísticas
    const totalCompletedOrders = mockOrders.length;
    const remissionReadyOrders = mockOrders.filter(o => o.status === 'completed').length;
    const remissionGeneratedOrders = mockOrders.filter(o => o.status === 'remission_generated').length;
    const remissionSignedOrders = mockOrders.filter(o => o.status === 'remission_signed').length;
    const sentToBillingOrders = mockOrders.filter(o => o.status === 'sent_to_billing').length;
    const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalCompletedOrders > 0 ? totalRevenue / totalCompletedOrders : 0;
    const efficiency = totalCompletedOrders > 0 ? ((sentToBillingOrders / totalCompletedOrders) * 100) : 0;
    const pendingRemissions = remissionReadyOrders + remissionGeneratedOrders;
    const overdueRemissions = 2; // Simulado

    setStats({
      totalCompletedOrders,
      remissionReadyOrders,
      remissionGeneratedOrders,
      remissionSignedOrders,
      sentToBillingOrders,
      totalRevenue,
      averageOrderValue,
      efficiency,
      pendingRemissions,
      overdueRemissions
    });

    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-gray-100 text-gray-800',
      remission_ready: 'bg-blue-100 text-blue-800',
      remission_generated: 'bg-yellow-100 text-yellow-800',
      remission_signed: 'bg-green-100 text-green-800',
      sent_to_billing: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || colors.completed;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      completed: <CheckCircle className="h-4 w-4" />,
      remission_ready: <FileText className="h-4 w-4" />,
      remission_generated: <FileText className="h-4 w-4" />,
      remission_signed: <FileSignature className="h-4 w-4" />,
      sent_to_billing: <Mail className="h-4 w-4" />
    };
    return icons[status] || <CheckCircle className="h-4 w-4" />;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      completed: 'Completada',
      remission_ready: 'Lista para Remisión',
      remission_generated: 'Remisión Generada',
      remission_signed: 'Remisión Firmada',
      sent_to_billing: 'Enviada a Facturación'
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

  const generateRemission = (order: RemissionOrder) => {
    // Simular generación de PDF
    console.log('Generando remisión para:', order.orderNumber);
    
    // Actualizar estado
    setRemissionOrders(prev => 
      prev.map(o => 
        o.id === order.id 
          ? { 
              ...o, 
              status: 'remission_generated',
              remissionData: {
                ...o.remissionData,
                remissionNumber: `REM-${new Date().getFullYear()}-${String(o.id).padStart(3, '0')}`,
                generatedAt: new Date().toISOString(),
                generatedBy: user?.name || 'Usuario',
                pdfUrl: `/remissions/REM-${new Date().getFullYear()}-${String(o.id).padStart(3, '0')}.pdf`
              }
            }
          : o
      )
    );
  };

  const uploadSignedRemission = (order: RemissionOrder) => {
    // Simular subida de remisión firmada
    console.log('Subiendo remisión firmada para:', order.orderNumber);
    
    // Actualizar estado
    setRemissionOrders(prev => 
      prev.map(o => 
        o.id === order.id 
          ? { 
              ...o, 
              status: 'remission_signed',
              remissionData: {
                ...o.remissionData,
                signedRemissionUrl: `/remissions/REM-${new Date().getFullYear()}-${String(o.id).padStart(3, '0')}-signed.pdf`,
                signedAt: new Date().toISOString(),
                signedBy: 'Cliente'
              }
            }
          : o
      )
    );
  };

  const sendToBilling = (order: RemissionOrder) => {
    // Simular envío a facturación
    console.log('Enviando a facturación:', order.orderNumber);
    
    // Actualizar estado
    setRemissionOrders(prev => 
      prev.map(o => 
        o.id === order.id 
          ? { 
              ...o, 
              status: 'sent_to_billing',
              billingData: {
                ...o.billingData,
                sentAt: new Date().toISOString(),
                sentBy: user?.name || 'Usuario'
              }
            }
          : o
      )
    );
  };

  const filteredOrders = remissionOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.surgery.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tumex-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Gestión de remisiones y facturación</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/finances')}>
            <DollarSign className="h-4 w-4 mr-2" />
            Ver Finanzas
          </Button>
          <Button onClick={() => navigate('/reports')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Reportes
          </Button>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompletedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingRemissions} pendientes de remisión
            </p>
            <Progress value={(stats.pendingRemissions / stats.totalCompletedOrders) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remisiones Firmadas</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.remissionSignedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.remissionGeneratedOrders} generadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviadas a Facturación</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentToBillingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Eficiencia: {stats.efficiency.toFixed(1)}%
            </p>
            <Progress value={stats.efficiency} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Promedio: {formatCurrency(stats.averageOrderValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controles de filtro y búsqueda */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Órdenes Listas para Remisión
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
                  placeholder="Buscar órdenes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tumex-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-tumex-primary-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Completadas</option>
                <option value="remission_ready">Lista para Remisión</option>
                <option value="remission_generated">Remisión Generada</option>
                <option value="remission_signed">Remisión Firmada</option>
                <option value="sent_to_billing">Enviada a Facturación</option>
              </select>
            </div>
          </div>

          {/* Lista de órdenes */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron órdenes</p>
                <p className="text-sm text-gray-500">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{order.orderNumber}</span>
                          <Badge className={getPriorityColor(order.priority)}>
                            {getPriorityLabel(order.priority)}
                          </Badge>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{getStatusLabel(order.status)}</span>
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{order.surgery}</p>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.completionDate)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Equipos</p>
                        <p className="font-medium">{order.equipmentList.length} items</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cargos Adicionales</p>
                        <p className="font-medium">{order.additionalCharges.length} items</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Técnicos</p>
                        <p className="font-medium">{order.assignedTechnicians.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Remisión</p>
                        <p className="font-medium">{order.remissionData.remissionNumber || 'Pendiente'}</p>
                      </div>
                    </div>

                    {/* Acciones según estado */}
                    <div className="flex gap-2 pt-3 border-t">
                      {order.status === 'completed' && (
                        <Button 
                          size="sm"
                          onClick={() => generateRemission(order)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Generar Remisión
                        </Button>
                      )}
                      
                      {order.status === 'remission_generated' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(order.remissionData.pdfUrl, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => uploadSignedRemission(order)}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Subir Firmada
                          </Button>
                        </>
                      )}
                      
                      {order.status === 'remission_signed' && (
                        <Button 
                          size="sm"
                          onClick={() => sendToBilling(order)}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Enviar a Facturación
                        </Button>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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
              onClick={() => navigate('/finances')}
            >
              <DollarSign className="h-6 w-6 mb-2" />
              <span className="text-sm">Ver Finanzas</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/reports')}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="text-sm">Reportes</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
            >
              <Mail className="h-6 w-6 mb-2" />
              <span className="text-sm">Enviar Lotes</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
            >
              <Settings className="h-6 w-6 mb-2" />
              <span className="text-sm">Configuración</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdministrativeDashboard; 