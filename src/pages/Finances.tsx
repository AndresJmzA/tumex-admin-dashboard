import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent 
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Calendar,
  CreditCard,
  Wallet,
  PiggyBank,
  Receipt,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Users,
  Building,
  Package,
  Activity,
  Target,
  Zap,
  Coins,
  Banknote,
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
  Database,
  FileEdit,
  FileInput,
  FileJson,
  FileOutput,
  FilePieChart,
  FileStack,
  FileTerminal,
  FileX2,
  Mail,
  Check,
  X,
  Minus,
  Plus as PlusIcon,
  ChevronDown,
  Share2,
  Table
} from 'lucide-react';

// Tipos para el dashboard de finanzas
interface FinanceData {
  monthlyRevenue: number;
  monthlyExpenses: number;
  profitMargin: number;
  outstandingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  averagePaymentTime: number;
  customerCount: number;
  orderCount: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  orders: number;
}

interface CustomerData {
  name: string;
  totalSpent: number;
  orders: number;
  lastOrder: string;
  status: 'active' | 'inactive' | 'premium';
}

interface InvoiceData {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  invoiceDate: string;
  paymentMethod: string;
}

const Finances = () => {
  const [financeData, setFinanceData] = useState<FinanceData>({
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    profitMargin: 0,
    outstandingInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    averagePaymentTime: 0,
    customerCount: 0,
    orderCount: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  });

  const [monthlyData] = useState<MonthlyData[]>([
    { month: 'Ene', revenue: 45000, expenses: 28000, profit: 17000, orders: 12 },
    { month: 'Feb', revenue: 52000, expenses: 32000, profit: 20000, orders: 15 },
    { month: 'Mar', revenue: 48000, expenses: 30000, profit: 18000, orders: 14 },
    { month: 'Abr', revenue: 61000, expenses: 35000, profit: 26000, orders: 18 },
    { month: 'May', revenue: 55000, expenses: 33000, profit: 22000, orders: 16 },
    { month: 'Jun', revenue: 67000, expenses: 38000, profit: 29000, orders: 20 },
    { month: 'Jul', revenue: 59000, expenses: 36000, profit: 23000, orders: 17 },
    { month: 'Ago', revenue: 72000, expenses: 42000, profit: 30000, orders: 22 },
    { month: 'Sep', revenue: 65000, expenses: 39000, profit: 26000, orders: 19 },
    { month: 'Oct', revenue: 78000, expenses: 45000, profit: 33000, orders: 24 },
    { month: 'Nov', revenue: 71000, expenses: 43000, profit: 28000, orders: 21 },
    { month: 'Dic', revenue: 85000, expenses: 48000, profit: 37000, orders: 26 }
  ]);

  const [customerData] = useState<CustomerData[]>([
    { name: 'Hospital General', totalSpent: 125000, orders: 8, lastOrder: '2024-01-15', status: 'premium' },
    { name: 'Clínica Santa María', totalSpent: 89000, orders: 6, lastOrder: '2024-01-10', status: 'active' },
    { name: 'Centro Médico ABC', totalSpent: 67000, orders: 4, lastOrder: '2024-01-08', status: 'active' },
    { name: 'Hospital San José', totalSpent: 45000, orders: 3, lastOrder: '2024-01-05', status: 'inactive' },
    { name: 'Clínica del Norte', totalSpent: 78000, orders: 5, lastOrder: '2024-01-12', status: 'premium' }
  ]);

  const [invoiceData] = useState<InvoiceData[]>([
    { id: 'FAC-2024-001', customer: 'Hospital General', amount: 45000, status: 'paid', dueDate: '2024-02-15', invoiceDate: '2024-01-15', paymentMethod: 'Transferencia' },
    { id: 'FAC-2024-002', customer: 'Clínica Santa María', amount: 28000, status: 'pending', dueDate: '2024-02-20', invoiceDate: '2024-01-20', paymentMethod: 'Pendiente' },
    { id: 'FAC-2024-003', customer: 'Centro Médico ABC', amount: 18000, status: 'overdue', dueDate: '2024-02-10', invoiceDate: '2024-01-10', paymentMethod: 'Pendiente' },
    { id: 'FAC-2024-004', customer: 'Hospital San José', amount: 32000, status: 'paid', dueDate: '2024-02-18', invoiceDate: '2024-01-18', paymentMethod: 'Cheque' },
    { id: 'FAC-2024-005', customer: 'Clínica del Norte', amount: 25000, status: 'pending', dueDate: '2024-02-25', invoiceDate: '2024-01-25', paymentMethod: 'Pendiente' }
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');

  useEffect(() => {
    // Calcular datos financieros
    const currentMonth = monthlyData[monthlyData.length - 1];
    const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
    const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    setFinanceData({
      monthlyRevenue: currentMonth.revenue,
      monthlyExpenses: currentMonth.expenses,
      profitMargin,
      outstandingInvoices: invoiceData.filter(inv => inv.status === 'pending').length,
      paidInvoices: invoiceData.filter(inv => inv.status === 'paid').length,
      overdueInvoices: invoiceData.filter(inv => inv.status === 'overdue').length,
      averagePaymentTime: 28,
      customerCount: customerData.length,
      orderCount: monthlyData.reduce((sum, month) => sum + month.orders, 0),
      totalRevenue,
      totalExpenses,
      netProfit
    });
  }, [monthlyData, invoiceData, customerData]);

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: 'Pagada',
      pending: 'Pendiente',
      overdue: 'Vencida'
    };
    return labels[status] || status;
  };

  const getCustomerStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800',
      premium: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || colors.active;
  };

  const getCustomerStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      premium: 'Premium'
    };
    return labels[status] || status;
  };

  const handleExport = (format: string) => {
    console.log(`Exportando reporte financiero como ${format}`);
    // Aquí iría la lógica de exportación
  };

  const handleNewInvoice = () => {
    console.log('Creando nueva factura');
    setShowNewInvoiceModal(false);
    // Aquí iría la lógica para crear nueva factura
  };

  // Filtrar facturas recientes basado en la búsqueda
  const filteredRecentInvoices = invoiceData.filter(invoice =>
    invoice.id.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
    invoice.customer.toLowerCase().includes(invoiceSearchTerm.toLowerCase())
  );

  // Datos para gráficas
  const revenueChartData = monthlyData.map(month => ({
    name: month.month,
    Ingresos: month.revenue,
    Gastos: month.expenses,
    Utilidad: month.profit
  }));

  const profitChartData = monthlyData.map(month => ({
    name: month.month,
    Utilidad: month.profit
  }));

  const pieChartData = [
    { name: 'Ingresos', value: financeData.totalRevenue, color: '#10b981' },
    { name: 'Gastos', value: financeData.totalExpenses, color: '#ef4444' }
  ];

  const invoiceStatusData = [
    { name: 'Pagadas', value: financeData.paidInvoices, color: '#10b981' },
    { name: 'Pendientes', value: financeData.outstandingInvoices, color: '#f59e0b' },
    { name: 'Vencidas', value: financeData.overdueInvoices, color: '#ef4444' }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finanzas</h1>
          <p className="text-gray-600">Dashboard financiero y análisis de ingresos</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Menú de Exportación */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Reporte
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Formato de Exportación</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar como PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar como Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <Table className="h-4 w-4 mr-2" />
                Exportar como CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar como JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('email')}>
                <Mail className="h-4 w-4 mr-2" />
                Enviar por Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('share')}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartir Enlace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Modal de Nueva Factura */}
          <Dialog open={showNewInvoiceModal} onOpenChange={setShowNewInvoiceModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Factura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nueva Factura
                </DialogTitle>
                <DialogDescription>
                  Selecciona una factura reciente como base o crea una nueva desde cero.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Barra de búsqueda */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar facturas recientes</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar por ID de factura o cliente..."
                      value={invoiceSearchTerm}
                      onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Lista de facturas recientes */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Facturas Recientes</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {filteredRecentInvoices.length > 0 ? (
                      filteredRecentInvoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => {
                            console.log(`Seleccionada factura: ${invoice.id}`);
                            setShowNewInvoiceModal(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{invoice.id}</p>
                              <p className="text-sm text-gray-600">{invoice.customer}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(invoice.amount)}</p>
                            <Badge className={getStatusColor(invoice.status)}>
                              {getStatusLabel(invoice.status)}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileX className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No se encontraron facturas</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opción para crear nueva factura desde cero */}
                <div className="border-t pt-4">
                  <Button 
                    onClick={handleNewInvoice}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nueva Factura desde Cero
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewInvoiceModal(false)}>
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Ingresos Mensuales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(financeData.monthlyRevenue)}</div>
            <p className="text-xs text-green-700 mt-1">
              +12.5% vs mes anterior
            </p>
            <Progress value={75} className="mt-2 bg-green-200" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Utilidad Neta</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(financeData.netProfit)}</div>
            <p className="text-xs text-blue-700 mt-1">
              Margen: {financeData.profitMargin.toFixed(1)}%
            </p>
            <Progress value={financeData.profitMargin} className="mt-2 bg-blue-200" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Facturas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{financeData.outstandingInvoices}</div>
            <p className="text-xs text-purple-700 mt-1">
              {financeData.overdueInvoices} vencidas
            </p>
            <Progress value={(financeData.outstandingInvoices / (financeData.outstandingInvoices + financeData.paidInvoices)) * 100} className="mt-2 bg-purple-200" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{financeData.customerCount}</div>
            <p className="text-xs text-orange-700 mt-1">
              {financeData.orderCount} órdenes totales
            </p>
            <Progress value={80} className="mt-2 bg-orange-200" />
          </CardContent>
        </Card>
      </div>

      {/* Gráficas Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de Ingresos vs Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ingresos vs Gastos Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                Ingresos: {
                  label: "Ingresos",
                  color: "#10b981",
                },
                Gastos: {
                  label: "Gastos",
                  color: "#ef4444",
                },
                Utilidad: {
                  label: "Utilidad",
                  color: "#3b82f6",
                },
              }}
            >
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="Ingresos" fill="#10b981" />
                <Bar dataKey="Gastos" fill="#ef4444" />
                <Bar dataKey="Utilidad" fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfica de Utilidad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolución de Utilidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                Utilidad: {
                  label: "Utilidad",
                  color: "#3b82f6",
                },
              }}
            >
              <AreaChart data={profitChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="Utilidad" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas Secundarias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de Pastel - Ingresos vs Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribución Ingresos vs Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                Ingresos: {
                  label: "Ingresos",
                  color: "#10b981",
                },
                Gastos: {
                  label: "Gastos",
                  color: "#ef4444",
                },
              }}
            >
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfica de Pastel - Estado de Facturas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Estado de Facturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                Pagadas: {
                  label: "Pagadas",
                  color: "#10b981",
                },
                Pendientes: {
                  label: "Pendientes",
                  color: "#f59e0b",
                },
                Vencidas: {
                  label: "Vencidas",
                  color: "#ef4444",
                },
              }}
            >
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {invoiceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con Tablas Detalladas */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">Facturas</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Facturas Recientes
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoiceData.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-sm">{invoice.id}</p>
                        <p className="text-sm text-gray-600">{invoice.customer}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatCurrency(invoice.amount)}</p>
                        <p className="text-xs text-gray-500">{formatDate(invoice.invoiceDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(invoice.status)}>
                        {getStatusLabel(invoice.status)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Vence: {formatDate(invoice.dueDate)}</p>
                        <p className="text-xs text-gray-500">{invoice.paymentMethod}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes Principales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customerData.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.orders} órdenes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(customer.totalSpent)}</p>
                        <p className="text-xs text-gray-500">Última: {formatDate(customer.lastOrder)}</p>
                      </div>
                      <Badge className={getCustomerStatusColor(customer.status)}>
                        {getCustomerStatusLabel(customer.status)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Métricas de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tiempo Promedio de Pago</span>
                    <span className="font-medium">{financeData.averagePaymentTime} días</span>
                  </div>
                  <Progress value={70} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tasa de Cobranza</span>
                    <span className="font-medium">85.2%</span>
                  </div>
                  <Progress value={85.2} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Margen de Utilidad</span>
                    <span className="font-medium">{financeData.profitMargin.toFixed(1)}%</span>
                  </div>
                  <Progress value={financeData.profitMargin} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objetivos Financieros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Meta de Ingresos</span>
                      <span className="text-sm font-medium">{formatCurrency(800000)}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">75% completado</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Meta de Clientes</span>
                      <span className="text-sm font-medium">50</span>
                    </div>
                    <Progress value={60} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">30 de 50 clientes</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Meta de Utilidad</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">20% actual</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
            <Button variant="outline" className="h-20 flex-col">
              <Receipt className="h-6 w-6 mb-2" />
              <span className="text-sm">Nueva Factura</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="text-sm">Generar Reporte</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Mail className="h-6 w-6 mb-2" />
              <span className="text-sm">Recordatorios</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              <span className="text-sm">Configuración</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finances;
