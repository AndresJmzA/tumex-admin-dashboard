import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Package,
  Truck,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Eye,
  Download,
  Filter,
  Search,
  Zap,
  AlertCircle,
  CheckCheck,
  RotateCcw,
  CalendarDays,
  Timer,
  Gauge,
  Award,
  Star,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Clock as ClockIcon,
  Target as TargetIcon,
  AlertTriangle as AlertTriangleIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Users as UsersIcon,
  Package as PackageIcon,
  Truck as TruckIcon,
  Calendar as CalendarIcon,
  BarChart3 as BarChart3Icon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  RefreshCw as RefreshCwIcon,
  Eye as EyeIcon,
  Download as DownloadIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  Zap as ZapIcon,
  AlertCircle as AlertCircleIcon,
  CheckCheck as CheckCheckIcon,
  RotateCcw as RotateCcwIcon,
  CalendarDays as CalendarDaysIcon,
  Timer as TimerIcon,
  Gauge as GaugeIcon,
  Award as AwardIcon,
  Star as StarIcon
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

// Tipos para métricas de rendimiento
interface PerformanceMetrics {
  // Métricas de tiempo por etapa
  timeMetrics: {
    averageCreationToApproval: number; // horas
    averageApprovalToPreparation: number; // horas
    averagePreparationToAssignment: number; // horas
    averageAssignmentToCompletion: number; // horas
    averageTotalProcessingTime: number; // horas
    targetProcessingTime: number; // horas
  };
  
  // Indicadores de calidad
  qualityMetrics: {
    approvalRate: number; // porcentaje
    rejectionRate: number; // porcentaje
    completionRate: number; // porcentaje
    customerSatisfactionScore: number; // 1-10
    reworkRate: number; // porcentaje
    onTimeDeliveryRate: number; // porcentaje
  };
  
  // Alertas de rendimiento
  performanceAlerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    resolved: boolean;
    actionRequired: boolean;
  }>;
  
  // Comparativas por período
  periodComparisons: {
    currentPeriod: {
      totalOrders: number;
      averageProcessingTime: number;
      completionRate: number;
      revenue: number;
    };
    previousPeriod: {
      totalOrders: number;
      averageProcessingTime: number;
      completionRate: number;
      revenue: number;
    };
    growth: {
      ordersGrowth: number; // porcentaje
      timeImprovement: number; // porcentaje
      completionImprovement: number; // porcentaje
      revenueGrowth: number; // porcentaje
    };
  };
  
  // KPIs por rol
  roleKPIs: {
    'Gerente Comercial': {
      ordersCreated: number;
      approvalRate: number;
      averageConfirmationTime: number;
      customerSatisfaction: number;
    };
    'Gerente Operativo': {
      ordersProcessed: number;
      averageProcessingTime: number;
      completionRate: number;
      efficiencyScore: number;
    };
    'Jefe de Almacén': {
      ordersPrepared: number;
      preparationAccuracy: number;
      averagePreparationTime: number;
      stockUtilization: number;
    };
    'Técnico': {
      ordersCompleted: number;
      averageCompletionTime: number;
      qualityScore: number;
      customerFeedback: number;
    };
  };
}

interface MetricsFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  role: string;
  metricType: string;
  comparisonPeriod: 'week' | 'month' | 'quarter' | 'year';
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

interface PerformanceMetricsProps {
  // Props específicas para el componente de métricas de rendimiento
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [filters, setFilters] = useState<MetricsFilters>({
    dateFrom: null,
    dateTo: null,
    role: 'all',
    metricType: 'all',
    comparisonPeriod: 'month'
  });
  const [loading, setLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [showAlertDetails, setShowAlertDetails] = useState(false);

  // Datos mock para demostración
  const mockMetrics: PerformanceMetrics = {
    timeMetrics: {
      averageCreationToApproval: 2.5,
      averageApprovalToPreparation: 4.2,
      averagePreparationToAssignment: 1.8,
      averageAssignmentToCompletion: 6.5,
      averageTotalProcessingTime: 15.0,
      targetProcessingTime: 12.0
    },
    qualityMetrics: {
      approvalRate: 87.5,
      rejectionRate: 12.5,
      completionRate: 94.2,
      customerSatisfactionScore: 8.7,
      reworkRate: 3.2,
      onTimeDeliveryRate: 91.8
    },
    performanceAlerts: [
      {
        id: '1',
        type: 'warning',
        title: 'Tiempo de procesamiento alto',
        message: 'El tiempo promedio de procesamiento ha aumentado un 15% en la última semana',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        resolved: false,
        actionRequired: true
      },
      {
        id: '2',
        type: 'error',
        title: 'Tasa de rechazo elevada',
        message: 'La tasa de rechazo ha superado el umbral del 15%',
        severity: 'high',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        resolved: false,
        actionRequired: true
      },
      {
        id: '3',
        type: 'success',
        title: 'Mejora en satisfacción del cliente',
        message: 'La puntuación de satisfacción ha mejorado un 12% este mes',
        severity: 'low',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        resolved: true,
        actionRequired: false
      }
    ],
    periodComparisons: {
      currentPeriod: {
        totalOrders: 156,
        averageProcessingTime: 15.0,
        completionRate: 94.2,
        revenue: 1250000
      },
      previousPeriod: {
        totalOrders: 142,
        averageProcessingTime: 16.8,
        completionRate: 91.5,
        revenue: 1180000
      },
      growth: {
        ordersGrowth: 9.9,
        timeImprovement: 10.7,
        completionImprovement: 3.0,
        revenueGrowth: 5.9
      }
    },
    roleKPIs: {
      'Gerente Comercial': {
        ordersCreated: 45,
        approvalRate: 89.2,
        averageConfirmationTime: 2.1,
        customerSatisfaction: 8.9
      },
      'Gerente Operativo': {
        ordersProcessed: 156,
        averageProcessingTime: 15.0,
        completionRate: 94.2,
        efficiencyScore: 8.5
      },
      'Jefe de Almacén': {
        ordersPrepared: 142,
        preparationAccuracy: 96.8,
        averagePreparationTime: 1.8,
        stockUtilization: 87.3
      },
      'Técnico': {
        ordersCompleted: 147,
        averageCompletionTime: 6.5,
        qualityScore: 9.2,
        customerFeedback: 8.7
      }
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [filters]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMetrics(mockMetrics);
      toast({
        title: "Métricas cargadas",
        description: "Los datos de rendimiento se han actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error al cargar métricas",
        description: "No se pudieron cargar los datos de rendimiento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}min` : `${wholeHours}h`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'info': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const exportMetrics = () => {
    toast({
      title: "Exportación iniciada",
      description: "Los datos de métricas se están exportando...",
    });
  };

  const refreshMetrics = () => {
    loadMetrics();
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Cargando métricas de rendimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Métricas de Rendimiento</h1>
          <p className="text-muted-foreground">
            Análisis de rendimiento y KPIs del sistema TUMex
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshMetrics} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={exportMetrics}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Métricas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateFrom">Fecha desde</Label>
              <DatePicker
                selected={filters.dateFrom}
                onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                placeholder="Seleccionar fecha"
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Fecha hasta</Label>
              <DatePicker
                selected={filters.dateTo}
                onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                placeholder="Seleccionar fecha"
              />
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="Gerente Comercial">Gerente Comercial</SelectItem>
                  <SelectItem value="Gerente Operativo">Gerente Operativo</SelectItem>
                  <SelectItem value="Jefe de Almacén">Jefe de Almacén</SelectItem>
                  <SelectItem value="Técnico">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="period">Período de comparación</Label>
              <Select value={filters.comparisonPeriod} onValueChange={(value: any) => setFilters({ ...filters, comparisonPeriod: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mes</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="year">Año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="time">Métricas de Tiempo</TabsTrigger>
          <TabsTrigger value="quality">Indicadores de Calidad</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="comparison">Comparativas</TabsTrigger>
          <TabsTrigger value="kpis">KPIs por Rol</TabsTrigger>
        </TabsList>

        {/* Resumen General */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.timeMetrics.averageTotalProcessingTime)}</div>
                <p className="text-xs text-muted-foreground">
                  Meta: {formatTime(metrics.timeMetrics.targetProcessingTime)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.qualityMetrics.approvalRate)}</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% vs mes anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfacción Cliente</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.qualityMetrics.customerSatisfactionScore}/10</div>
                <p className="text-xs text-muted-foreground">
                  +0.3 vs mes anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entregas a Tiempo</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.qualityMetrics.onTimeDeliveryRate)}</div>
                <p className="text-xs text-muted-foreground">
                  +1.2% vs mes anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de rendimiento general */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tiempo de Procesamiento</span>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(metrics.timeMetrics.averageTotalProcessingTime)} / {formatTime(metrics.timeMetrics.targetProcessingTime)}
                  </span>
                </div>
                <Progress 
                  value={(metrics.timeMetrics.averageTotalProcessingTime / metrics.timeMetrics.targetProcessingTime) * 100} 
                  className="h-2"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tasa de Completación</span>
                  <span className="text-sm text-muted-foreground">{formatPercentage(metrics.qualityMetrics.completionRate)}</span>
                </div>
                <Progress value={metrics.qualityMetrics.completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Métricas de Tiempo */}
        <TabsContent value="time" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Creación → Aprobación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.timeMetrics.averageCreationToApproval)}</div>
                <p className="text-xs text-muted-foreground">Tiempo promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Aprobación → Preparación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.timeMetrics.averageApprovalToPreparation)}</div>
                <p className="text-xs text-muted-foreground">Tiempo promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Preparación → Asignación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.timeMetrics.averagePreparationToAssignment)}</div>
                <p className="text-xs text-muted-foreground">Tiempo promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Asignación → Completado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.timeMetrics.averageAssignmentToCompletion)}</div>
                <p className="text-xs text-muted-foreground">Tiempo promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tiempo Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.timeMetrics.averageTotalProcessingTime)}</div>
                <p className="text-xs text-muted-foreground">Tiempo promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Meta de Tiempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(metrics.timeMetrics.targetProcessingTime)}</div>
                <p className="text-xs text-muted-foreground">Objetivo</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Indicadores de Calidad */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tasa de Aprobación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.qualityMetrics.approvalRate)}</div>
                <Progress value={metrics.qualityMetrics.approvalRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tasa de Rechazo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.qualityMetrics.rejectionRate)}</div>
                <Progress value={metrics.qualityMetrics.rejectionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tasa de Completación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.qualityMetrics.completionRate)}</div>
                <Progress value={metrics.qualityMetrics.completionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Satisfacción del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.qualityMetrics.customerSatisfactionScore}/10</div>
                <Progress value={metrics.qualityMetrics.customerSatisfactionScore * 10} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tasa de Reproceso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.qualityMetrics.reworkRate)}</div>
                <Progress value={metrics.qualityMetrics.reworkRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Entregas a Tiempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(metrics.qualityMetrics.onTimeDeliveryRate)}</div>
                <Progress value={metrics.qualityMetrics.onTimeDeliveryRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alertas */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {metrics.performanceAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 border-l-${alert.type === 'success' ? 'green' : alert.type === 'warning' ? 'yellow' : alert.type === 'error' ? 'red' : 'blue'}-500`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.severity}
                          </Badge>
                          {alert.actionRequired && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200">
                              Requiere acción
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {alert.actionRequired && !alert.resolved && (
                        <Button size="sm" variant="outline">
                          Resolver
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => setSelectedAlert(alert.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Comparativas */}
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Comparación de Períodos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Órdenes Totales</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{metrics.periodComparisons.currentPeriod.totalOrders}</span>
                      <Badge variant={metrics.periodComparisons.growth.ordersGrowth > 0 ? 'default' : 'destructive'}>
                        {metrics.periodComparisons.growth.ordersGrowth > 0 ? '+' : ''}{metrics.periodComparisons.growth.ordersGrowth}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tiempo Promedio</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{formatTime(metrics.periodComparisons.currentPeriod.averageProcessingTime)}</span>
                      <Badge variant={metrics.periodComparisons.growth.timeImprovement > 0 ? 'default' : 'destructive'}>
                        {metrics.periodComparisons.growth.timeImprovement > 0 ? '+' : ''}{metrics.periodComparisons.growth.timeImprovement}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tasa de Completación</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{formatPercentage(metrics.periodComparisons.currentPeriod.completionRate)}</span>
                      <Badge variant={metrics.periodComparisons.growth.completionImprovement > 0 ? 'default' : 'destructive'}>
                        {metrics.periodComparisons.growth.completionImprovement > 0 ? '+' : ''}{metrics.periodComparisons.growth.completionImprovement}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ingresos</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{formatCurrency(metrics.periodComparisons.currentPeriod.revenue)}</span>
                      <Badge variant={metrics.periodComparisons.growth.revenueGrowth > 0 ? 'default' : 'destructive'}>
                        {metrics.periodComparisons.growth.revenueGrowth > 0 ? '+' : ''}{metrics.periodComparisons.growth.revenueGrowth}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalles del Período Anterior</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Órdenes Totales</span>
                    <span className="text-sm">{metrics.periodComparisons.previousPeriod.totalOrders}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tiempo Promedio</span>
                    <span className="text-sm">{formatTime(metrics.periodComparisons.previousPeriod.averageProcessingTime)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tasa de Completación</span>
                    <span className="text-sm">{formatPercentage(metrics.periodComparisons.previousPeriod.completionRate)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ingresos</span>
                    <span className="text-sm">{formatCurrency(metrics.periodComparisons.previousPeriod.revenue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* KPIs por Rol */}
        <TabsContent value="kpis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(metrics.roleKPIs).map(([role, kpis]) => (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {role}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Órdenes Procesadas</span>
                      <span className="text-sm font-bold">{kpis.ordersCreated || kpis.ordersProcessed || kpis.ordersPrepared || kpis.ordersCompleted}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tasa de Aprobación</span>
                      <span className="text-sm font-bold">{formatPercentage(kpis.approvalRate || kpis.completionRate || kpis.preparationAccuracy || kpis.qualityScore * 10)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tiempo Promedio</span>
                      <span className="text-sm font-bold">{formatTime(kpis.averageConfirmationTime || kpis.averageProcessingTime || kpis.averagePreparationTime || kpis.averageCompletionTime)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Puntuación</span>
                      <span className="text-sm font-bold">{kpis.customerSatisfaction || kpis.efficiencyScore || kpis.stockUtilization || kpis.customerFeedback}/10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalles de alerta */}
      <Dialog open={showAlertDetails} onOpenChange={setShowAlertDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Alerta</DialogTitle>
          </DialogHeader>
          {selectedAlert && metrics.performanceAlerts.find(a => a.id === selectedAlert) && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {getAlertIcon(metrics.performanceAlerts.find(a => a.id === selectedAlert)!.type)}
                <span className="font-semibold">
                  {metrics.performanceAlerts.find(a => a.id === selectedAlert)!.title}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.performanceAlerts.find(a => a.id === selectedAlert)!.message}
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant={metrics.performanceAlerts.find(a => a.id === selectedAlert)!.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {metrics.performanceAlerts.find(a => a.id === selectedAlert)!.severity}
                </Badge>
                {metrics.performanceAlerts.find(a => a.id === selectedAlert)!.actionRequired && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    Requiere acción
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(metrics.performanceAlerts.find(a => a.id === selectedAlert)!.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerformanceMetrics; 