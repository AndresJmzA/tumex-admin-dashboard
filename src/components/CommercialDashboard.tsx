import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Calendar,
  User,
  Target,
  BarChart3,
  Bell,
  ArrowRight,
  Eye,
  Edit,
  Phone,
  PhoneCall,
  PhoneOff,
  MessageSquare,
  Search,
  Filter,
  Users,
  Hospital,
  Stethoscope,
  Activity,
  Timer,
  CheckSquare,
  X,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ConditionalContent } from '@/components/PermissionGuard';
import NewOrderModal from '@/components/NewOrderModal';
import { useCommercialDashboard } from '@/hooks/useCommercialDashboard';
import { 
  CommercialStats, 
  RecentOrder, 
  Notification, 
  CallHistory, 
  ConfirmationMetrics, 
  Doctor 
} from '@/services/commercialDashboardService';

// Los tipos ahora se importan desde el servicio

const CommercialDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Usar el hook para obtener datos del dashboard
  const {
    stats,
    recentOrders,
    notifications,
    callHistory,
    confirmationMetrics,
    doctors,
    isLoading,
    error,
    refreshData,
    refreshStats,
    refreshOrders,
    refreshNotifications,
    refreshCallHistory,
    refreshMetrics,
    refreshDoctors
  } = useCommercialDashboard();
  
  // Estados para filtros y búsqueda
  const [activeTab, setActiveTab] = useState('overview');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [hospitalFilter, setHospitalFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para el modal de nueva orden
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Los datos ahora se cargan automáticamente desde el hook useCommercialDashboard

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmada';
      case 'rejected': return 'Rechazada';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'confirmation_pending': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'order_confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'order_rejected': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'payment_received': return <DollarSign className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funciones para confirmaciones médicas
  const handleCallDoctor = (doctorId: string, orderId: string) => {
    console.log('Llamando al doctor:', doctorId, 'para orden:', orderId);
    // TODO: Implementar integración con sistema de llamadas
  };

  const handleScheduleCall = (doctorId: string, orderId: string, date: string) => {
    console.log('Programando llamada para:', doctorId, 'fecha:', date);
    // TODO: Implementar programación de llamadas
  };

  const handleConfirmOrder = (orderId: string) => {
    console.log('Confirmando orden:', orderId);
    // TODO: Implementar confirmación de orden
  };

  const handleRejectOrder = (orderId: string) => {
    console.log('Rechazando orden:', orderId);
    // TODO: Implementar rechazo de orden
  };

  // Filtrar datos
  const filteredCallHistory = callHistory.filter(call => {
    const matchesSearch = call.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDoctor = doctorFilter === 'all' || call.doctorName === doctorFilter;
    const matchesHospital = hospitalFilter === 'all' || call.hospital === hospitalFilter;
    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    
    return matchesSearch && matchesDoctor && matchesHospital && matchesStatus;
  });

  const getCallStatusIcon = (status: string) => {
    switch (status) {
      case 'answered': return <PhoneCall className="h-4 w-4 text-green-600" />;
      case 'no_answer': return <PhoneOff className="h-4 w-4 text-red-600" />;
      case 'busy': return <Phone className="h-4 w-4 text-yellow-600" />;
      case 'voicemail': return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'scheduled': return <Calendar className="h-4 w-4 text-purple-600" />;
      default: return <Phone className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-800';
      case 'no_answer': return 'bg-red-100 text-red-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'voicemail': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Funciones para manejar el modal de nueva orden
  const handleOpenNewOrder = () => {
    setIsNewOrderModalOpen(true);
  };

  const handleCloseNewOrder = () => {
    setIsNewOrderModalOpen(false);
  };

  const handleSubmitNewOrder = async (orderData: any) => {
    console.log('Creando nueva orden desde CommercialDashboard:', orderData);
    // TODO: Implementar lógica para crear la orden
    setIsNewOrderModalOpen(false);
    // Recargar datos del dashboard
    await refreshData();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-tumex-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando datos del dashboard...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Acción Rápida */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Comercial
          </h1>
          <p className="text-gray-600">
            Bienvenido, {user?.email}. Aquí tienes un resumen de tus actividades comerciales.
          </p>
          {error && (
            <Alert className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
          
          <ConditionalContent requiredPermissions={['orders:create']}>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleOpenNewOrder}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          </ConditionalContent>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Órdenes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        {/* Pendientes de Confirmación */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes Confirmación</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingConfirmation}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención
            </p>
          </CardContent>
        </Card>

        {/* Ingresos Mensuales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.monthlyGrowth > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(stats.monthlyGrowth)}% vs mes anterior
            </div>
          </CardContent>
        </Card>

        {/* Tasa de Conversión */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <Progress value={stats.conversionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Órdenes confirmadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar órdenes, doctores, hospitales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los doctores</SelectItem>
              {doctors.map(doctor => (
                <SelectItem key={doctor.id} value={doctor.name}>{doctor.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Hospital" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los hospitales</SelectItem>
              <SelectItem value="Hospital General">Hospital General</SelectItem>
              <SelectItem value="Clínica Santa María">Clínica Santa María</SelectItem>
              <SelectItem value="Centro Médico ABC">Centro Médico ABC</SelectItem>
              <SelectItem value="Hospital San José">Hospital San José</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="answered">Contestó</SelectItem>
              <SelectItem value="no_answer">No contestó</SelectItem>
              <SelectItem value="busy">Ocupado</SelectItem>
              <SelectItem value="voicemail">Buzón de voz</SelectItem>
              <SelectItem value="scheduled">Programado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filteredCallHistory.length} llamadas</Badge>
          <Badge variant="destructive">{confirmationMetrics.pendingConfirmations} pendientes</Badge>
        </div>
      </div>

      {/* Contenido Principal con Pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="confirmations">Confirmaciones</TabsTrigger>
          <TabsTrigger value="calls">Historial Llamadas</TabsTrigger>
          <TabsTrigger value="doctors">Doctores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Órdenes Recientes */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Últimas 3 Órdenes
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {recentOrders.length}/3
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/orders'}>
                      Ver todas
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-sm">{order.id}</span>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusLabel(order.status)}
                              </Badge>
                              {order.requiresConfirmation && (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Conf. Pendiente
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{order.patientName}</span>
                              <span className="mx-2">•</span>
                              <span>Fecha de cirugía: {formatDate(order.surgeryDate)}</span>
                              {order.surgeryType && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Cirugía: {order.surgeryType}</span>
                                </>
                              )}
                              {order.procedureName && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Procedimiento: {order.procedureName}</span>
                                </>
                              )}
                              {order.doctorName && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Doctor: {order.doctorName}</span>
                                </>
                              )}
                              <span className="mx-2">•</span>
                              <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Creada:</span> {formatDateTime(order.createdAt)}
                              <span className="mx-2">•</span>
                              <span className="text-blue-600 font-medium">Más reciente</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ConditionalContent requiredPermissions={['orders:read']}>
                              <Button variant="outline" size="sm" onClick={() => navigate('/orders', { state: { highlightOrderId: order.id } })}>
                                Ver orden
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </ConditionalContent>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No hay órdenes recientes</p>
                        <p className="text-sm">Las órdenes aparecerán aquí cuando se creen</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notificaciones */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notificaciones
                    </CardTitle>
                    <Badge variant="outline">
                      {notifications.filter(n => !n.read).length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="text-xs text-gray-500">
                              {formatDateTime(notification.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas Adicionales */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Estadísticas Adicionales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Valor promedio por orden</span>
                    <span className="font-medium">{formatCurrency(stats.averageOrderValue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Órdenes confirmadas</span>
                    <span className="font-medium text-green-600">{stats.confirmedOrders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Eficiencia comercial</span>
                    <span className="font-medium text-blue-600">{stats.conversionRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="confirmations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de Confirmación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Métricas de Confirmación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{confirmationMetrics.confirmationRate}%</div>
                      <p className="text-xs text-gray-600">Tasa de confirmación</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{confirmationMetrics.averageResponseTime}h</div>
                      <p className="text-xs text-gray-600">Tiempo promedio respuesta</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Llamadas totales</span>
                      <span className="font-medium">{confirmationMetrics.totalCalls}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Llamadas contestadas</span>
                      <span className="font-medium text-green-600">{confirmationMetrics.answeredCalls}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confirmaciones pendientes</span>
                      <span className="font-medium text-yellow-600">{confirmationMetrics.pendingConfirmations}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Confirmadas hoy</span>
                      <span className="font-medium text-green-600">{confirmationMetrics.confirmedToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rechazadas hoy</span>
                      <span className="font-medium text-red-600">{confirmationMetrics.rejectedToday}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Órdenes Pendientes de Confirmación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pendientes de Confirmación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.filter(order => order.requiresConfirmation).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{order.id}</span>
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Conf. Pendiente
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{order.patientName}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.surgeryDate)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleConfirmOrder(order.id)}>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectOrder(order.id)}>
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Historial de Llamadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCallHistory.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      {getCallStatusIcon(call.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-sm">{call.orderId}</span>
                          <Badge className={getCallStatusColor(call.status)}>
                            {call.status.replace('_', ' ')}
                          </Badge>
                          {call.followUpRequired && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              Seguimiento
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{call.doctorName}</p>
                        <p className="text-xs text-gray-500">{call.hospital}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(call.callDate)} • {call.callTime} • {call.duration}
                        </p>
                        {call.notes && (
                          <p className="text-xs text-gray-600 mt-1">{call.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCallDoctor('1', call.orderId)}>
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Doctores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Doctores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {doctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{doctor.name}</span>
                          <Badge variant="outline">{doctor.specialty}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{doctor.hospital}</p>
                        <p className="text-xs text-gray-500">{doctor.phone}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">Respuesta: {doctor.responseRate}%</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">Preferido: {doctor.preferredContact}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleCallDoctor(doctor.id, '')}>
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas por Doctor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estadísticas por Doctor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(confirmationMetrics.callsByDoctor).map(([doctor, calls]) => (
                    <div key={doctor} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{doctor}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{calls} llamadas</span>
                        <Progress value={(calls / confirmationMetrics.totalCalls) * 100} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Nueva Orden */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={handleCloseNewOrder}
        onSubmit={handleSubmitNewOrder}
      />
    </div>
  );
};

export default CommercialDashboard; 