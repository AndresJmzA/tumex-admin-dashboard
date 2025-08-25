import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  User, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Package,
  MapPin,
  PhoneCall,
  MessageCircle,
  History,
  BarChart3,
  Users,
  Target,
  Award,
  Star,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Zap,
  Shield,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  User as UserIcon,
  Building,
  Phone as PhoneIcon,
  Mail as MailIcon,
  MessageSquare as MessageSquareIcon
} from 'lucide-react';
import { ExtendedOrder } from '@/services/orderService';
import { OrderStateTransition } from './OrderStateTransition';
import { DoctorConfirmationModal } from './DoctorConfirmationModal';

interface CommercialOrderCardProps {
  order: ExtendedOrder;
  onUpdate?: (updatedOrder: ExtendedOrder) => void;
  showActions?: boolean;
  variant?: 'compact' | 'detailed' | 'full';
}

interface InteractionHistory {
  id: string;
  type: 'call' | 'email' | 'whatsapp' | 'meeting';
  date: string;
  duration?: number; // en minutos
  outcome: 'positive' | 'neutral' | 'negative';
  notes: string;
  doctorName: string;
  doctorPhone?: string;
  doctorEmail?: string;
}

interface SalesMetrics {
  conversionRate: number;
  averageOrderValue: number;
  totalRevenue: number;
  pendingConfirmations: number;
  confirmedOrders: number;
  rejectedOrders: number;
}

const CommercialOrderCard: React.FC<CommercialOrderCardProps> = ({
  order,
  onUpdate,
  showActions = true,
  variant = 'detailed'
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showInteractionHistory, setShowInteractionHistory] = useState(false);

  // Mock data para interacciones con médicos
  const interactionHistory: InteractionHistory[] = [
    {
      id: '1',
      type: 'call',
      date: '2024-01-15T10:30:00Z',
      duration: 15,
      outcome: 'positive',
      notes: 'Confirmación de equipos requeridos. Dr. García confirmó lista completa.',
      doctorName: 'Dr. Carlos García',
      doctorPhone: '+52 55 1234 5678',
      doctorEmail: 'dr.garcia@hospital.com'
    },
    {
      id: '2',
      type: 'whatsapp',
      date: '2024-01-14T16:45:00Z',
      duration: 5,
      outcome: 'neutral',
      notes: 'Envío de cotización por WhatsApp. Pendiente de respuesta.',
      doctorName: 'Dr. Carlos García',
      doctorPhone: '+52 55 1234 5678'
    },
    {
      id: '3',
      type: 'email',
      date: '2024-01-13T09:15:00Z',
      outcome: 'positive',
      notes: 'Envío de catálogo actualizado. Dr. García mostró interés en nuevos equipos.',
      doctorName: 'Dr. Carlos García',
      doctorEmail: 'dr.garcia@hospital.com'
    }
  ];

  // Mock métricas de venta
  const salesMetrics: SalesMetrics = {
    conversionRate: 78.5,
    averageOrderValue: 45000,
    totalRevenue: 225000,
    pendingConfirmations: 3,
    confirmedOrders: 12,
    rejectedOrders: 2
  };

  // Obtener estado de confirmación médica
  const getMedicalConfirmationStatus = () => {
    switch (order.status) {
      case 'doctor_confirmation':
        return { status: 'pending', label: 'Pendiente Confirmación', color: 'bg-yellow-100 text-yellow-800' };
      case 'doctor_approved':
        return { status: 'approved', label: 'Confirmada por Médico', color: 'bg-green-100 text-green-800' };
      case 'doctor_rejected':
        return { status: 'rejected', label: 'Rechazada por Médico', color: 'bg-red-100 text-red-800' };
      default:
        return { status: 'not_started', label: 'No Iniciada', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Calcular valor total de la orden
  const calculateOrderValue = () => {
    return order.products?.reduce((total, product) => total + (product.price * product.quantity), 0) || 0;
  };

  // Obtener última interacción
  const getLastInteraction = () => {
    return interactionHistory.length > 0 ? interactionHistory[0] : null;
  };

  // Obtener icono del tipo de interacción
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneCall className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'meeting':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  // Obtener color del resultado de interacción
  const getInteractionOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'positive':
        return 'text-green-600';
      case 'neutral':
        return 'text-yellow-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const confirmationStatus = getMedicalConfirmationStatus();
  const orderValue = calculateOrderValue();
  const lastInteraction = getLastInteraction();

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetails(true)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-medium">{order.patientName}</span>
                <span className="text-sm text-gray-600">{order.orderId}</span>
              </div>
              <Badge className={confirmationStatus.color}>
                {confirmationStatus.label}
              </Badge>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatCurrency(orderValue)}</div>
              <div className="text-sm text-gray-600">
                {new Date(order.surgeryDate).toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Orden {order.orderId}
              <Badge className={confirmationStatus.color}>
                {confirmationStatus.label}
              </Badge>
            </CardTitle>
            {showActions && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInteractionHistory(true)}
                >
                  <History className="h-4 w-4 mr-2" />
                  Historial
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(true)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Paciente:</span>
                <span>{order.patientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Hospital:</span>
                <span>{order.doctorInfo?.doctorName || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Fecha:</span>
                <span>{new Date(order.surgeryDate).toLocaleDateString('es-ES')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSignIcon className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Valor:</span>
                <span className="font-semibold text-green-600">{formatCurrency(orderValue)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Equipos:</span>
                <span>{order.itemsCount} items</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Ubicación:</span>
                <span>{order.surgeryLocation}</span>
              </div>
            </div>
          </div>

          {/* Información del médico */}
          {order.doctorInfo && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Información del Médico
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{order.doctorInfo.doctorName}</span>
                </div>
                {order.doctorInfo.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{order.doctorInfo.phone}</span>
                  </div>
                )}
                {order.doctorInfo.email && (
                  <div className="flex items-center gap-2">
                    <MailIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{order.doctorInfo.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Última interacción */}
          {lastInteraction && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MessageSquareIcon className="h-4 w-4" />
                Última Interacción
              </h4>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getInteractionIcon(lastInteraction.type)}
                  <div>
                    <div className="font-medium text-sm">{lastInteraction.doctorName}</div>
                    <div className="text-xs text-gray-600">
                      {formatDate(lastInteraction.date)}
                      {lastInteraction.duration && ` • ${lastInteraction.duration} min`}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${getInteractionOutcomeColor(lastInteraction.outcome)}`}>
                  {lastInteraction.outcome === 'positive' ? 'Positiva' : 
                   lastInteraction.outcome === 'neutral' ? 'Neutral' : 'Negativa'}
                </div>
              </div>
            </div>
          )}

          {/* Acciones rápidas */}
          {showActions && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Acciones Rápidas</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowConfirmationModal(true)}
                  disabled={order.status === 'doctor_approved' || order.status === 'doctor_rejected'}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contactar Médico
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Cotización
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles completos */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Detalles Completos - Orden {order.orderId}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="interactions">Interacciones</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="actions">Acciones</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información de la orden */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información de la Orden</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Paciente:</span>
                        <p className="text-gray-600">{order.patientName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Orden ID:</span>
                        <p className="text-gray-600">{order.orderId}</p>
                      </div>
                      <div>
                        <span className="font-medium">Fecha Cirugía:</span>
                        <p className="text-gray-600">
                          {new Date(order.surgeryDate).toLocaleDateString('es-ES')} a las {order.surgeryTime}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Ubicación:</span>
                        <p className="text-gray-600">{order.surgeryLocation}</p>
                      </div>
                      <div>
                        <span className="font-medium">Cobertura:</span>
                        <p className="text-gray-600">{order.typeOfCoverage}</p>
                      </div>
                      <div>
                        <span className="font-medium">Valor Total:</span>
                        <p className="text-gray-600 font-semibold">{formatCurrency(orderValue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Información del médico */}
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Médico</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.doctorInfo ? (
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium">Nombre:</span>
                          <p className="text-gray-600">{order.doctorInfo.doctorName}</p>
                        </div>
                        {order.doctorInfo.phone && (
                          <div>
                            <span className="font-medium">Teléfono:</span>
                            <p className="text-gray-600">{order.doctorInfo.phone}</p>
                          </div>
                        )}
                        {order.doctorInfo.email && (
                          <div>
                            <span className="font-medium">Email:</span>
                            <p className="text-gray-600">{order.doctorInfo.email}</p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button size="sm">
                            <Phone className="h-4 w-4 mr-2" />
                            Llamar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No hay información del médico disponible</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Lista de productos */}
              <Card>
                <CardHeader>
                  <CardTitle>Equipos Solicitados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.products?.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">x{product.quantity}</div>
                          <div className="text-sm text-gray-600">{formatCurrency(product.price)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interactions" className="space-y-4">
              <div className="space-y-3">
                {interactionHistory.map((interaction) => (
                  <Card key={interaction.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getInteractionIcon(interaction.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{interaction.doctorName}</span>
                            <Badge className={getInteractionOutcomeColor(interaction.outcome)}>
                              {interaction.outcome === 'positive' ? 'Positiva' : 
                               interaction.outcome === 'neutral' ? 'Neutral' : 'Negativa'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            {formatDate(interaction.date)}
                            {interaction.duration && ` • ${interaction.duration} minutos`}
                          </div>
                          <p className="text-sm">{interaction.notes}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Tasa de Conversión</p>
                        <p className="text-2xl font-bold">{salesMetrics.conversionRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Valor Promedio</p>
                        <p className="text-2xl font-bold">{formatCurrency(salesMetrics.averageOrderValue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Órdenes Confirmadas</p>
                        <p className="text-2xl font-bold">{salesMetrics.confirmedOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Pendientes</p>
                        <p className="text-2xl font-bold">{salesMetrics.pendingConfirmations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones de Confirmación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full" 
                      onClick={() => setShowConfirmationModal(true)}
                      disabled={order.status === 'doctor_approved' || order.status === 'doctor_rejected'}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Iniciar Confirmación Médica
                    </Button>
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Generar Cotización
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Propuesta
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Comunicación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar al Médico
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Enviar WhatsApp
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Email
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación médica */}
      <DoctorConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        order={order}
        onConfirm={(updatedOrder) => {
          if (onUpdate) onUpdate(updatedOrder);
          setShowConfirmationModal(false);
        }}
      />

      {/* Modal de historial de interacciones */}
      <Dialog open={showInteractionHistory} onOpenChange={setShowInteractionHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Interacciones
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {interactionHistory.map((interaction) => (
              <Card key={interaction.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getInteractionIcon(interaction.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{interaction.doctorName}</span>
                        <Badge className={getInteractionOutcomeColor(interaction.outcome)}>
                          {interaction.outcome === 'positive' ? 'Positiva' : 
                           interaction.outcome === 'neutral' ? 'Neutral' : 'Negativa'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {formatDate(interaction.date)}
                        {interaction.duration && ` • ${interaction.duration} minutos`}
                      </div>
                      <p className="text-sm">{interaction.notes}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommercialOrderCard; 