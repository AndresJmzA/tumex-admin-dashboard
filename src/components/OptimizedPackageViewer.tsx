import React, { useState, useEffect } from 'react';
import { useOptimizedPackages } from '@/hooks/useOptimizedPackages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Monitor, 
  Scissors, 
  Package as PackageIcon, 
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface OptimizedPackageViewerProps {
  procedureId: string;
  orderId?: string;
  onApplyPackage?: (equipment: any[]) => void;
  showApplyButton?: boolean;
  className?: string;
}

/**
 * Componente para visualizar paquetes optimizados de la FASE 2
 * Muestra las categorías ordenadas según la prioridad definida
 * y permite aplicar el paquete completo a una orden
 */
export function OptimizedPackageViewer({
  procedureId,
  orderId,
  onApplyPackage,
  showApplyButton = true,
  className = ''
}: OptimizedPackageViewerProps) {
  const {
    optimizedPackage,
    packageLoading,
    applicationLoading,
    applyPackageToOrder,
    packageStats
  } = useOptimizedPackages();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProducts, setShowProducts] = useState(false);

  // Cargar paquete cuando cambie el procedureId
  useEffect(() => {
    if (procedureId) {
      // Usar el método loadPackage del hook
      // Esto se maneja internamente en el hook
    }
  }, [procedureId]);

  // Función para aplicar paquete a la orden
  const handleApplyPackage = async () => {
    if (!orderId || !optimizedPackage) return;

    try {
      const appliedEquipment = await applyPackageToOrder(orderId, procedureId, {
        replace_existing: false,
        confirm_equipment: false,
        user_id: 'current_user' // Esto debería venir del contexto de autenticación
      });

      if (onApplyPackage) {
        onApplyPackage(appliedEquipment);
      }
    } catch (error) {
      console.error('Error applying package:', error);
    }
  };

  // Función para obtener el icono de categoría
  const getCategoryIcon = (categoryKey: string) => {
    switch (categoryKey) {
      case 'equipo':
        return <Monitor className="w-4 h-4" />;
      case 'instrumental':
        return <Scissors className="w-4 h-4" />;
      case 'consumibles':
        return <PackageIcon className="w-4 h-4" />;
      case 'complementos':
        return <PlusCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // Función para formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  // Renderizar skeleton de carga
  if (packageLoading.loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Renderizar error
  if (packageLoading.error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar el paquete: {packageLoading.error}
        </AlertDescription>
      </Alert>
    );
  }

  // Renderizar mensaje si no hay paquete
  if (!optimizedPackage) {
    return (
      <Alert className={className}>
        <Package className="h-4 w-4" />
        <AlertDescription>
          No se encontró un paquete optimizado para este procedimiento.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header del paquete */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span>Paquete Optimizado</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {optimizedPackage.procedure_name} - {optimizedPackage.surgery_type_name}
              </p>
            </div>
            {showApplyButton && orderId && (
              <Button
                onClick={handleApplyPackage}
                disabled={applicationLoading.loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {applicationLoading.loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Aplicando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aplicar Paquete
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        
        {/* Estadísticas del paquete */}
        {packageStats && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {packageStats.totalCategories}
                </div>
                <div className="text-sm text-muted-foreground">Categorías</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {packageStats.totalProducts}
                </div>
                <div className="text-sm text-muted-foreground">Productos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatPrice(packageStats.totalValue)}
                </div>
                <div className="text-sm text-muted-foreground">Valor Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {optimizedPackage.categories.length}
                </div>
                <div className="text-sm text-muted-foreground">Procedimientos</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Categorías del paquete */}
      <div className="space-y-4">
        {optimizedPackage.categories.map((category, index) => (
          <Card key={category.category} className="border-l-4" style={{ borderLeftColor: category.category_color }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: category.category_color }}
                  >
                    {getCategoryIcon(category.category)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {category.category_display}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {category.product_count} productos • {category.total_quantity} unidades
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {formatPrice(category.total_value)}
                  </div>
                  <Badge variant="secondary">
                    Prioridad {category.category_sort_order}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Lista de productos de la categoría */}
              <div className="space-y-2">
                {category.products.map((product) => (
                  <div 
                    key={product.product_id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{product.product_name}</div>
                      {product.product_description && (
                        <div className="text-sm text-muted-foreground">
                          {product.product_description}
                        </div>
                      )}
                      {product.product_brand && (
                        <div className="text-xs text-muted-foreground">
                          Marca: {product.product_brand}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-right">
                      <div>
                        <div className="font-medium">{product.quantity} x {formatPrice(product.price)}</div>
                        <div className="text-sm text-muted-foreground">
                          Stock: {product.stock}
                        </div>
                      </div>
                      <div className="text-lg font-semibold">
                        {formatPrice(product.quantity * product.price)}
                      </div>
                      <div className="flex items-center space-x-1">
                        {product.available ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Información adicional */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground text-center">
            <p>
              Este paquete optimizado incluye {optimizedPackage.total_products} productos 
              organizados en {optimizedPackage.categories.length} categorías según el orden de prioridad.
            </p>
            <p className="mt-2">
              Las categorías se muestran en el orden: Equipo → Instrumental → Consumibles → Complementos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
