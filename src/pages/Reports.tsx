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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity, 
  Target, 
  Zap, 
  Download, 
  Plus,
  Star,
  Building,
  Package,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  Mail,
  FileSpreadsheet,
  ChevronDown,
  Calendar,
  Filter,
  BarChart,
  PieChart,
  LineChart,
  Table,
  FileDown,
  Share2,
  Eye,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';

// Tipos para el dashboard de reportes
interface ReportData {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  employeePerformance: number;
  equipmentUtilization: number;
  inventoryTurnover: number;
}

interface NewReportData {
  name: string;
  description: string;
  type: string;
  period: string;
  departments: string[];
  includeCharts: boolean;
  includeTables: boolean;
  includeMetrics: boolean;
  recipients: string[];
}

const Reports = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    customerSatisfaction: 0,
    employeePerformance: 0,
    equipmentUtilization: 0,
    inventoryTurnover: 0
  });

  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [newReport, setNewReport] = useState<NewReportData>({
    name: '',
    description: '',
    type: 'financial',
    period: 'month',
    departments: [],
    includeCharts: true,
    includeTables: true,
    includeMetrics: true,
    recipients: []
  });

  useEffect(() => {
    // Datos simulados
    setReportData({
      totalOrders: 850,
      completedOrders: 722,
      pendingOrders: 102,
      cancelledOrders: 26,
      totalRevenue: 2350000,
      averageOrderValue: 2764,
      customerSatisfaction: 4.5,
      employeePerformance: 91,
      equipmentUtilization: 87,
      inventoryTurnover: 4.2
    });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const handleCreateReport = () => {
    console.log('Creando nuevo reporte:', newReport);
    // Aquí iría la lógica para crear el reporte
    setShowNewReportModal(false);
    setNewReport({
      name: '',
      description: '',
      type: 'financial',
      period: 'month',
      departments: [],
      includeCharts: true,
      includeTables: true,
      includeMetrics: true,
      recipients: []
    });
  };

  const handleExport = (format: string) => {
    console.log(`Exportando en formato: ${format}`);
    // Aquí iría la lógica de exportación
  };

  const reportTypes = [
    { value: 'financial', label: 'Financiero', icon: DollarSign },
    { value: 'operational', label: 'Operacional', icon: Activity },
    { value: 'customer', label: 'Clientes', icon: Users },
    { value: 'equipment', label: 'Equipos', icon: Package },
    { value: 'department', label: 'Departamentos', icon: Building },
    { value: 'custom', label: 'Personalizado', icon: Settings }
  ];

  const periods = [
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este año' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const departments = [
    'Cardiología',
    'Endoscopía',
    'Ortopedia',
    'Neurología',
    'Pediatría',
    'Radiología',
    'Laboratorio',
    'Farmacia'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes</h1>
          <p className="text-gray-600">Análisis y estadísticas del sistema</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Menú de Exportación */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
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

          {/* Modal de Nuevo Reporte */}
          <Dialog open={showNewReportModal} onOpenChange={setShowNewReportModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Reporte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Crear Nuevo Reporte
                </DialogTitle>
                <DialogDescription>
                  Configura los parámetros para generar un nuevo reporte personalizado.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información Básica</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre del Reporte</label>
                    <input
                      type="text"
                      value={newReport.name}
                      onChange={(e) => setNewReport({...newReport, name: e.target.value})}
                      placeholder="Ej: Reporte Financiero Mensual"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea
                      value={newReport.description}
                      onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                      placeholder="Describe el propósito y contenido del reporte..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Tipo de Reporte */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tipo de Reporte</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {reportTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          newReport.type === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setNewReport({...newReport, type: type.value})}
                      >
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Período */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Período de Análisis</h3>
                  <Select value={newReport.period} onValueChange={(value) => setNewReport({...newReport, period: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el período" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Departamentos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Departamentos a Incluir</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {departments.map((dept) => (
                      <label key={dept} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newReport.departments.includes(dept)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewReport({
                                ...newReport,
                                departments: [...newReport.departments, dept]
                              });
                            } else {
                              setNewReport({
                                ...newReport,
                                departments: newReport.departments.filter(d => d !== dept)
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{dept}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Elementos a Incluir */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Elementos a Incluir</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newReport.includeCharts}
                        onChange={(e) => setNewReport({...newReport, includeCharts: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <BarChart className="h-4 w-4" />
                      <span>Gráficas y visualizaciones</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newReport.includeTables}
                        onChange={(e) => setNewReport({...newReport, includeTables: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Table className="h-4 w-4" />
                      <span>Tablas de datos detalladas</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newReport.includeMetrics}
                        onChange={(e) => setNewReport({...newReport, includeMetrics: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Target className="h-4 w-4" />
                      <span>Métricas y KPIs</span>
                    </label>
                  </div>
                </div>

                {/* Destinatarios */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Destinatarios (Opcional)</h3>
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="Agregar email de destinatario..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          setNewReport({
                            ...newReport,
                            recipients: [...newReport.recipients, e.currentTarget.value]
                          });
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    {newReport.recipients.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newReport.recipients.map((email, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {email}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => setNewReport({
                                ...newReport,
                                recipients: newReport.recipients.filter((_, i) => i !== index)
                              })}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewReportModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateReport} disabled={!newReport.name}>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Reporte
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Órdenes</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{reportData.totalOrders}</div>
            <p className="text-xs text-blue-700 mt-1">
              {reportData.completedOrders} completadas
            </p>
            <Progress value={(reportData.completedOrders / reportData.totalOrders) * 100} className="mt-2 bg-blue-200" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(reportData.totalRevenue)}</div>
            <p className="text-xs text-green-700 mt-1">
              Promedio: {formatCurrency(reportData.averageOrderValue)}
            </p>
            <Progress value={85} className="mt-2 bg-green-200" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Satisfacción</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{reportData.customerSatisfaction.toFixed(1)}/5.0</div>
            <p className="text-xs text-purple-700 mt-1">
              {reportData.employeePerformance.toFixed(0)}% rendimiento
            </p>
            <Progress value={reportData.customerSatisfaction * 20} className="mt-2 bg-purple-200" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Utilización</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{reportData.equipmentUtilization}%</div>
            <p className="text-xs text-orange-700 mt-1">
              Rotación: {reportData.inventoryTurnover}x
            </p>
            <Progress value={reportData.equipmentUtilization} className="mt-2 bg-orange-200" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs con Diferentes Reportes */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="equipment">Equipos</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumen General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Órdenes Completadas</span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">{reportData.completedOrders}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Órdenes Pendientes</span>
                    </div>
                    <span className="text-sm font-medium text-yellow-600">{reportData.pendingOrders}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Órdenes Canceladas</span>
                    </div>
                    <span className="text-sm font-medium text-red-600">{reportData.cancelledOrders}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Crecimiento</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">+12.5%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Satisfacción</span>
                    </div>
                    <span className="text-sm font-medium text-purple-600">{reportData.customerSatisfaction.toFixed(1)}/5.0</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Eficiencia</span>
                    </div>
                    <span className="text-sm font-medium text-orange-600">{reportData.employeePerformance}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Departamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Cardiología', orders: 25, revenue: 85000, efficiency: 92 },
                  { name: 'Endoscopía', orders: 18, revenue: 62000, efficiency: 88 },
                  { name: 'Ortopedia', orders: 15, revenue: 52000, efficiency: 85 },
                  { name: 'Neurología', orders: 12, revenue: 41000, efficiency: 90 },
                  { name: 'Pediatría', orders: 10, revenue: 35000, efficiency: 87 }
                ].map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {dept.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{dept.name}</p>
                        <p className="text-xs text-gray-500">{dept.orders} órdenes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(dept.revenue)}</p>
                      <Badge className={dept.efficiency >= 90 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {dept.efficiency}% eficiencia
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Equipos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Monitor Cardíaco', utilization: 95, revenue: 45000, status: 'excellent' },
                  { name: 'Endoscopio Olympus', utilization: 88, revenue: 38000, status: 'good' },
                  { name: 'Equipo de Rayos X', utilization: 82, revenue: 32000, status: 'good' },
                  { name: 'Monitor Quirúrgico', utilization: 90, revenue: 41000, status: 'excellent' },
                  { name: 'Bisturí Eléctrico', utilization: 75, revenue: 28000, status: 'fair' }
                ].map((equip, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {equip.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{equip.name}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(equip.revenue)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{equip.utilization}%</p>
                      <Badge className={
                        equip.status === 'excellent' ? 'bg-green-100 text-green-800' :
                        equip.status === 'good' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {equip.status === 'excellent' ? 'Excelente' : 
                         equip.status === 'good' ? 'Bueno' : 'Regular'}
                      </Badge>
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
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Hospital General', orders: 15, totalSpent: 125000, satisfaction: 4.7, status: 'premium' },
                  { name: 'Clínica Santa María', orders: 12, totalSpent: 89000, satisfaction: 4.5, status: 'premium' },
                  { name: 'Centro Médico ABC', orders: 8, totalSpent: 67000, satisfaction: 4.3, status: 'regular' },
                  { name: 'Hospital San José', orders: 6, totalSpent: 45000, satisfaction: 4.1, status: 'regular' },
                  { name: 'Clínica del Norte', orders: 10, totalSpent: 78000, satisfaction: 4.6, status: 'premium' }
                ].map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
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
                        <p className="text-xs text-gray-500">{customer.satisfaction.toFixed(1)}/5.0</p>
                      </div>
                      <Badge className={
                        customer.status === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }>
                        {customer.status === 'premium' ? 'Premium' : 'Regular'}
                      </Badge>
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
                  <Target className="h-5 w-5" />
                  KPIs Principales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tasa de Completación</span>
                    <span className="font-medium">85.2%</span>
                  </div>
                  <Progress value={85.2} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Satisfacción del Cliente</span>
                    <span className="font-medium">4.5/5.0</span>
                  </div>
                  <Progress value={90} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Eficiencia Operativa</span>
                    <span className="font-medium">87.8%</span>
                  </div>
                  <Progress value={87.8} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Utilización de Equipos</span>
                    <span className="font-medium">91.3%</span>
                  </div>
                  <Progress value={91.3} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Crecimiento de Órdenes</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">+12.5%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Incremento de Ingresos</span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">+8.7%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Satisfacción</span>
                    </div>
                    <span className="text-sm font-medium text-purple-600">+2.1%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Eficiencia</span>
                    </div>
                    <span className="text-sm font-medium text-orange-600">+5.3%</span>
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
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">Reporte PDF</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <FileSpreadsheet className="h-6 w-6 mb-2" />
              <span className="text-sm">Exportar Excel</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Mail className="h-6 w-6 mb-2" />
              <span className="text-sm">Enviar por Email</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-6 w-6 mb-2" />
              <span className="text-sm">Configurar</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports; 