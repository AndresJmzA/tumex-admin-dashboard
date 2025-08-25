import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Download, 
  FileText, 
  Edit, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Printer,
  FileSpreadsheet,
  ArrowRight,
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  CheckSquare,
  Square
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ExtendedOrder } from '@/services/orderService';

interface WarehouseOrder {
  id: string;
  orderNumber: string;
  customer: string;
  doctor: string;
  surgery: string;
  surgeryDate: string;
  surgeryTime: string;
  surgeryLocation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'in_preparation' | 'ready' | 'delivered';
  estimatedValue: number;
  equipmentList: OrderEquipment[];
  preparationDeadline: string;
  notes?: string;
  assignedTo?: string;
}

interface OrderEquipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  notes?: string;
  confirmed: boolean;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'maintenance';
  location: string;
}

interface WarehouseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: WarehouseOrder | null;
  onUpdateStatus?: (orderId: string, newStatus: string) => Promise<void>;
  onEditEquipment?: (orderId: string) => void;
  onDownloadTemplate?: (orderId: string, format: 'pdf' | 'excel') => Promise<void>;
}

export const WarehouseOrderModal: React.FC<WarehouseOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onUpdateStatus,
  onEditEquipment,
  onDownloadTemplate
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!order) return null;

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      in_preparation: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      in_preparation: 'En Preparación',
      ready: 'Lista para Recoger',
      delivered: 'Entregada'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica'
    };
    return labels[priority] || priority;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Consumible': 'bg-green-100 text-green-800 border-green-200',
      'Instrumental': 'bg-blue-100 text-blue-800 border-blue-200',
      'Equipo': 'bg-purple-100 text-purple-800 border-purple-200',
      'Accesorio': 'bg-pink-100 text-pink-800 border-pink-200',
      'Dispositivo': 'bg-orange-100 text-orange-800 border-orange-200',
      'Endoscopio': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Cable/Conector': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadTemplate = async (format: 'pdf' | 'excel') => {
    if (!onDownloadTemplate) return;
    
    try {
      setIsLoading(true);
      await onDownloadTemplate(order.id, format);
      toast({
        title: "✅ Plantilla Descargada",
        description: `La plantilla se ha descargado en formato ${format.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo descargar la plantilla. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsReady = async () => {
    if (!onUpdateStatus) return;
    
    try {
      setIsLoading(true);
      await onUpdateStatus(order.id, 'ready');
      toast({
        title: "✅ Orden Marcada como Lista",
        description: "La orden ha sido marcada como lista para recoger.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar el estado de la orden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEquipment = () => {
    if (onEditEquipment) {
      onEditEquipment(order.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Orden en Preparación - {order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            Gestiona la preparación de equipos para esta orden de cirugía.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la Orden */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Información de la Orden
                </span>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(order.priority)}>
                    {getPriorityLabel(order.priority)}
                  </Badge>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Paciente:</span>
                    <span className="text-sm">{order.customer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Doctor:</span>
                    <span className="text-sm">{order.doctor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Cirugía:</span>
                    <span className="text-sm">{order.surgery}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Fecha:</span>
                    <span className="text-sm">{formatDate(order.surgeryDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Hora:</span>
                    <span className="text-sm">{formatTime(order.surgeryTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Ubicación:</span>
                    <span className="text-sm">{order.surgeryLocation}</span>
                  </div>
                </div>
              </div>
              
              {order.assignedTo && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Asignado a: {order.assignedTo}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Equipos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Equipos Requeridos ({order.equipmentList.length})
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditEquipment}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.equipmentList.map((equipment) => (
                  <div key={equipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{equipment.name}</span>
                        <Badge variant="outline" className={getCategoryColor(equipment.category)}>
                          {equipment.category}
                        </Badge>
                        {equipment.confirmed && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Confirmado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>Cantidad: {equipment.quantity}</span>
                        <span>Precio: {formatCurrency(equipment.price)}</span>
                        <span>Total: {formatCurrency(equipment.price * equipment.quantity)}</span>
                        <span>Ubicación: {equipment.location}</span>
                      </div>
                      {equipment.notes && (
                        <p className="text-xs text-gray-500 mt-1">Notas: {equipment.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {equipment.status === 'available' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : equipment.status === 'low_stock' ? (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Acciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Descargar Plantillas */}
                <div>
                  <h4 className="font-medium mb-2">Descargar Plantilla</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadTemplate('pdf')}
                      disabled={isLoading}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadTemplate('excel')}
                      disabled={isLoading}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Descargar Excel
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Marcar como Lista */}
                {order.status === 'in_preparation' && (
                  <div>
                    <h4 className="font-medium mb-2">Finalizar Preparación</h4>
                    <Button
                      onClick={handleMarkAsReady}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Lista para Recoger
                    </Button>
                  </div>
                )}

                {order.status === 'ready' && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Esta orden está lista para ser recogida por el área operativa.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumen */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span>Equipos: {order.equipmentList.length}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>Confirmados: {order.equipmentList.filter(eq => eq.confirmed).length}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>Pendientes: {order.equipmentList.filter(eq => !eq.confirmed).length}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(order.estimatedValue)}
                  </div>
                  <div className="text-sm text-gray-500">Valor Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 