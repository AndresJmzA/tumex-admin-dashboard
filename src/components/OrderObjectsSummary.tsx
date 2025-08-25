import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Edit,
  ShoppingCart
} from 'lucide-react';

// Tipos para objetos de orden
interface OrderObject {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  notes: string;
  confirmed: boolean;
  stockAvailable: number;
  stockWarning: boolean;
  fromTemplate: boolean;
}

interface OrderObjectsSummaryProps {
  objects: OrderObject[];
  showActions?: boolean;
  showPrices?: boolean;
  showStockInfo?: boolean;
  onEdit?: () => void;
  onView?: () => void;
  className?: string;
  compact?: boolean;
}

const OrderObjectsSummary: React.FC<OrderObjectsSummaryProps> = ({
  objects,
  showActions = true,
  showPrices = true,
  showStockInfo = true,
  onEdit,
  onView,
  className = '',
  compact = false
}) => {
  // Calcular totales
  const totalPrice = objects.reduce((total, obj) => total + (obj.price * obj.quantity), 0);
  const confirmedObjects = objects.filter(obj => obj.confirmed);
  const pendingObjects = objects.filter(obj => !obj.confirmed);
  const stockWarnings = objects.filter(obj => obj.stockWarning);
  const templateObjects = objects.filter(obj => obj.fromTemplate);
  const manualObjects = objects.filter(obj => !obj.fromTemplate);

  // Obtener categorías únicas
  const categories = Array.from(new Set(objects.map(obj => obj.category)));

  // Obtener color de categoría
  const getCategoryColor = (category: string) => {
    const colors = {
      'Consumible': 'bg-blue-100 text-blue-800',
      'Accesorio': 'bg-green-100 text-green-800',
      'Instrumental': 'bg-purple-100 text-purple-800',
      'Equipo': 'bg-orange-100 text-orange-800',
      'Endoscopio': 'bg-indigo-100 text-indigo-800',
      'Cable/Conector': 'bg-teal-100 text-teal-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  // Obtener icono de categoría
  const getCategoryIcon = (category: string) => {
    const icons = {
      'Consumible': '💊',
      'Accesorio': '🔧',
      'Instrumental': '⚡',
      'Equipo': '🏥',
      'Endoscopio': '🔍',
      'Cable/Conector': '🔌',
      'General': '📦'
    };
    return icons[category as keyof typeof icons] || icons.General;
  };

  if (objects.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-500">
            <Package className="h-4 w-4" />
            Sin Objetos Seleccionados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 text-center py-4">
            No hay objetos seleccionados para esta orden
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Resumen de Objetos
            <Badge variant="secondary" className="ml-2">
              {objects.length} objetos
            </Badge>
          </CardTitle>
          
          {showActions && (
            <div className="flex gap-2">
              {onView && (
                <Button size="sm" variant="outline" onClick={onView}>
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Detalles
                </Button>
              )}
              {onEdit && (
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{objects.length}</div>
            <div className="text-xs text-blue-600">Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{confirmedObjects.length}</div>
            <div className="text-xs text-green-600">Confirmados</div>
          </div>
          {showPrices && (
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                ${totalPrice.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600">Total</div>
            </div>
          )}
          {stockWarnings.length > 0 && (
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{stockWarnings.length}</div>
              <div className="text-xs text-orange-600">Stock Bajo</div>
            </div>
          )}
        </div>

        {/* Warnings de stock */}
        {showStockInfo && stockWarnings.length > 0 && (
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">Advertencias de Stock</span>
            </div>
            <div className="space-y-1">
              {stockWarnings.map(obj => (
                <div key={obj.id} className="text-sm text-orange-700">
                  • {obj.name}: Solo {obj.stockAvailable} disponibles (solicitados: {obj.quantity})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de objetos por categoría */}
        {!compact && (
          <div className="space-y-3">
            {categories.map(category => {
              const categoryObjects = objects.filter(obj => obj.category === category);
              const categoryTotal = categoryObjects.reduce((total, obj) => total + (obj.price * obj.quantity), 0);
              
              return (
                <div key={category} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(category)}</span>
                      <span className="font-medium">{category}</span>
                      <Badge variant="outline" className={getCategoryColor(category)}>
                        {categoryObjects.length} objetos
                      </Badge>
                    </div>
                    {showPrices && (
                      <div className="text-sm font-medium text-gray-600">
                        ${categoryTotal.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {categoryObjects.map(obj => (
                      <div key={obj.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {obj.confirmed ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <Clock className="h-3 w-3 text-yellow-600" />
                          )}
                          <span className="font-medium">{obj.name}</span>
                          <Badge variant="outline" className="text-xs">
                            x{obj.quantity}
                          </Badge>
                          {obj.fromTemplate && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              Plantilla
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {showStockInfo && obj.stockWarning && (
                            <AlertTriangle className="h-3 w-3 text-orange-600" />
                          )}
                          {showPrices && (
                            <span className="text-gray-600">
                              ${(obj.price * obj.quantity).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Resumen de origen */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                  {templateObjects.length}
                </Badge>
                <span className="text-gray-600">De plantilla</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                  {manualObjects.length}
                </Badge>
                <span className="text-gray-600">Agregados manualmente</span>
              </div>
            </div>
            
            {showPrices && (
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  ${totalPrice.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            )}
          </div>
        </div>

        {/* Estado de confirmación */}
        {pendingObjects.length > 0 && (
          <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {pendingObjects.length} objetos pendientes de confirmación
              </span>
            </div>
          </div>
        )}

        {confirmedObjects.length === objects.length && objects.length > 0 && (
          <div className="border border-green-200 bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Todos los objetos confirmados
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderObjectsSummary; 