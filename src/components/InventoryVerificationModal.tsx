import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Package, AlertTriangle, CheckCircle, XCircle, Eye, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';

// Tipos para el modal de verificación de inventario
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  location: string;
  lastUpdated: string;
  supplier: string;
  nextDelivery?: string;
  status: 'excellent' | 'good' | 'low' | 'critical' | 'out_of_stock';
}

interface InventoryVerification {
  orderId: string;
  verifiedItems: Array<{
    itemId: string;
    verified: boolean;
    notes: string;
    verifiedBy: string;
    verifiedAt: string;
  }>;
  overallStatus: 'ready' | 'partial' | 'not_ready';
  verificationNotes: string;
}

interface InventoryVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    customer: string;
    patientName: string;
    surgery: string;
    date: string;
    time: string;
    equipment: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
    }>;
  };
  onVerify: (verification: InventoryVerification) => void;
}

// Datos mock de inventario
const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Monitor Multiparamétrico',
    category: 'Monitoreo',
    currentStock: 15,
    minStock: 5,
    maxStock: 20,
    reservedStock: 3,
    availableStock: 12,
    location: 'Almacén A - Estante 1',
    lastUpdated: '2024-01-15T10:30:00Z',
    supplier: 'MedEquip S.A.',
    status: 'excellent'
  },
  {
    id: '2',
    name: 'Bomba de Infusión',
    category: 'Infusión',
    currentStock: 8,
    minStock: 10,
    maxStock: 25,
    reservedStock: 2,
    availableStock: 6,
    location: 'Almacén B - Estante 3',
    lastUpdated: '2024-01-14T16:45:00Z',
    supplier: 'InfusionTech',
    nextDelivery: '2024-01-20',
    status: 'low'
  },
  {
    id: '3',
    name: 'Desfibrilador',
    category: 'Emergencia',
    currentStock: 3,
    minStock: 5,
    maxStock: 15,
    reservedStock: 1,
    availableStock: 2,
    location: 'Almacén A - Estante 2',
    lastUpdated: '2024-01-13T09:15:00Z',
    supplier: 'EmergencyMed',
    status: 'critical'
  },
  {
    id: '4',
    name: 'Ventilador Mecánico',
    category: 'Respiración',
    currentStock: 12,
    minStock: 8,
    maxStock: 20,
    reservedStock: 4,
    availableStock: 8,
    location: 'Almacén C - Estante 1',
    lastUpdated: '2024-01-15T11:20:00Z',
    supplier: 'RespTech',
    status: 'good'
  },
  {
    id: '5',
    name: 'Lámpara Quirúrgica',
    category: 'Iluminación',
    currentStock: 0,
    minStock: 3,
    maxStock: 10,
    reservedStock: 0,
    availableStock: 0,
    location: 'Almacén B - Estante 4',
    lastUpdated: '2024-01-12T14:30:00Z',
    supplier: 'LightMed',
    nextDelivery: '2024-01-18',
    status: 'out_of_stock'
  }
];

const InventoryVerificationModal: React.FC<InventoryVerificationModalProps> = ({
  isOpen,
  onClose,
  order,
  onVerify
}) => {
  const [verifiedItems, setVerifiedItems] = useState<Array<{
    itemId: string;
    verified: boolean;
    notes: string;
  }>>([]);
  const [verificationNotes, setVerificationNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Obtener color de estado del inventario
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-orange-100 text-orange-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener icono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'out_of_stock': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  // Obtener texto de estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bueno';
      case 'low': return 'Bajo';
      case 'critical': return 'Crítico';
      case 'out_of_stock': return 'Sin Stock';
      default: return 'Desconocido';
    }
  };

  // Calcular porcentaje de stock
  const calculateStockPercentage = (item: InventoryItem) => {
    return (item.currentStock / item.maxStock) * 100;
  };

  // Verificar si un item está disponible para la orden
  const isItemAvailable = (item: InventoryItem, requiredQuantity: number) => {
    return item.availableStock >= requiredQuantity;
  };

  // Marcar item como verificado
  const markItemVerified = (itemId: string, verified: boolean, notes: string = '') => {
    const existingIndex = verifiedItems.findIndex(item => item.itemId === itemId);
    
    if (existingIndex >= 0) {
      const updatedItems = [...verifiedItems];
      updatedItems[existingIndex] = { itemId, verified, notes };
      setVerifiedItems(updatedItems);
    } else {
      setVerifiedItems([...verifiedItems, { itemId, verified, notes }]);
    }
  };

  // Calcular estado general de verificación
  const calculateOverallStatus = () => {
    const requiredItems = order.equipment.length;
    const verifiedItemsCount = verifiedItems.filter(item => item.verified).length;
    
    if (verifiedItemsCount === 0) return 'not_ready';
    if (verifiedItemsCount === requiredItems) return 'ready';
    return 'partial';
  };

  // Obtener color del estado general
  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'not_ready': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Guardar verificación
  const handleSave = async () => {
    const overallStatus = calculateOverallStatus();
    
    if (overallStatus === 'not_ready') {
      toast({
        title: "Verificación incompleta",
        description: "Debe verificar al menos un item del inventario.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const verification: InventoryVerification = {
        orderId: order.id,
        verifiedItems: verifiedItems.map(item => ({
          ...item,
          verifiedBy: 'Jefe de Almacén', // TODO: Obtener del contexto de autenticación
          verifiedAt: new Date().toISOString()
        })),
        overallStatus,
        verificationNotes: verificationNotes.trim()
      };

      await onVerify(verification);
      toast({
        title: "Verificación guardada",
        description: "La verificación de inventario ha sido guardada exitosamente.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la verificación. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear estado al cerrar
  const handleClose = () => {
    setVerifiedItems([]);
    setVerificationNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <span>Verificación de Inventario - Orden {order.orderNumber}</span>
            <Badge className={getOverallStatusColor(calculateOverallStatus())}>
              {calculateOverallStatus() === 'ready' ? 'Listo' :
               calculateOverallStatus() === 'partial' ? 'Parcial' : 'No Listo'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la orden */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Orden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                <div>
                  <span className="font-medium">Fecha:</span>
                  <p className="text-gray-600">
                    {new Date(order.date).toLocaleDateString('es-ES')} a las {order.time}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de verificación de inventario */}
          <Card>
            <CardHeader>
              <CardTitle>Verificación de Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.equipment.map(orderItem => {
                  const inventoryItem = mockInventoryItems.find(item => item.id === orderItem.id);
                  const isAvailable = inventoryItem ? isItemAvailable(inventoryItem, orderItem.quantity) : false;
                  const verifiedItem = verifiedItems.find(item => item.itemId === orderItem.id);
                  const stockPercentage = inventoryItem ? calculateStockPercentage(inventoryItem) : 0;

                  return (
                    <div key={orderItem.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{orderItem.name}</span>
                            <Badge variant="outline">{orderItem.category}</Badge>
                            <Badge className={getStatusColor(inventoryItem?.status || 'unknown')}>
                              {getStatusIcon(inventoryItem?.status || 'unknown')}
                              <span className="ml-1">{getStatusText(inventoryItem?.status || 'unknown')}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Requerido: {orderItem.quantity} unidades
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {isAvailable ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${
                              isAvailable ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isAvailable ? 'Disponible' : 'No Disponible'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {inventoryItem && (
                        <div className="space-y-3">
                          {/* Información de stock */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Stock Actual:</span>
                              <p className="text-gray-600">{inventoryItem.currentStock}</p>
                            </div>
                            <div>
                              <span className="font-medium">Disponible:</span>
                              <p className="text-gray-600">{inventoryItem.availableStock}</p>
                            </div>
                            <div>
                              <span className="font-medium">Ubicación:</span>
                              <p className="text-gray-600">{inventoryItem.location}</p>
                            </div>
                            <div>
                              <span className="font-medium">Proveedor:</span>
                              <p className="text-gray-600">{inventoryItem.supplier}</p>
                            </div>
                          </div>

                          {/* Barra de progreso de stock */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Nivel de Stock</span>
                              <span>{stockPercentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={stockPercentage} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Mín: {inventoryItem.minStock}</span>
                              <span>Máx: {inventoryItem.maxStock}</span>
                            </div>
                          </div>

                          {/* Próxima entrega si aplica */}
                          {inventoryItem.nextDelivery && (
                            <div className="bg-blue-50 p-2 rounded text-sm">
                              <span className="font-medium">Próxima entrega:</span>
                              <span className="text-blue-600 ml-1">
                                {new Date(inventoryItem.nextDelivery).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                          )}

                          {/* Verificación manual */}
                          <div className="border-t pt-3">
                            <div className="flex items-center gap-3">
                              <Button
                                size="sm"
                                variant={verifiedItem?.verified ? "default" : "outline"}
                                onClick={() => markItemVerified(orderItem.id, !verifiedItem?.verified)}
                              >
                                {verifiedItem?.verified ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Verificado
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Marcar como Verificado
                                  </>
                                )}
                              </Button>
                              {verifiedItem?.verified && (
                                <input
                                  type="text"
                                  placeholder="Notas de verificación..."
                                  className="flex-1 px-2 py-1 text-sm border rounded"
                                  value={verifiedItem.notes}
                                  onChange={(e) => markItemVerified(orderItem.id, true, e.target.value)}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Notas de verificación */}
          <Card>
            <CardHeader>
              <CardTitle>Notas de Verificación</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full p-3 border rounded-lg resize-none"
                rows={3}
                placeholder="Notas generales sobre la verificación de inventario..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSubmitting || calculateOverallStatus() === 'not_ready'}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Verificación'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryVerificationModal; 