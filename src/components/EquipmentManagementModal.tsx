import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X, 
  Package, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Info,
  ShoppingCart,
  FileText,
  Settings,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/contexts/AuthContext';
import { IndividualObjectsModal } from '@/components/IndividualObjectsModal';
import { PackageSelectionModal } from '@/components/PackageSelectionModal';
import { orderEquipmentService } from '@/services/orderEquipmentService';

interface OrderEquipment {
  id: string;
  product_id: string;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
  confirmed: boolean;
  is_from_package?: boolean;
  package_id?: string;
  notes?: string;
}

interface EquipmentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderEquipment: OrderEquipment[];
  onEquipmentUpdate?: (equipment: OrderEquipment[]) => void;
}

export const EquipmentManagementModal: React.FC<EquipmentManagementModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderEquipment,
  onEquipmentUpdate
}) => {
  const [currentEquipment, setCurrentEquipment] = useState<OrderEquipment[]>(orderEquipment);
  const [showAddObjectsModal, setShowAddObjectsModal] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [showStockDetailsModal, setShowStockDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Array<{ id: string; name: string; stock_available: number; stock_warning: boolean }>>([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [liveUpdated, setLiveUpdated] = useState(false);
  
  // NUEVO: Estados para prevenir bucle infinito
  const [hasSyncedOnce, setHasSyncedOnce] = useState(false);
  const [isInitialSync, setIsInitialSync] = useState(true);
  
  const { hasRole, getUserRole } = usePermissions();

  // Verificar permisos del usuario
  const canEditEquipment = () => {
    return (
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_OPERATIVO) ||
      hasRole(UserRole.ADMINISTRADOR_GENERAL) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO)
    );
  };

  const canViewEquipment = () => {
    return (
      hasRole(UserRole.JEFE_ALMACEN) ||
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_OPERATIVO) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO) ||
      hasRole(UserRole.ADMINISTRADOR_GENERAL)
    );
  };

  // Persistencia y sincronización
  const persistAndSync = async (nextEquipment: OrderEquipment[]) => {
    console.log('🔄 Iniciando persistencia y sincronización de equipos:', {
      orderId,
      equipmentCount: nextEquipment.length,
      equipment: nextEquipment
    });
    
    setIsLoading(true);
    
    try {
      // Validar datos antes de persistir
      if (!orderId) {
        throw new Error('No hay orderId válido para persistir equipos');
      }
      
      if (!Array.isArray(nextEquipment)) {
        throw new Error('nextEquipment debe ser un array válido');
      }
      
      // Preparar datos para persistencia
      const equipmentToPersist = nextEquipment.map(eq => ({
        product_id: eq.product_id,
        quantity: eq.quantity,
        price: eq.price,
        notes: eq.notes || '',
        confirmed: !!eq.confirmed,
        is_from_package: !!eq.is_from_package,
        package_id: eq.package_id || null
      }));
      
      console.log('📦 Datos preparados para persistencia:', equipmentToPersist);
      
      // Persistir en la base de datos
      await orderEquipmentService.replaceOrderEquipment(
        orderId,
        equipmentToPersist
      );
      
      console.log('✅ Equipos persistidos exitosamente en la BD');
      
      // Recuperar datos sincronizados desde la BD
      const resp = await orderEquipmentService.getOrderEquipment(orderId);
      console.log('📥 Respuesta de getOrderEquipment después de persistir:', resp);
      
      // Transformar datos para mantener compatibilidad
      const synced = resp.data.map(eq => ({
        id: eq.id,
        product_id: eq.product_id,
        product_name: eq.product_name,
        category: eq.category,
        quantity: eq.quantity,
        price: eq.price,
        confirmed: eq.confirmed,
        is_from_package: eq.is_from_package,
        package_id: eq.package_id,
        notes: eq.notes
      }));
      
      console.log('🔄 Datos sincronizados desde BD:', synced);
      
      // Actualizar estado local
      setCurrentEquipment(synced);
      
      // Notificar al componente padre
      if (onEquipmentUpdate) {
        console.log('📢 Notificando actualización al componente padre');
        onEquipmentUpdate(synced);
      }
      
      console.log('✅ Persistencia y sincronización completada exitosamente');
      
    } catch (error) {
      console.error('❌ Error al persistir/sincronizar equipos:', error);
      console.error('🔍 Detalles del error:', {
        orderId,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : 'No stack available',
        equipmentCount: nextEquipment.length
      });
      
      // Reintentar una vez en caso de error
      try {
        console.log('🔄 Reintentando persistencia...');
        const resp = await orderEquipmentService.getOrderEquipment(orderId);
        const fallbackSynced = resp.data.map(eq => ({
          id: eq.id,
          product_id: eq.product_id,
          product_name: eq.product_name,
          category: eq.category,
          quantity: eq.quantity,
          price: eq.price,
          confirmed: eq.confirmed,
          is_from_package: eq.is_from_package,
          package_id: eq.package_id,
          notes: eq.notes
        }));
        
        setCurrentEquipment(fallbackSynced);
        if (onEquipmentUpdate) onEquipmentUpdate(fallbackSynced);
        console.log('✅ Recuperación de fallback exitosa');
        
      } catch (fallbackError) {
        console.error('❌ Error en recuperación de fallback:', fallbackError);
        // Mantener estado anterior en caso de error total
        console.warn('⚠️ Manteniendo estado anterior debido a error de recuperación');
      }
      
    } finally {
      setIsLoading(false);
      console.log('🏁 Finalizada persistencia y sincronización');
    }
  };

  // NUEVA: Función robusta para recuperar productos existentes de la orden
  const recoverExistingProducts = async (): Promise<OrderEquipment[]> => {
    console.log('🔄 Iniciando recuperación de productos existentes para orden:', orderId);
    
    if (!orderId) {
      console.warn('⚠️ No hay orderId para recuperar productos existentes');
      return [];
    }
    
    try {
      const response = await orderEquipmentService.getOrderEquipment(orderId);
      console.log('📦 Respuesta de recuperación:', response);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('⚠️ Respuesta inválida de getOrderEquipment:', response);
        return [];
      }
      
      const recoveredEquipment = response.data.map(eq => ({
        id: eq.id,
        product_id: eq.product_id,
        product_name: eq.product_name,
        category: eq.category,
        quantity: eq.quantity,
        price: eq.price,
        confirmed: eq.confirmed,
        is_from_package: eq.is_from_package,
        package_id: eq.package_id,
        notes: eq.notes
      }));
      
      console.log('✅ Productos existentes recuperados:', recoveredEquipment);
      return recoveredEquipment;
      
    } catch (error) {
      console.error('❌ Error recuperando productos existentes:', error);
      console.error('🔍 Detalles del error:', {
        orderId,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : 'No stack available'
      });
      
      // Retornar array vacío en caso de error
      return [];
    }
  };

  // NUEVA: Función para sincronización completa del estado
  const syncCompleteState = async () => {
    console.log('🔄 Iniciando sincronización completa del estado');
    
    try {
      // Recuperar productos existentes
      const existingProducts = await recoverExistingProducts();
      
      // Actualizar estado local
      setCurrentEquipment(existingProducts);
      
      // Notificar al componente padre
      if (onEquipmentUpdate) {
        console.log('📢 Notificando sincronización completa al componente padre');
        onEquipmentUpdate(existingProducts);
      }
      
      console.log('✅ Sincronización completa completada');
      
    } catch (error) {
      console.error('❌ Error en sincronización completa:', error);
    }
  };

  // Actualizar equipos cuando cambien las props (CORREGIDO)
  useEffect(() => {
    console.log('🔄 Props de orderEquipment cambiaron:', {
      orderId,
      equipmentCount: orderEquipment?.length || 0,
      shouldSync: orderEquipment && orderEquipment.length > 0
    });
    
    if (orderEquipment && Array.isArray(orderEquipment) && orderEquipment.length > 0) {
      console.log('📦 Actualizando equipos desde props:', orderEquipment);
      setCurrentEquipment(orderEquipment);
    } else if (orderId) {
      console.log('🔄 No hay equipos en props, manteniendo estado vacío');
      // NO sincronizar automáticamente - solo mantener estado vacío
      setCurrentEquipment([]);
    }
  }, [orderEquipment, orderId]);

  // Cargar stock disponible al abrir
  useEffect(() => {
    const loadStock = async () => {
      setLoadingStock(true);
      try {
        const products = await orderEquipmentService.getAvailableProducts();
        setAvailableProducts(products);
      } catch (e) {
        console.error('Error cargando stock disponible', e);
      } finally {
        setLoadingStock(false);
      }
    };
    
    if (isOpen) {
      console.log('🚪 Modal abierto, cargando stock y configurando sincronización en tiempo real');
      loadStock();
      
      // Sincronización inicial del estado
      syncCompleteState();
    }
    
    // Configurar suscripción en tiempo real
    const sub = orderId
      ? orderEquipmentService.subscribeToOrderEquipment(orderId, async () => {
          console.log('🔄 Cambio detectado en tiempo real para orden:', orderId);
          
          try {
            // Re-cargar equipos y stock ante cambios de otros usuarios
            const resp = await orderEquipmentService.getOrderEquipment(orderId);
            console.log('📥 Datos actualizados en tiempo real:', resp);
            
            const synced = resp.data.map(eq => ({
              id: eq.id,
              product_id: eq.product_id,
              product_name: eq.product_name,
              category: eq.category,
              quantity: eq.quantity,
              price: eq.price,
              confirmed: eq.confirmed,
              is_from_package: eq.is_from_package,
              package_id: eq.package_id,
              notes: eq.notes
            }));
            
            console.log('🔄 Equipos sincronizados en tiempo real:', synced);
            
            // Actualizar estado local
            setCurrentEquipment(synced);
            
            // Recargar stock disponible
            const products = await orderEquipmentService.getAvailableProducts();
            setAvailableProducts(products);
            
            // Notificar al componente padre
            if (onEquipmentUpdate) {
              console.log('📢 Notificando actualización en tiempo real al componente padre');
              onEquipmentUpdate(synced);
            }
            
            // Mostrar indicador de actualización en tiempo real
            setLiveUpdated(true);
            setTimeout(() => setLiveUpdated(false), 2000);
            
            console.log('✅ Sincronización en tiempo real completada');
            
          } catch (e) {
            console.error('❌ Error sincronizando equipos (realtime):', e);
            console.error('🔍 Detalles del error:', {
              orderId,
              error: e instanceof Error ? e.message : e,
              stack: e instanceof Error ? e.stack : 'No stack available'
            });
          }
        })
      : null;
    
    return () => { 
      console.log('🚪 Modal cerrado, desuscribiendo de cambios en tiempo real');
      sub?.unsubscribe?.(); 
    };
  }, [isOpen, orderId]);

  // Calcular totales
  const calculateTotals = () => {
    const total = currentEquipment.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const packageItems = currentEquipment.filter(item => item.is_from_package);
    const customItems = currentEquipment.filter(item => !item.is_from_package);
    
    const packageTotal = packageItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const customTotal = customItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      total,
      packageTotal,
      customTotal,
      packageCount: packageItems.length,
      customCount: customItems.length
    };
  };

  const totals = calculateTotals();

  // Agrupar equipos por categoría
  const groupEquipmentByCategory = () => {
    const grouped = currentEquipment.reduce((acc, item) => {
      const category = item.category || 'Sin categoría';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, OrderEquipment[]>);

    // Ordenar categorías según prioridad
    const categoryOrder = ['Equipo', 'Instrumental', 'Consumible', 'Complemento'];
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return { grouped, sortedCategories };
  };

  const { grouped, sortedCategories } = groupEquipmentByCategory();

  // Helpers de stock
  const getStockForProduct = (productId?: string) => {
    if (!productId) return null;
    const found = availableProducts.find(p => p.id === productId);
    return found ? found.stock_available : null;
  };

  const isLowStockProduct = (productId?: string) => {
    if (!productId) return false;
    const found = availableProducts.find(p => p.id === productId);
    return !!found?.stock_warning;
  };

  const itemsExceedingStock = currentEquipment.filter(eq => {
    const stock = getStockForProduct(eq.product_id);
    return typeof stock === 'number' && eq.quantity > stock;
  });

  // Función para eliminar un equipo
  const handleRemoveEquipment = (equipmentId: string) => {
    if (!canEditEquipment()) return;
    
    const next = currentEquipment.filter(item => item.id !== equipmentId);
    setCurrentEquipment(next);
    // Persistir inmediatamente
    persistAndSync(next);
  };

  // Función para actualizar cantidad
  const handleQuantityChange = (equipmentId: string, newQuantity: number) => {
    if (!canEditEquipment() || newQuantity < 1) return;
    // Validación en tiempo real contra stock
    const target = currentEquipment.find(item => item.id === equipmentId);
    const stock = target ? getStockForProduct(target.product_id) : null;
    if (typeof stock === 'number' && newQuantity > stock) {
      newQuantity = stock; // limitar a stock disponible
    }

    const next = currentEquipment.map(item => 
      item.id === equipmentId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCurrentEquipment(next);
    // Persistir inmediatamente
    persistAndSync(next);
  };

  // Función para confirmar equipos
  const handleConfirmEquipment = (equipmentId: string) => {
    if (!canEditEquipment()) return;
    
    const next = currentEquipment.map(item => 
      item.id === equipmentId 
        ? { ...item, confirmed: !item.confirmed }
        : item
    );
    setCurrentEquipment(next);
    // Persistir inmediatamente
    persistAndSync(next);
  };

  // Función para guardar cambios
  const handleSaveChanges = async () => {
    if (!canEditEquipment()) return;
    
    console.log('💾 Iniciando guardado de cambios para orden:', orderId);
    setIsLoading(true);
    
    try {
      // Validar datos antes de guardar
      if (!orderId) {
        throw new Error('No hay orderId válido para guardar cambios');
      }
      
      if (!Array.isArray(currentEquipment)) {
        throw new Error('currentEquipment debe ser un array válido');
      }
      
      console.log('📦 Equipos a guardar:', currentEquipment);
      
      // Persistir en Supabase reemplazando equipos de la orden
      await orderEquipmentService.replaceOrderEquipment(
        orderId,
        currentEquipment.map(eq => ({
          product_id: eq.product_id,
          quantity: eq.quantity,
          price: eq.price,
          notes: eq.notes || '',
          confirmed: !!eq.confirmed,
          is_from_package: !!eq.is_from_package,
          package_id: eq.package_id || null
        }))
      );

      console.log('✅ Equipos guardados exitosamente en la BD');
      
      // Sincronizar estado completo desde la BD
      await syncCompleteState();
      
      console.log('✅ Estado sincronizado después del guardado');
      
      // Cerrar modal después de guardar exitosamente
      onClose();
      
    } catch (error) {
      console.error('❌ Error al guardar cambios:', error);
      console.error('🔍 Detalles del error:', {
        orderId,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : 'No stack available',
        equipmentCount: currentEquipment.length
      });
      
      // Mostrar error al usuario (podrías implementar un toast aquí)
      alert('Error al guardar cambios. Por favor, intenta nuevamente.');
      
    } finally {
      setIsLoading(false);
      console.log('🏁 Finalizado proceso de guardado');
    }
  };

  // Función para abrir modal de objetos individuales
  const handleAddObjects = () => {
    setShowAddObjectsModal(true);
  };

  // Función para abrir modal de paquetes
  const handleAddPackage = () => {
    setShowAddPackageModal(true);
  };

  // Función para manejar equipos agregados desde otros modales
  const handleEquipmentAdded = (newEquipment: OrderEquipment[]) => {
    // Combinar equipos existentes con nuevos, evitando duplicados
    const existingIds = new Set(currentEquipment.map(item => item.product_id));
    const uniqueNewEquipment = newEquipment.filter(item => !existingIds.has(item.product_id));
    
    const next = [...currentEquipment, ...uniqueNewEquipment];
    setCurrentEquipment(next);
    // Persistir inmediatamente
    persistAndSync(next);
  };

  // Función para manejar productos seleccionados del modal de objetos individuales
  const handleIndividualProductsSelected = (selectedProducts: any[]) => {
    const newEquipment: OrderEquipment[] = selectedProducts.map(sp => ({
      id: `new_${Date.now()}_${sp.product.id}`, // ID temporal
      product_id: sp.product.id,
      product_name: sp.product.name,
      category: sp.product.category,
      quantity: sp.quantity,
      price: sp.product.price,
      confirmed: false,
      is_from_package: false,
      notes: `Agregado manualmente`
    }));
    
    handleEquipmentAdded(newEquipment);
    setShowAddObjectsModal(false);
  };

  // Función para manejar productos seleccionados del modal de paquetes
  const handlePackageProductsSelected = (selectedProducts: any[]) => {
    const newEquipment: OrderEquipment[] = selectedProducts.map(sp => ({
      id: `package_${Date.now()}_${sp.product.id}`, // ID temporal con prefijo de paquete
      product_id: sp.product.id,
      product_name: sp.product.name,
      category: sp.product.category,
      quantity: sp.quantity,
      price: sp.product.price,
      confirmed: false,
      is_from_package: true,
      package_id: `package_${Date.now()}`, // ID temporal del paquete
      notes: `Agregado desde paquete: ${sp.product.is_required ? 'Requerido' : 'Opcional'}`
    }));
    
    handleEquipmentAdded(newEquipment);
    setShowAddPackageModal(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestión de Equipos de la Orden
          </DialogTitle>
          <DialogDescription>
            Administra y organiza todos los equipos, consumibles y complementos de esta orden. 
            Agrega productos individuales o paquetes predefinidos según las necesidades del procedimiento.
          </DialogDescription>
          
          {/* NUEVO: Indicador de estado de sincronización */}
          <div className="flex items-center gap-2 mt-2 text-sm">
            {liveUpdated ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Actualizado en tiempo real</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <RefreshCw className="h-4 w-4" />
                <span>Sincronizando...</span>
              </div>
            )}
            
            {/* Indicador de estado de carga */}
            {isLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Guardando cambios...</span>
              </div>
            )}
            
            {/* Información de la orden */}
            <div className="flex items-center gap-2 ml-4 text-gray-500">
              <span className="text-xs">
                Orden: {orderId} • {currentEquipment.length} artículos
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumen de la Orden */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Info className="h-5 w-5" />
                📋 Resumen de la Orden
                {liveUpdated && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 animate-pulse">
                    ✅ Actualizado en tiempo real
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{orderId}</div>
                  <div className="text-blue-700">ID de Orden</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentEquipment.length}</div>
                  <div className="text-green-700">Total de Artículos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">${totals.total.toFixed(2)}</div>
                  <div className="text-purple-700">Valor Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {currentEquipment.filter(item => item.confirmed).length}
                  </div>
                  <div className="text-orange-700">Confirmados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validación de stock en tiempo real */}
          {itemsExceedingStock.length > 0 && (
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="pt-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-800">
                          ⚠️ Algunos equipos exceden el stock disponible
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {itemsExceedingStock.length} producto(s) tienen cantidades solicitadas mayores al stock disponible.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStockDetailsModal(true)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver detalles del stock
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Botones de Acción */}
          {canEditEquipment() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Acciones de Gestión
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleAddObjects}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Añadir Objetos
                  </Button>
                  <Button
                    onClick={handleAddPackage}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Añadir Paquete
                  </Button>
                </div>
                
                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="font-medium text-gray-800 mb-2">💡 Información útil:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Los objetos se agregan sin reemplazar los existentes
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Los paquetes incluyen productos predefinidos por categoría
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Puedes modificar cantidades y eliminar productos
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      Los cambios se guardan automáticamente en tiempo real
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vista de Equipos Existentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Equipos de la Orden
                <Badge variant="outline" className="ml-2">
                  {currentEquipment.length} artículo(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentEquipment.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No hay equipos registrados en esta orden</p>
                  <p className="text-sm text-gray-400 mb-3">Comienza agregando productos individuales o paquetes predefinidos</p>
                  <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded border">
                    💡 <strong>Tip:</strong> Usa los botones de "Añadir Objetos" o "Añadir Paquete" arriba para comenzar
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Resumen de Totales */}
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-lg font-semibold text-blue-600">
                        ${totals.packageTotal.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        📦 Paquetes ({totals.packageCount})
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                      <div className="text-lg font-semibold text-green-600">
                        ${totals.customTotal.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        🛠️ Objetos ({totals.customCount})
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
                      <div className="text-lg font-semibold text-purple-600">
                        ${totals.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">
                        💰 Total General
                      </div>
                    </div>
                  </div>

                  {/* Lista de Equipos por Categoría */}
                  <div className="space-y-4">
                    {sortedCategories.map(category => (
                      <div key={category} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2 border-b">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {category}
                            <Badge variant="outline" className="ml-auto">
                              {grouped[category].length} artículo(s)
                            </Badge>
                          </h4>
                        </div>
                        
                        <div className="divide-y">
                          {grouped[category].map((equipment) => (
                            <div 
                              key={equipment.id} 
                              className={`p-4 flex items-center justify-between ${
                                equipment.is_from_package 
                                  ? 'bg-blue-50 border-l-4 border-l-blue-400' 
                                  : 'bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {/* Indicador de origen */}
                                {equipment.is_from_package ? (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    <Package className="h-3 w-3 mr-1" />
                                    Paquete
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <Plus className="h-3 w-3 mr-1" />
                                    Individual
                                  </Badge>
                                )}
                                {/* Estado derivado: Nuevo */}
                                {(equipment.id.startsWith('new_') || equipment.id.startsWith('package_')) && (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">Nuevo</Badge>
                                )}
                                
                                {/* Estado de confirmación */}
                                {equipment.confirmed ? (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Confirmado
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Pendiente
                                  </Badge>
                                )}
                                
                                {/* Información del producto */}
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {equipment.product_name}
                                  </div>
                                  {equipment.notes && (
                                    <div className="text-sm text-gray-600">
                                      {equipment.notes}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3 text-xs mt-1">
                                    {(() => {
                                      const stock = getStockForProduct(equipment.product_id);
                                      const low = isLowStockProduct(equipment.product_id);
                                      if (typeof stock === 'number') {
                                        return (
                                          <>
                                            <Badge variant="outline" className={`${low ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                              Stock: {stock}
                                            </Badge>
                                            {equipment.quantity > stock && (
                                              <Badge className="bg-red-100 text-red-800">Excede stock</Badge>
                                            )}
                                          </>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {/* Controles de cantidad */}
                                {canEditEquipment() && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQuantityChange(equipment.id, equipment.quantity - 1)}
                                      disabled={equipment.quantity <= 1}
                                    >
                                      -
                                    </Button>
                                    <span className="w-12 text-center font-medium">
                                      {equipment.quantity}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQuantityChange(equipment.id, equipment.quantity + 1)}
                                      disabled={(() => {
                                        const stock = getStockForProduct(equipment.product_id);
                                        return typeof stock === 'number' ? equipment.quantity >= stock : false;
                                      })()}
                                    >
                                      +
                                    </Button>
                                  </div>
                                )}
                                
                                {/* Precio */}
                                <div className="text-right min-w-[80px]">
                                  <div className="font-medium text-gray-900">
                                    ${(equipment.price * equipment.quantity).toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ${equipment.price.toFixed(2)} c/u
                                  </div>
                                </div>
                                
                                {/* Botones de acción */}
                                {canEditEquipment() && (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleConfirmEquipment(equipment.id)}
                                      className={equipment.confirmed ? 'bg-green-50 border-green-200' : ''}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRemoveEquipment(equipment.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de Acción Finales */}
          {canEditEquipment() && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              
              {/* NUEVO: Botón de sincronización manual */}
              <Button
                variant="outline"
                onClick={syncCompleteState}
                disabled={isLoading}
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
              
              <Button
                onClick={handleSaveChanges}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Modal de Objetos Individuales */}
      <IndividualObjectsModal
        isOpen={showAddObjectsModal}
        onClose={() => setShowAddObjectsModal(false)}
        orderId={orderId}
        existingProducts={currentEquipment.map(eq => eq.product_id)}
        onProductsSelected={handleIndividualProductsSelected}
      />

      {/* Modal de Paquetes */}
      <PackageSelectionModal
        isOpen={showAddPackageModal}
        onClose={() => setShowAddPackageModal(false)}
        orderId={orderId}
        existingProducts={currentEquipment.map(eq => eq.product_id)}
        onPackageSelected={handlePackageProductsSelected}
      />

      {/* Modal de Detalles del Stock */}
      <Dialog open={showStockDetailsModal} onOpenChange={setShowStockDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Detalles del Stock Insuficiente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex flex-col h-full">
            <Alert>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                <p className="font-medium text-amber-700">Productos que exceden el stock disponible</p>
                <p className="text-sm text-gray-600 mt-1">
                  Estos productos tienen cantidades solicitadas mayores al stock disponible. 
                  Esta información es solo informativa.
                </p>
              </AlertDescription>
            </Alert>
            
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg flex-1 overflow-hidden border border-gray-200">
              <p className="font-medium text-gray-800 mb-2">
                Productos con stock insuficiente ({itemsExceedingStock.length} productos):
              </p>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded p-2 bg-white">
                <ul className="space-y-1">
                  {itemsExceedingStock.map(item => {
                    const stock = getStockForProduct(item.product_id) || 0;
                    return (
                      <li key={item.id} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-700">{item.product_name}</span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {item.quantity} solicitados, {stock} disponibles
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <p className="text-xs text-gray-600 mt-2 italic">
                Esta información es solo para tu conocimiento. Puedes continuar gestionando la orden normalmente.
              </p>
            </div>
            
            <div className="flex justify-end pt-2 border-t">
              <Button 
                onClick={() => setShowStockDetailsModal(false)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Entendido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
