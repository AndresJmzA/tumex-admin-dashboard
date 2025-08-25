import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  Calculator,
  Download,
  Send,
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  BarChart3,
  PieChart,
  CreditCard,
  Banknote,
  Receipt,
  DollarSign as DollarIcon,
  Users,
  Package,
  Truck,
  CheckSquare,
  XCircle,
  RefreshCw,
  CreditCard as CreditCardIcon,
  TrendingUp as TrendingUpIcon,
  CalendarDays,
  Target,
  Zap,
  AlertCircle,
  CheckCheck,
  Clock as ClockIcon,
  DollarSign as DollarSignIcon,
  Receipt as ReceiptIcon,
  BarChart,
  LineChart,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Tipos para el dashboard de finanzas
interface FinanceOrder {
  id: string;
  orderNumber: string;
  customer: string;
  patientName: string;
  surgery: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'pending_billing' | 'billed' | 'partial_paid' | 'paid' | 'overdue' | 'cancelled' | 'ready_to_bill';
  billingDate?: string;
  dueDate?: string;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check';
  additionalCharges: Array<{
    id: string;
    description: string;
    amount: number;
    approved: boolean;
  }>;
  remissionId?: string;
  notes: string;
  invoiceNumber?: string;
  paymentHistory?: Array<{
    id: string;
    date: string;
    amount: number;
    method: string;
    reference: string;
  }>;
  billingContact?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface FinanceStats {
  totalRevenue: number;
  pendingRevenue: number;
  collectedRevenue: number;
  overdueAmount: number;
  ordersCount: number;
  billedOrders: number;
  paidOrders: number;
  overdueOrders: number;
  readyToBillOrders: number;
  monthlyGrowth: number;
  averagePaymentTime: number;
  collectionRate: number;
}

interface BillingSystem {
  id: string;
  name: string;
  type: 'facturama' | 'bind_erp' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
}

interface FinanceDashboardProps {
  // Props específicas para el dashboard de finanzas
}

// Datos mock para finanzas mejorados
const mockFinanceOrders: FinanceOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customer: 'Hospital General',
    patientName: 'María González',
    surgery: 'Cirugía Cardíaca',
    date: '2024-01-20',
    totalAmount: 25000,
    paidAmount: 0,
    pendingAmount: 25000,
    status: 'ready_to_bill',
    additionalCharges: [
      { id: '1', description: 'Equipo adicional', amount: 2000, approved: true }
    ],
    notes: 'Lista para facturación',
    billingContact: {
      name: 'Dr. Carlos Méndez',
      email: 'carlos.mendez@hospital.com',
      phone: '555-0123'
    }
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customer: 'Clínica Privada',
    patientName: 'Juan Pérez',
    surgery: 'Cirugía Ortopédica',
    date: '2024-01-19',
    totalAmount: 18000,
    paidAmount: 18000,
    pendingAmount: 0,
    status: 'paid',
    billingDate: '2024-01-19',
    dueDate: '2024-02-18',
    paymentMethod: 'transfer',
    additionalCharges: [],
    remissionId: 'REM-002',
    notes: 'Pagado completamente',
    invoiceNumber: 'INV-2024-002',
    paymentHistory: [
      {
        id: '1',
        date: '2024-01-19',
        amount: 18000,
        method: 'transfer',
        reference: 'TRX-123456'
      }
    ]
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customer: 'Centro Médico',
    patientName: 'Ana López',
    surgery: 'Cirugía Neurológica',
    date: '2024-01-18',
    totalAmount: 32000,
    paidAmount: 16000,
    pendingAmount: 16000,
    status: 'partial_paid',
    billingDate: '2024-01-18',
    dueDate: '2024-02-17',
    paymentMethod: 'card',
    additionalCharges: [
      { id: '2', description: 'Servicio técnico adicional', amount: 3000, approved: true }
    ],
    remissionId: 'REM-003',
    notes: 'Pago parcial recibido',
    invoiceNumber: 'INV-2024-003',
    paymentHistory: [
      {
        id: '1',
        date: '2024-01-18',
        amount: 16000,
        method: 'card',
        reference: 'CARD-789012'
      }
    ]
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    customer: 'Hospital Regional',
    patientName: 'Carlos Méndez',
    surgery: 'Cirugía Abdominal',
    date: '2024-01-15',
    totalAmount: 22000,
    paidAmount: 0,
    pendingAmount: 22000,
    status: 'overdue',
    billingDate: '2024-01-15',
    dueDate: '2024-01-30',
    additionalCharges: [],
    remissionId: 'REM-004',
    notes: 'Vencido - requiere seguimiento',
    invoiceNumber: 'INV-2024-004'
  },
  {
    id: '5',
    orderNumber: 'ORD-005',
    customer: 'Clínica Especializada',
    patientName: 'Laura Torres',
    surgery: 'Cirugía Plástica',
    date: '2024-01-22',
    totalAmount: 28000,
    paidAmount: 0,
    pendingAmount: 28000,
    status: 'ready_to_bill',
    additionalCharges: [
      { id: '3', description: 'Material especializado', amount: 3500, approved: true }
    ],
    notes: 'Pendiente de facturación',
    billingContact: {
      name: 'Dra. Patricia Ruiz',
      email: 'patricia.ruiz@clinica.com',
      phone: '555-0456'
    }
  }
];

// Sistemas de facturación mock
const mockBillingSystems: BillingSystem[] = [
  {
    id: '1',
    name: 'Facturama',
    type: 'facturama',
    status: 'connected',
    lastSync: '2024-01-22T10:30:00Z'
  },
  {
    id: '2',
    name: 'Bind ERP',
    type: 'bind_erp',
    status: 'connected',
    lastSync: '2024-01-22T09:15:00Z'
  },
  {
    id: '3',
    name: 'Sistema Personalizado',
    type: 'custom',
    status: 'error',
    lastSync: '2024-01-21T16:45:00Z'
  }
];

const FinanceDashboard: React.FC<FinanceDashboardProps> = () => {
  const [orders, setOrders] = useState<FinanceOrder[]>(mockFinanceOrders);
  const [selectedOrder, setSelectedOrder] = useState<FinanceOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [billingSystems] = useState<BillingSystem[]>(mockBillingSystems);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const { toast } = useToast();

  // Calcular estadísticas mejoradas
  const calculateStats = (): FinanceStats => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingRevenue = orders.reduce((sum, order) => sum + order.pendingAmount, 0);
    const collectedRevenue = orders.reduce((sum, order) => sum + order.paidAmount, 0);
    const overdueAmount = orders
      .filter(order => order.status === 'overdue')
      .reduce((sum, order) => sum + order.pendingAmount, 0);

    const readyToBillOrders = orders.filter(o => o.status === 'ready_to_bill').length;
    const paidOrders = orders.filter(o => o.status === 'paid').length;
    const totalOrders = orders.length;
    const collectionRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

    return {
      totalRevenue,
      pendingRevenue,
      collectedRevenue,
      overdueAmount,
      ordersCount: orders.length,
      billedOrders: orders.filter(o => o.status === 'billed').length,
      paidOrders,
      overdueOrders: orders.filter(o => o.status === 'overdue').length,
      readyToBillOrders,
      monthlyGrowth: 12.5, // Mock data
      averagePaymentTime: 15.2, // Mock data
      collectionRate
    };
  };

  const stats = calculateStats();

  // Obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_to_bill': return 'bg-purple-100 text-purple-800';
      case 'pending_billing': return 'bg-yellow-100 text-yellow-800';
      case 'billed': return 'bg-blue-100 text-blue-800';
      case 'partial_paid': return 'bg-orange-100 text-orange-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener icono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready_to_bill': return <FileText className="h-4 w-4" />;
      case 'pending_billing': return <Clock className="h-4 w-4" />;
      case 'billed': return <FileText className="h-4 w-4" />;
      case 'partial_paid': return <CheckCircle className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Obtener texto de estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready_to_bill': return 'Lista para Facturar';
      case 'pending_billing': return 'Pendiente de Facturación';
      case 'billed': return 'Facturado';
      case 'partial_paid': return 'Pago Parcial';
      case 'paid': return 'Pagado';
      case 'overdue': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Filtrar órdenes
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Obtener órdenes listas para facturar
  const readyToBillOrders = orders.filter(order => order.status === 'ready_to_bill');

  // Obtener órdenes con pagos pendientes
  const pendingPaymentOrders = orders.filter(order => 
    order.status === 'billed' || order.status === 'partial_paid'
  );

  // Marcar como facturado
  const markAsBilled = (orderId: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'billed' as const,
          billingDate: new Date().toISOString(),
          invoiceNumber: `INV-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
        };
      }
      return order;
    }));

    toast({
      title: "Orden facturada",
      description: "La orden ha sido marcada como facturada y enviada al sistema de facturación.",
    });
  };

  // Registrar pago
  const registerPayment = (orderId: string, amount: number, method: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const newPaidAmount = order.paidAmount + amount;
        const newPendingAmount = order.totalAmount - newPaidAmount;
        const newStatus = newPendingAmount === 0 ? 'paid' : 'partial_paid';
        
        const paymentRecord = {
          id: String(Date.now()),
          date: new Date().toISOString(),
          amount,
          method,
          reference: `${method.toUpperCase()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`
        };

        return {
          ...order,
          paidAmount: newPaidAmount,
          pendingAmount: newPendingAmount,
          status: newStatus as any,
          paymentMethod: method as any,
          paymentHistory: [...(order.paymentHistory || []), paymentRecord]
        };
      }
      return order;
    }));

    toast({
      title: "Pago registrado",
      description: `Pago de ${formatCurrency(amount)} registrado exitosamente.`,
    });
  };

  // Calcular porcentaje de pago
  const calculatePaymentPercentage = (order: FinanceOrder) => {
    return (order.paidAmount / order.totalAmount) * 100;
  };

  // Generar reporte de ingresos
  const generateIncomeReport = () => {
    const report = {
      totalRevenue: stats.totalRevenue,
      collectedRevenue: stats.collectedRevenue,
      pendingRevenue: stats.pendingRevenue,
      overdueAmount: stats.overdueAmount,
      collectionRate: stats.collectionRate,
      ordersByStatus: {
        readyToBill: readyToBillOrders.length,
        billed: orders.filter(o => o.status === 'billed').length,
        paid: stats.paidOrders,
        overdue: stats.overdueOrders
      }
    };

    // Simular descarga del reporte
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-ingresos-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Reporte generado",
      description: "El reporte de ingresos ha sido descargado.",
    });
  };

  // Sincronizar con sistemas de facturación
  const syncBillingSystems = () => {
    toast({
      title: "Sincronización iniciada",
      description: "Sincronizando con sistemas de facturación...",
    });

    // Simular sincronización
    setTimeout(() => {
      toast({
        title: "Sincronización completada",
        description: "Todos los sistemas de facturación han sido sincronizados.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header del dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Finanzas</h1>
          <p className="text-gray-600">Gestión financiera, facturación y cobranza</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncBillingSystems}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar
          </Button>
          <Button variant="outline" onClick={generateIncomeReport}>
            <Download className="h-4 w-4 mr-2" />
            Reporte
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Factura
          </Button>
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="ready-to-bill">Listas para Facturar</TabsTrigger>
          <TabsTrigger value="pending-payments">Pagos Pendientes</TabsTrigger>
          <TabsTrigger value="billing-systems">Sistemas de Facturación</TabsTrigger>
        </TabsList>

        {/* Vista General */}
        <TabsContent value="overview" className="space-y-6">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.monthlyGrowth}% desde el mes pasado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendiente por Cobrar</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.pendingRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.ordersCount} órdenes pendientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cobrado</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.collectedRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.paidOrders} órdenes pagadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencido</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.overdueOrders} órdenes vencidas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  KPIs Financieros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tasa de Cobranza</span>
                    <span>{stats.collectionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.collectionRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tiempo Promedio de Pago</span>
                    <span>{stats.averagePaymentTime} días</span>
                  </div>
                  <Progress value={(stats.averagePaymentTime / 30) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Órdenes Listas para Facturar</span>
                    <span>{stats.readyToBillOrders}</span>
                  </div>
                  <Progress value={(stats.readyToBillOrders / stats.ordersCount) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Distribución de Estados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Listas para Facturar</span>
                    </div>
                    <span className="text-sm font-medium">{stats.readyToBillOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Facturado</span>
                    </div>
                    <span className="text-sm font-medium">{stats.billedOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Pago Parcial</span>
                    </div>
                    <span className="text-sm font-medium">
                      {orders.filter(o => o.status === 'partial_paid').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Pagado</span>
                    </div>
                    <span className="text-sm font-medium">{stats.paidOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Vencido</span>
                    </div>
                    <span className="text-sm font-medium">{stats.overdueOrders}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4" />
                  Tendencias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Crecimiento Mensual</span>
                    <span className="text-sm font-medium text-green-600">+{stats.monthlyGrowth}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Órdenes por Facturar</span>
                    <span className="text-sm font-medium">{stats.readyToBillOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pagos Pendientes</span>
                    <span className="text-sm font-medium">{pendingPaymentOrders.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total de Órdenes</span>
                    <span className="text-sm font-medium">{stats.ordersCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Órdenes Listas para Facturar */}
        <TabsContent value="ready-to-bill" className="space-y-6">
          <Card>
            <CardHeader>
                               <CardTitle className="flex items-center gap-2">
                   <FileText className="h-4 w-4" />
                   Órdenes Listas para Facturar ({readyToBillOrders.length})
                 </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {readyToBillOrders.map(order => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{getStatusText(order.status)}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                            <div>
                              <span className="font-medium">Cliente:</span>
                              <p className="text-gray-600">{order.customer}</p>
                            </div>
                            <div>
                              <span className="font-medium">Paciente:</span>
                              <p className="text-gray-600">{order.patientName}</p>
                            </div>
                            <div>
                              <span className="font-medium">Cirugía:</span>
                              <p className="text-gray-600">{order.surgery}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Total:</span>
                              <p className="text-lg font-bold">{formatCurrency(order.totalAmount)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Fecha:</span>
                              <p className="text-gray-600">{new Date(order.date).toLocaleDateString('es-ES')}</p>
                            </div>
                            {order.billingContact && (
                              <>
                                <div>
                                  <span className="font-medium">Contacto:</span>
                                  <p className="text-gray-600">{order.billingContact.name}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span>
                                  <p className="text-gray-600">{order.billingContact.email}</p>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Cargos adicionales */}
                          {order.additionalCharges.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-sm mb-2">Cargos Adicionales:</h4>
                              <div className="space-y-1">
                                {order.additionalCharges.map(charge => (
                                  <div key={charge.id} className="flex justify-between text-sm">
                                    <span>{charge.description}</span>
                                    <span>{formatCurrency(charge.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" onClick={() => markAsBilled(order.id)}>
                            <FileText className="h-4 w-4 mr-1" />
                            Generar Factura
                          </Button>
                          
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                          
                          <Button size="sm" variant="outline">
                            <Send className="h-4 w-4 mr-1" />
                            Enviar por Email
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {readyToBillOrders.length === 0 && (
                                     <div className="text-center py-8">
                     <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes listas para facturar</h3>
                     <p className="text-gray-500">Todas las órdenes han sido procesadas o están en otros estados.</p>
                   </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pagos Pendientes */}
        <TabsContent value="pending-payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Pagos Pendientes ({pendingPaymentOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPaymentOrders.map(order => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{getStatusText(order.status)}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                            <div>
                              <span className="font-medium">Cliente:</span>
                              <p className="text-gray-600">{order.customer}</p>
                            </div>
                            <div>
                              <span className="font-medium">Paciente:</span>
                              <p className="text-gray-600">{order.patientName}</p>
                            </div>
                            <div>
                              <span className="font-medium">Cirugía:</span>
                              <p className="text-gray-600">{order.surgery}</p>
                            </div>
                          </div>

                          {/* Progreso de pago */}
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span>Progreso de Pago</span>
                              <span>{calculatePaymentPercentage(order).toFixed(1)}%</span>
                            </div>
                            <Progress value={calculatePaymentPercentage(order)} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Pagado: {formatCurrency(order.paidAmount)}</span>
                              <span>Pendiente: {formatCurrency(order.pendingAmount)}</span>
                            </div>
                          </div>

                          {/* Información financiera */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Total:</span>
                              <p className="text-lg font-bold">{formatCurrency(order.totalAmount)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Pagado:</span>
                              <p className="text-green-600 font-medium">{formatCurrency(order.paidAmount)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Pendiente:</span>
                              <p className="text-orange-600 font-medium">{formatCurrency(order.pendingAmount)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Fecha Vencimiento:</span>
                              <p className="text-gray-600">{order.dueDate ? new Date(order.dueDate).toLocaleDateString('es-ES') : 'N/A'}</p>
                            </div>
                          </div>

                          {/* Historial de pagos */}
                          {order.paymentHistory && order.paymentHistory.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-sm mb-2">Historial de Pagos:</h4>
                              <div className="space-y-1">
                                {order.paymentHistory.map(payment => (
                                  <div key={payment.id} className="flex justify-between text-sm">
                                    <span>{new Date(payment.date).toLocaleDateString('es-ES')} - {payment.method}</span>
                                    <span>{formatCurrency(payment.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedOrder(order);
                            setShowPaymentModal(true);
                          }}>
                            <DollarSign className="h-4 w-4 mr-1" />
                            Registrar Pago
                          </Button>
                          
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalles
                          </Button>
                          
                          <Button size="sm" variant="outline">
                            <Send className="h-4 w-4 mr-1" />
                            Recordatorio
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {pendingPaymentOrders.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos pendientes</h3>
                    <p className="text-gray-500">Todas las facturas han sido pagadas completamente.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistemas de Facturación */}
        <TabsContent value="billing-systems" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiptIcon className="h-4 w-4" />
                Sistemas de Facturación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingSystems.map(system => (
                  <Card key={system.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{system.name}</h3>
                            <Badge className={
                              system.status === 'connected' ? 'bg-green-100 text-green-800' :
                              system.status === 'error' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {system.status === 'connected' ? 'Conectado' :
                               system.status === 'error' ? 'Error' : 'Desconectado'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Tipo:</span>
                              <p className="text-gray-600">{system.type.toUpperCase()}</p>
                            </div>
                            <div>
                              <span className="font-medium">Última Sincronización:</span>
                              <p className="text-gray-600">{new Date(system.lastSync).toLocaleString('es-ES')}</p>
                            </div>
                            <div>
                              <span className="font-medium">Estado:</span>
                              <p className="text-gray-600">{system.status}</p>
                            </div>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Sincronizar
                          </Button>
                          
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Configuración
                          </Button>
                          
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Registro de Pago */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <Label>Orden</Label>
                <p className="text-sm text-gray-600">{selectedOrder.orderNumber}</p>
              </div>
              <div>
                <Label>Monto Pendiente</Label>
                <p className="text-lg font-bold">{formatCurrency(selectedOrder.pendingAmount)}</p>
              </div>
              <div>
                <Label>Método de Pago</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="check">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Monto a Pagar</Label>
                <Input type="number" placeholder="Ingrese el monto" />
              </div>
              <div>
                <Label>Referencia</Label>
                <Input placeholder="Número de referencia" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowPaymentModal(false)} variant="outline">
                  Cancelar
                </Button>
                <Button onClick={() => {
                  registerPayment(selectedOrder.id, selectedOrder.pendingAmount, 'transfer');
                  setShowPaymentModal(false);
                }}>
                  Registrar Pago
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceDashboard; 