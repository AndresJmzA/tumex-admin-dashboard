import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Box, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  MapPin,
  User,
  Clock,
  Info
} from 'lucide-react';

// Tipos para el componente
interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'Consumible' | 'Accesorio' | 'Instrumental' | 'Equipo' | 'Endoscopio' | 'Cable/Conector';
  price: number;
  stock: number;
  maxStock: number;
  status: 'disponible' | 'en_renta' | 'mantenimiento' | 'fuera_servicio';
  image?: string;
  description: string;
  createdAt: string;
  specifications?: {
    [key: string]: string;
  };
  maintenanceHistory?: Array<{
    date: string;
    type: string;
    description: string;
    technician: string;
  }>;
  rentalHistory?: Array<{
    startDate: string;
    endDate: string;
    client: string;
    status: 'active' | 'completed' | 'cancelled';
  }>;
}

interface ProductCardProps {
  product: Product;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  variant?: 'compact' | 'detailed' | 'full';
  showActions?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onView,
  onEdit,
  onDelete,
  variant = 'detailed',
  showActions = true,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'en_renta': return 'bg-blue-100 text-blue-800';
      case 'mantenimiento': return 'bg-yellow-100 text-yellow-800';
      case 'fuera_servicio': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el color del stock según el nivel
  const getStockColor = (stock: number) => {
    if (stock < 7) return 'text-red-600';
    if (stock < 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Función para obtener el icono de alerta según el stock
  const getStockIcon = (stock: number, maxStock: number) => {
    const percentage = (stock / maxStock) * 100;
    if (percentage === 0) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (percentage < 10) return <AlertTriangle className="h-4 w-4 text-red-400" />;
    if (percentage < 30) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return null;
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para calcular la antigüedad
  const getAge = (dateString: string) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} días`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    return `${Math.floor(diffDays / 365)} años`;
  };

  // Componente de tarjeta compacta
  const CompactCard = () => (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${className}`} onClick={() => setShowDetails(true)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm truncate">{product.name}</CardTitle>
            <p className="text-xs text-gray-500 truncate">{product.brand}</p>
          </div>
          <Badge className={`text-xs ${getStatusColor(product.status)}`}>
            {product.status === 'en_renta' ? 'En Renta' :
             product.status === 'fuera_servicio' ? 'Fuera de Servicio' : product.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium">${product.price.toLocaleString()}</span>
          <span className={`font-medium ${getStockColor(product.stock)}`}>
            {product.stock}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  // Componente de tarjeta detallada
  const DetailedCard = () => (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-base">{product.name}</CardTitle>
            <p className="text-sm text-gray-500">{product.brand}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStockIcon(product.stock, product.maxStock)}
            <Badge className={getStatusColor(product.status)}>
              {product.status === 'en_renta' ? 'En Renta' :
               product.status === 'fuera_servicio' ? 'Fuera de Servicio' : product.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{product.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="font-medium">${product.price.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className={`font-medium ${getStockColor(product.stock)}`}>
                {product.stock}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{getAge(product.createdAt)}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-600 line-clamp-2">
            {product.description}
          </div>

          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowDetails(true)}>
                <Eye className="h-4 w-4 mr-1" />
                Ver
              </Button>
              {onEdit && (
                <Button size="sm" className="flex-1" onClick={() => onEdit(product)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Componente de tarjeta completa
  const FullCard = () => (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <p className="text-sm text-gray-500">{product.brand}</p>
            <p className="text-xs text-gray-400 mt-1">ID: {product.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStockIcon(product.stock, product.maxStock)}
            <Badge className={getStatusColor(product.status)}>
              {product.status === 'en_renta' ? 'En Renta' :
               product.status === 'fuera_servicio' ? 'Fuera de Servicio' : product.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Categoría:</span>
                <span>{product.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Precio:</span>
                <span>${product.price.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Stock:</span>
                <span className={getStockColor(product.stock)}>
                  {product.stock}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Antigüedad:</span>
                <span>{getAge(product.createdAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Descripción:</p>
            <p>{product.description}</p>
          </div>

          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowDetails(true)}>
                <Eye className="h-4 w-4 mr-1" />
                Ver Detalles
              </Button>
              {onEdit && (
                <Button size="sm" className="flex-1" onClick={() => onEdit(product)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => onDelete(product)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Renderizar según la variante
  const renderCard = () => {
    switch (variant) {
      case 'compact':
        return <CompactCard />;
      case 'full':
        return <FullCard />;
      default:
        return <DetailedCard />;
    }
  };

  return (
    <>
      {renderCard()}

      {/* Modal de Detalles */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              {product.name}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
              <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
              <TabsTrigger value="rental">Rentas</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Marca:</span>
                    <span>{product.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Categoría:</span>
                    <span>{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Precio:</span>
                    <span>${product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Estado:</span>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status === 'en_renta' ? 'En Renta' :
                       product.status === 'fuera_servicio' ? 'Fuera de Servicio' : product.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Stock Actual:</span>
                    <span className={getStockColor(product.stock)}>
                      {product.stock}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Disponibilidad:</span>
                    <span className={getStockColor(product.stock)}>
                      {((product.stock / product.maxStock) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Fecha de Creación:</span>
                    <span>{formatDate(product.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Antigüedad:</span>
                    <span>{getAge(product.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">Descripción:</p>
                <p className="text-gray-600">{product.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="space-y-4">
              {product.specifications ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium capitalize">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay especificaciones disponibles para este producto</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              {product.maintenanceHistory && product.maintenanceHistory.length > 0 ? (
                <div className="space-y-3">
                  {product.maintenanceHistory.map((maintenance, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{maintenance.type}</span>
                        <span className="text-sm text-gray-500">{formatDate(maintenance.date)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{maintenance.description}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span>Técnico: {maintenance.technician}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay historial de mantenimiento disponible</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rental" className="space-y-4">
              {product.rentalHistory && product.rentalHistory.length > 0 ? (
                <div className="space-y-3">
                  {product.rentalHistory.map((rental, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{rental.client}</span>
                        <Badge variant={rental.status === 'active' ? 'default' : 'secondary'}>
                          {rental.status === 'active' ? 'Activa' : 
                           rental.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Inicio: {formatDate(rental.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Fin: {formatDate(rental.endDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay historial de rentas disponible</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard; 