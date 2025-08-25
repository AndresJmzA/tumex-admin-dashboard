import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  FileText, 
  Download, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar,
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Printer,
  FileSpreadsheet,
  FilePdf,
  BarChart,
  LineChart,
  Activity,
  Target,
  Zap,
  TrendingDown,
  CalendarDays,
  Package,
  Truck,
  UserCheck,
  UserX,
  RotateCcw,
  CheckSquare,
  Clock as ClockIcon,
  DollarSign as DollarSignIcon,
  Users as UsersIcon,
  Package as PackageIcon,
  Truck as TruckIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon2,
  Users as UsersIcon2,
  DollarSign as DollarSignIcon2,
  Package as PackageIcon2,
  Truck as TruckIcon2,
  CheckCircle as CheckCircleIcon2,
  XCircle as XCircleIcon2,
  AlertTriangle as AlertTriangleIcon2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para reportes
interface OrderReport {
  id: string;
  orderNumber: string;
  patientName: string;
  doctorName: string;
  surgeryDate: string;
  surgeryTime: string;
  status: string;
  totalAmount: number;
  processingTime: number; // en horas
  confirmationTime: number; // en horas
  preparationTime: number; // en horas
  completionTime: number; // en horas
  createdAt: string;
  completedAt?: string;
  confirmedAt?: string;
  preparedAt?: string;
  assignedTechnicians: string[];
  selectedProducts: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  notes: string;
  commercialNotes: string;
}

interface ReportMetrics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  rejectedOrders: number;
  averageProcessingTime: number;
  averageConfirmationTime: number;
  averagePreparationTime: number;
  averageCompletionTime: number;
  totalRevenue: number;
  revenueByStatus: Record<string, number>;
  ordersByStatus: Record<string, number>;
  ordersByMonth: Record<string, number>;
  ordersByDoctor: Record<string, number>;
  ordersByProcedure: Record<string, number>;
  confirmationRate: number;
  rejectionRate: number;
  completionRate: number;
  preparationRate: number;
}

interface ReportFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  status: string[];
  doctorId: string[];
  procedureId: string[];
  coverageType: string[];
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

interface OrderReportsProps {
  // Props específicas para el componente de reportes
}

const OrderReports: React.FC<OrderReportsProps> = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<OrderReport[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: null,
    dateTo: null,
    status: [],
    doctorId: [],
    procedureId: [],
    coverageType: [],
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [loading, setLoading] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Datos mock para demostración
  const mockReports: OrderReport[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      patientName: 'María González',
      doctorName: 'Dr. Carlos Rodríguez',
      surgeryDate: '2024-01-15',
      surgeryTime: '09:00',
      status: 'completed',
      totalAmount: 15000,
      processingTime: 48,
      confirmationTime: 2,
      preparationTime: 4,
      completionTime: 6,
      createdAt: '2024-01-13T10:00:00Z',
      completedAt: '2024-01-15T16:00:00Z',
      confirmedAt: '2024-01-13T12:00:00Z',
      preparedAt: '2024-01-14T14:00:00Z',
      assignedTechnicians: ['Técnico Juan', 'Técnico Ana'],
      selectedProducts: [
        { name: 'Monitor Cardíaco', quantity: 1, price: 5000 },
        { name: 'Bomba de Infusión', quantity: 2, price: 3000 },
        { name: 'Desfibrilador', quantity: 1, price: 4000 }
      ],
      notes: 'Cirugía cardíaca programada',
      commercialNotes: 'Cliente VIP, atención especial requerida'
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      patientName: 'Juan Pérez',
      doctorName: 'Dra. Ana Martínez',
      surgeryDate: '2024-01-16',
      surgeryTime: '14:00',
      status: 'in_progress',
      totalAmount: 12000,
      processingTime: 24,
      confirmationTime: 1,
      preparationTime: 3,
      completionTime: 0,
      createdAt: '2024-01-15T08:00:00Z',
      confirmedAt: '2024-01-15T09:00:00Z',
      preparedAt: '2024-01-15T11:00:00Z',
      assignedTechnicians: ['Técnico Pedro'],
      selectedProducts: [
        { name: 'Monitor de Presión', quantity: 1, price: 4000 },
        { name: 'Ventilador', quantity: 1, price: 8000 }
      ],
      notes: 'Cirugía pulmonar',
      commercialNotes: 'Paciente con seguro médico'
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      patientName: 'Carmen López',
      doctorName: 'Dr. Luis García',
      surgeryDate: '2024-01-17',
      surgeryTime: '11:00',
      status: 'rejected',
      totalAmount: 8000,
      processingTime: 12,
      confirmationTime: 0,
      preparationTime: 0,
      completionTime: 0,
      createdAt: '2024-01-16T14:00:00Z',
      assignedTechnicians: [],
      selectedProducts: [
        { name: 'Monitor Básico', quantity: 1, price: 3000 },
        { name: 'Oxímetro', quantity: 1, price: 2000 },
        { name: 'Termómetro', quantity: 1, price: 3000 }
      ],
      notes: 'Cirugía menor cancelada',
      commercialNotes: 'Paciente canceló por motivos personales'
    }
  ];

  useEffect(() => {
    loadReports();
    calculateMetrics();
  }, [filters]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReports(mockReports);
      generateChartData(mockReports);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const totalOrders = reports.length;
    const completedOrders = reports.filter(r => r.status === 'completed').length;
    const pendingOrders = reports.filter(r => ['created', 'pending_objects', 'approved'].includes(r.status)).length;
    const rejectedOrders = reports.filter(r => r.status === 'rejected').length;

    const totalRevenue = reports.reduce((sum, r) => sum + r.totalAmount, 0);
    const averageProcessingTime = reports.reduce((sum, r) => sum + r.processingTime, 0) / totalOrders;
    const averageConfirmationTime = reports.reduce((sum, r) => sum + r.confirmationTime, 0) / totalOrders;
    const averagePreparationTime = reports.reduce((sum, r) => sum + r.preparationTime, 0) / totalOrders;
    const averageCompletionTime = reports.reduce((sum, r) => sum + r.completionTime, 0) / totalOrders;

    const revenueByStatus = reports.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + r.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    const ordersByStatus = reports.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const confirmationRate = (reports.filter(r => r.confirmationTime > 0).length / totalOrders) * 100;
    const rejectionRate = (rejectedOrders / totalOrders) * 100;
    const completionRate = (completedOrders / totalOrders) * 100;
    const preparationRate = (reports.filter(r => r.preparationTime > 0).length / totalOrders) * 100;

    setMetrics({
      totalOrders,
      completedOrders,
      pendingOrders,
      rejectedOrders,
      averageProcessingTime,
      averageConfirmationTime,
      averagePreparationTime,
      averageCompletionTime,
      totalRevenue,
      revenueByStatus,
      ordersByStatus,
      ordersByMonth: {},
      ordersByDoctor: {},
      ordersByProcedure: {},
      confirmationRate,
      rejectionRate,
      completionRate,
      preparationRate
    });
  };

  const generateChartData = (data: OrderReport[]) => {
    const statusLabels = ['Completadas', 'En Proceso', 'Pendientes', 'Rechazadas'];
    const statusData = [
      data.filter(r => r.status === 'completed').length,
      data.filter(r => r.status === 'in_progress').length,
      data.filter(r => ['created', 'pending_objects', 'approved'].includes(r.status)).length,
      data.filter(r => r.status === 'rejected').length
    ];

    setChartData({
      labels: statusLabels,
      datasets: [
        {
          label: 'Órdenes por Estado',
          data: statusData,
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
          borderColor: ['#059669', '#2563eb', '#d97706', '#dc2626'],
          borderWidth: 2
        }
      ]
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours < 24) return `${Math.round(hours)} hrs`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'created': return 'bg-yellow-100 text-yellow-800';
      case 'pending_objects': return 'bg-amber-100 text-amber-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />;
      case 'in_progress': return <Activity className="w-4 h-4" />;
      case 'rejected': return <XCircleIcon className="w-4 h-4" />;
      case 'created': return <FileText className="w-4 h-4" />;
      case 'pending_objects': return <PackageIcon className="w-4 h-4" />;
      case 'approved': return <CheckCircleIcon2 className="w-4 h-4" />;
      default: return <ClockIcon className="w-4 h-4" />;
    }
  };

  const exportToPDF = () => {
    toast({
      title: "Exportando PDF",
      description: "Generando reporte en PDF...",
    });
    // Implementar exportación a PDF
  };

  const exportToExcel = () => {
    toast({
      title: "Exportando Excel",
      description: "Generando reporte en Excel...",
    });
    // Implementar exportación a Excel
  };

  const printReport = () => {
    toast({
      title: "Imprimiendo",
      description: "Preparando reporte para impresión...",
    });
    // Implementar impresión
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(reports.map(r => r.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId: string, checked: boolean) => {
    if (checked) {
      setSelectedReports([...selectedReports, reportId]);
    } else {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reportes de Órdenes</h1>
          <p className="text-muted-foreground">
            Análisis detallado de métricas y rendimiento de órdenes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadReports} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={exportToPDF}>
            <FilePdf className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={exportToExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={printReport}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {filters.dateFrom ? format(filters.dateFrom, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DatePicker
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {filters.dateTo ? format(filters.dateTo, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <DatePicker
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={filters.status[0] || ''}
                onValueChange={(value) => setFilters({ ...filters, status: value ? [value] : [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="in_progress">En Proceso</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar órdenes..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Órdenes</p>
                  <p className="text-2xl font-bold">{metrics.totalOrders}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                </div>
                <DollarSignIcon className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                  <p className="text-2xl font-bold">{formatTime(metrics.averageProcessingTime)}</p>
                </div>
                <ClockIcon className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasa de Completado</p>
                  <p className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs de Reportes */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de Tiempo */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Tiempo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Confirmación</span>
                    <span className="text-sm font-medium">{formatTime(metrics?.averageConfirmationTime || 0)}</span>
                  </div>
                  <Progress value={((metrics?.averageConfirmationTime || 0) / 24) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Preparación</span>
                    <span className="text-sm font-medium">{formatTime(metrics?.averagePreparationTime || 0)}</span>
                  </div>
                  <Progress value={((metrics?.averagePreparationTime || 0) / 24) * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Completado</span>
                    <span className="text-sm font-medium">{formatTime(metrics?.averageCompletionTime || 0)}</span>
                  </div>
                  <Progress value={((metrics?.averageCompletionTime || 0) / 24) * 100} />
                </div>
              </CardContent>
            </Card>

            {/* Estados de Órdenes */}
            <Card>
              <CardHeader>
                <CardTitle>Estados de Órdenes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics?.ordersByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de Órdenes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedReports.length === reports.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">Seleccionar todos</span>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seleccionar</TableHead>
                      <TableHead>Orden</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Tiempo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedReports.includes(report.id)}
                            onCheckedChange={(checked) => handleSelectReport(report.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{report.orderNumber}</TableCell>
                        <TableCell>{report.patientName}</TableCell>
                        <TableCell>{report.doctorName}</TableCell>
                        <TableCell>{format(new Date(report.surgeryDate), 'dd/MM/yyyy', { locale: es })}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            {report.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(report.totalAmount)}</TableCell>
                        <TableCell>{formatTime(report.processingTime)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de Confirmación */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Confirmación Médica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{metrics?.confirmationRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Tasa de Confirmación</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{metrics?.rejectionRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Tasa de Rechazo</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tiempo promedio de confirmación</span>
                    <span className="text-sm font-medium">{formatTime(metrics?.averageConfirmationTime || 0)}</span>
                  </div>
                  <Progress value={metrics?.confirmationRate || 0} />
                </div>
              </CardContent>
            </Card>

            {/* Métricas de Preparación */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Preparación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{metrics?.preparationRate.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Tasa de Preparación</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{formatTime(metrics?.averagePreparationTime || 0)}</p>
                    <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Órdenes preparadas</span>
                    <span className="text-sm font-medium">{reports.filter(r => r.preparationTime > 0).length}</span>
                  </div>
                  <Progress value={metrics?.preparationRate || 0} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Estados */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Gráfico de distribución por estado</p>
                    <p className="text-sm text-muted-foreground">Implementar con librería de gráficos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Tiempos */}
            <Card>
              <CardHeader>
                <CardTitle>Tiempos de Procesamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Gráfico de tiempos de procesamiento</p>
                    <p className="text-sm text-muted-foreground">Implementar con librería de gráficos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderReports; 