import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { orderEquipmentService } from '@/services/orderEquipmentService';
import { 
  X, 
  Package, 
  Plus, 
  Minus,
  Search,
  Filter,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  sku?: string;
}

interface SelectedProduct {
  product: Product;
  quantity: number;
  isSelected: boolean;
}

interface IndividualObjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  existingProducts: string[]; // IDs de productos ya en la orden
  onProductsSelected: (selectedProducts: SelectedProduct[]) => void;
}

export const IndividualObjectsModal: React.FC<IndividualObjectsModalProps> = ({
  isOpen,
  onClose,
  orderId,
  existingProducts,
  onProductsSelected
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showStockWarning, setShowStockWarning] = useState(false);
  
  // NUEVO: Estado para productos existentes en la orden (leídos desde BD)
  const [orderExistingProducts, setOrderExistingProducts] = useState<string[]>([]);
  const [loadingExistingProducts, setLoadingExistingProducts] = useState(false);
  
  // NUEVO: Estados para persistencia del modal
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [draftSelectedProducts, setDraftSelectedProducts] = useState<SelectedProduct[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // NUEVO: Estados para manejo de errores y validaciones
  const [errors, setErrors] = useState<{
    sync?: string;
    validation?: string;
    network?: string;
    general?: string;
  }>({});
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const { hasRole } = usePermissions();
  const ITEMS_PER_PAGE = 20;

  // Verificar permisos del usuario
  const canEditEquipment = () => {
    return (
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_OPERATIVO) ||
      hasRole(UserRole.ADMINISTRADOR_GENERAL) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO)
    );
  };

  // NUEVAS: Funciones de validación robustas
  const validateProduct = (product: Product): string[] => {
    const warnings: string[] = [];
    
    if (!product.id || typeof product.id !== 'string') {
      warnings.push('ID de producto inválido');
    }
    
    if (!product.name || typeof product.name !== 'string' || product.name.trim().length === 0) {
      warnings.push('Nombre de producto inválido');
    }
    
    if (typeof product.price !== 'number' || product.price < 0) {
      warnings.push('Precio de producto inválido');
    }
    
    if (typeof product.stock !== 'number' || product.stock < 0) {
      warnings.push('Stock de producto inválido');
    }
    
    if (product.stock <= 5) {
      warnings.push('Stock bajo detectado');
    }
    
    return warnings;
  };

  const validateSelectedProduct = (selectedProduct: SelectedProduct): string[] => {
    const warnings: string[] = [];
    
    // Validar producto base
    warnings.push(...validateProduct(selectedProduct.product));
    
    // Validar cantidad
    if (typeof selectedProduct.quantity !== 'number' || selectedProduct.quantity < 1) {
      warnings.push('Cantidad debe ser mayor a 0');
    }
    
    if (selectedProduct.quantity > selectedProduct.product.stock) {
      warnings.push(`Cantidad excede stock disponible (${selectedProduct.product.stock})`);
    }
    
    // Validar selección
    if (typeof selectedProduct.isSelected !== 'boolean') {
      warnings.push('Estado de selección inválido');
    }
    
    return warnings;
  };

  const validateOrderData = (): string[] => {
    const warnings: string[] = [];
    
    if (!orderId || typeof orderId !== 'string' || orderId.trim().length === 0) {
      warnings.push('ID de orden inválido');
    }
    
    if (!Array.isArray(orderExistingProducts)) {
      warnings.push('Lista de productos existentes inválida');
    }
    
    if (selectedProducts.length > 0) {
      // Validar cada producto seleccionado
      selectedProducts.forEach((sp, index) => {
        const productWarnings = validateSelectedProduct(sp);
        if (productWarnings.length > 0) {
          warnings.push(`Producto ${index + 1}: ${productWarnings.join(', ')}`);
        }
      });
    }
    
    return warnings;
  };

  const clearErrors = () => {
    setErrors({});
    setValidationWarnings([]);
  };

  const addError = (type: keyof typeof errors, message: string) => {
    setErrors(prev => ({ ...prev, [type]: message }));
    console.error(`❌ Error [${type}]:`, message);
  };

  const addValidationWarning = (warning: string) => {
    setValidationWarnings(prev => [...prev, warning]);
    console.warn(`⚠️ Validación:`, warning);
  };

  // NUEVO: Cargar productos existentes en la orden desde la base de datos
  const loadExistingProductsFromDatabase = async (isRetry: boolean = false) => {
    if (!orderId) {
      addError('validation', 'No hay orderId para cargar productos existentes');
      return;
    }
    
    // Limpiar errores previos si no es un reintento
    if (!isRetry) {
      clearErrors();
    }
    
    console.log('🔄 Iniciando carga de productos existentes para orden:', orderId);
    setLoadingExistingProducts(true);
    setSyncStatus('syncing');
    
    try {
      // Validar orderId antes de hacer la llamada
      if (orderId.trim().length === 0) {
        throw new Error('OrderId está vacío');
      }
      
      const response = await orderEquipmentService.getOrderEquipment(orderId);
      console.log('📦 Respuesta de getOrderEquipment:', response);
      
      // Validar respuesta de la API
      if (!response || !response.data) {
        throw new Error('Respuesta inválida de la API');
      }
      
      if (!Array.isArray(response.data)) {
        throw new Error('Los datos de la API no son un array válido');
      }
      
      const existingProductIds = response.data.map(eq => eq.product_id);
      console.log('✅ Productos existentes cargados desde BD:', existingProductIds);
      
      // Validar IDs de productos
      const validProductIds = existingProductIds.filter(id => 
        id && typeof id === 'string' && id.trim().length > 0
      );
      
      if (validProductIds.length !== existingProductIds.length) {
        addValidationWarning(`${existingProductIds.length - validProductIds.length} IDs de productos inválidos detectados`);
      }
      
      setOrderExistingProducts(validProductIds);
      setLastSyncTimestamp(new Date());
      setSyncStatus('success');
      setRetryCount(0); // Resetear contador de reintentos en caso de éxito
      
      // Log adicional para debugging
      if (validProductIds.length > 0) {
        console.log(`🎯 Orden ${orderId} tiene ${validProductIds.length} productos asignados`);
      } else {
        console.log(`📝 Orden ${orderId} no tiene productos asignados`);
      }
      
    } catch (error) {
      console.error('❌ Error cargando productos existentes de la orden:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const errorType = error instanceof Error && error.message.includes('network') ? 'network' : 'sync';
      
      addError(errorType, `Error cargando productos: ${errorMessage}`);
      setSyncStatus('error');
      
      // Sistema de reintentos automático
      if (retryCount < maxRetries && !isRetry) {
        console.log(`🔄 Reintentando en 2 segundos... (${retryCount + 1}/${maxRetries})`);
        setRetryCount(prev => prev + 1);
        setIsRetrying(true);
        
        setTimeout(() => {
          setIsRetrying(false);
          loadExistingProductsFromDatabase(true);
        }, 2000);
        
        return;
      }
      
      // Si se agotaron los reintentos, usar fallback
      if (retryCount >= maxRetries) {
        console.warn('⚠️ Se agotaron los reintentos, usando fallback a existingProducts prop');
        addError('general', 'No se pudo cargar desde BD después de múltiples intentos');
        
        // Fallback a la prop si falla la BD
        if (existingProducts && Array.isArray(existingProducts)) {
          setOrderExistingProducts(existingProducts);
          addValidationWarning('Usando datos de fallback (pueden estar desactualizados)');
        } else {
          setOrderExistingProducts([]);
          addError('validation', 'No hay datos de fallback disponibles');
        }
      }
      
    } finally {
      setLoadingExistingProducts(false);
      console.log('🏁 Finalizada carga de productos existentes');
    }
  };

  // NUEVO: Función para restaurar selecciones temporales del usuario
  const restoreDraftSelections = () => {
    if (draftSelectedProducts.length > 0) {
      console.log('📝 Restaurando selecciones temporales del usuario:', draftSelectedProducts);
      setSelectedProducts([...draftSelectedProducts]);
      setHasUnsavedChanges(true);
    }
  };

  // NUEVO: Función para guardar selecciones temporales
  const saveDraftSelections = () => {
    if (selectedProducts.length > 0) {
      console.log('💾 Guardando selecciones temporales:', selectedProducts);
      setDraftSelectedProducts([...selectedProducts]);
      setHasUnsavedChanges(false);
    } else {
      setDraftSelectedProducts([]);
      setHasUnsavedChanges(false);
    }
  };

  // NUEVO: Función para limpiar estado de borrador
  const clearDraftState = () => {
    console.log('🧹 Limpiando estado de borrador');
    setDraftSelectedProducts([]);
    setSelectedProducts([]);
    setHasUnsavedChanges(false);
  };

  // NUEVO: Función para sincronizar estado completo del modal
  const syncModalState = async () => {
    console.log('🔄 Iniciando sincronización completa del estado del modal');
    
    // Cargar productos existentes
    await loadExistingProductsFromDatabase();
    
    // Restaurar selecciones temporales si existen
    restoreDraftSelections();
    
    console.log('✅ Sincronización completa del modal finalizada');
  };

  // Cargar productos disponibles desde Supabase
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const available = await orderEquipmentService.getAvailableProducts();
        const mapped: Product[] = (available || []).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          stock: p.stock_available,
          description: p.description
        }));
        setProducts(mapped);
        setFilteredProducts(mapped);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  // NUEVO: Cargar productos existentes de la orden cada vez que se abra el modal
  useEffect(() => {
    if (isOpen && orderId) {
      console.log('🚪 Modal abierto, sincronizando productos existentes para orden:', orderId);
      // Sincronización completa del estado del modal
      syncModalState();
    }
  }, [isOpen, orderId]);

  // NUEVO: Actualizar productos existentes cuando cambie el orderId
  useEffect(() => {
    if (orderId) {
      console.log('🔄 OrderId cambió, actualizando productos existentes:', orderId);
      loadExistingProductsFromDatabase();
    }
  }, [orderId]);

  // NUEVO: Guardar selecciones temporales cuando cambien
  useEffect(() => {
    if (selectedProducts.length > 0) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [selectedProducts]);

  // NUEVO: Limpiar estado cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      console.log('🚪 Modal cerrado, guardando estado temporal y limpiando');
      saveDraftSelections();
      // No limpiar completamente, solo marcar como cerrado
    }
  }, [isOpen]);

  // Filtrar productos
  useEffect(() => {
    let filtered = products;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Resetear a primera página al filtrar
  }, [products, searchTerm, selectedCategory]);

  // Obtener productos de la página actual
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  };

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Función para manejar selección de producto
  const handleProductSelection = (product: Product, isSelected: boolean) => {
    if (isSelected) {
      // Agregar producto
      const newSelectedProduct: SelectedProduct = {
        product,
        quantity: 1,
        isSelected: true
      };
      setSelectedProducts(prev => [...prev, newSelectedProduct]);
    } else {
      // Remover producto
      setSelectedProducts(prev => prev.filter(sp => sp.product.id !== product.id));
    }
  };

  // Función para actualizar cantidad
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setSelectedProducts(prev => 
      prev.map(sp => 
        sp.product.id === productId 
          ? { ...sp, quantity: newQuantity }
          : sp
      )
    );
  };

  // Función para verificar si un producto ya está en la orden
  const isProductInOrder = (productId: string) => {
    return orderExistingProducts.includes(productId);
  };

  // Función para verificar stock bajo
  const isLowStock = (stock: number) => {
    return stock <= 5;
  };

  // Función para agregar productos seleccionados
  const handleAddSelectedProducts = () => {
    console.log('🔄 Iniciando validación y confirmación de productos seleccionados');
    
    // Limpiar errores previos
    clearErrors();
    
    // Validar que haya productos seleccionados
    if (!selectedProducts || selectedProducts.length === 0) {
      addError('validation', 'No hay productos seleccionados');
      alert('Por favor selecciona al menos un producto');
      return;
    }
    
    // Validar cada producto seleccionado
    const validationWarnings: string[] = [];
    const validProducts: SelectedProduct[] = [];
    
    selectedProducts.forEach((sp, index) => {
      const warnings = validateSelectedProduct(sp);
      if (warnings.length > 0) {
        validationWarnings.push(`Producto ${index + 1} (${sp.product.name}): ${warnings.join(', ')}`);
      } else {
        validProducts.push(sp);
      }
    });
    
    // Si hay advertencias de validación, mostrarlas
    if (validationWarnings.length > 0) {
      validationWarnings.forEach(warning => addValidationWarning(warning));
      console.warn('⚠️ Advertencias de validación:', validationWarnings);
    }
    
    // Verificar que haya productos válidos
    if (validProducts.length === 0) {
      addError('validation', 'No hay productos válidos para confirmar');
      alert('Todos los productos seleccionados tienen errores de validación. Por favor, revisa y corrige.');
      return;
    }
    
    // Verificar stock disponible
    const insufficientStock = validProducts.filter(sp => sp.quantity > sp.product.stock);
    if (insufficientStock.length > 0) {
      const stockWarnings = insufficientStock.map(sp => 
        `${sp.product.name}: ${sp.quantity} solicitados, ${sp.product.stock} disponibles`
      );
      stockWarnings.forEach(warning => addValidationWarning(warning));
      
      console.warn('⚠️ Productos con stock insuficiente:', insufficientStock);
      setShowStockWarning(true);
      return;
    }
    
    // Validar datos de la orden
    const orderWarnings = validateOrderData();
    if (orderWarnings.length > 0) {
      orderWarnings.forEach(warning => addValidationWarning(warning));
      console.warn('⚠️ Advertencias de validación de orden:', orderWarnings);
    }
    
    // Si hay errores críticos, no proceder
    if (Object.keys(errors).length > 0) {
      console.error('❌ Errores críticos detectados, no se pueden confirmar productos:', errors);
      alert('Hay errores que impiden confirmar los productos. Por favor, revisa la consola para más detalles.');
      return;
    }
    
    console.log('✅ Productos validados exitosamente:', validProducts);
    
    try {
      // Limpiar estado de borrador ya que se van a confirmar
      clearDraftState();
      
      // Llamar a la función callback del componente padre
      onProductsSelected(validProducts);
      
      console.log('✅ Productos confirmados y enviados al componente padre');
      
      // Cerrar el modal
      onClose();
      
    } catch (error) {
      console.error('❌ Error al confirmar productos:', error);
      addError('general', `Error al confirmar productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      
      // Restaurar estado de borrador en caso de error
      restoreDraftSelections();
      alert('Error al confirmar productos. Por favor, intenta nuevamente.');
    }
  };

  // Función para limpiar selección
  const handleClearSelection = () => {
    console.log('🧹 Limpiando selección actual y estado de borrador');
    setSelectedProducts([]);
    clearDraftState();
  };

  // Función para seleccionar todos los productos de la página
  const handleSelectAllPage = () => {
    const currentPageProducts = getCurrentPageProducts();
    const notInOrder = currentPageProducts.filter(p => !isProductInOrder(p.id));
    
    const newSelected = notInOrder.map(product => ({
      product,
      quantity: 1,
      isSelected: true
    }));
    
    setSelectedProducts(prev => {
      const existingIds = new Set(prev.map(sp => sp.product.id));
      const uniqueNew = newSelected.filter(sp => !existingIds.has(sp.product.id));
      return [...prev, ...uniqueNew];
    });
  };

  // Función para deseleccionar todos
  const handleDeselectAll = () => {
    console.log('🚫 Deseleccionando todos los productos y limpiando estado de borrador');
    setSelectedProducts([]);
    clearDraftState();
  };

  // Calcular total de productos seleccionados
  const totalSelected = selectedProducts.reduce((sum, sp) => sum + sp.quantity, 0);
  const totalValue = selectedProducts.reduce((sum, sp) => sum + (sp.product.price * sp.quantity), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Selección de Objetos Individuales
          </DialogTitle>
          <DialogDescription>
            Selecciona productos individuales para agregar a la orden. Puedes buscar, filtrar y seleccionar múltiples productos.
          </DialogDescription>
          
          {/* NUEVO: Indicador de estado de sincronización */}
          <div className="flex items-center gap-2 mt-2 text-sm">
            {loadingExistingProducts ? (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Sincronizando productos de la orden...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>
                  {orderExistingProducts.length > 0 
                    ? `${orderExistingProducts.length} producto(s) ya en la orden`
                    : 'Orden sin productos asignados'
                  }
                </span>
              </div>
            )}
            
            {/* NUEVO: Indicador de estado de sincronización */}
            <div className="flex items-center gap-2 ml-4">
              <div className={`w-2 h-2 rounded-full ${
                syncStatus === 'idle' ? 'bg-gray-400' :
                syncStatus === 'syncing' ? 'bg-blue-500' :
                syncStatus === 'success' ? 'bg-green-500' :
                'bg-red-500'
              }`} />
              <span className={`text-xs ${
                syncStatus === 'idle' ? 'text-gray-500' :
                syncStatus === 'syncing' ? 'text-blue-600' :
                syncStatus === 'success' ? 'text-green-600' :
                'text-red-600'
              }`}>
                {syncStatus === 'idle' ? 'Sin sincronizar' :
                 syncStatus === 'syncing' ? 'Sincronizando...' :
                 syncStatus === 'success' ? 'Sincronizado' :
                 'Error de sincronización'}
              </span>
            </div>
            
            {/* NUEVO: Indicador de cambios sin guardar */}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 ml-4 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">Cambios sin guardar</span>
              </div>
            )}
            
            {/* NUEVO: Timestamp de última sincronización */}
            {lastSyncTimestamp && (
              <div className="flex items-center gap-2 ml-4 text-gray-500">
                <span className="text-xs">
                  Última sincronización: {lastSyncTimestamp.toLocaleTimeString()}
                </span>
              </div>
            )}
            
            {/* NUEVO: Indicador de estado de salud del sistema */}
            <div className="flex items-center gap-2 ml-4">
              <div className={`w-2 h-2 rounded-full ${
                Object.keys(errors).length === 0 && validationWarnings.length === 0 ? 'bg-green-500' :
                validationWarnings.length > 0 ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className={`text-xs ${
                Object.keys(errors).length === 0 && validationWarnings.length === 0 ? 'text-green-600' :
                validationWarnings.length > 0 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {Object.keys(errors).length === 0 && validationWarnings.length === 0 ? 'Sistema OK' :
                 validationWarnings.length > 0 ? `${validationWarnings.length} advertencia(s)` :
                 `${Object.keys(errors).length} error(es)`}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-2 sm:p-0">
          {/* Filtros y Búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Búsqueda */}
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar Productos</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Nombre, descripción o SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtro por Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'Todas las categorías' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Acciones de Selección */}
                <div className="space-y-2">
                  <Label>Acciones Rápidas</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllPage}
                      className="text-xs"
                    >
                      Seleccionar Página
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                      className="text-xs"
                    >
                      Limpiar Todo
                    </Button>
                    {/* NUEVO: Botón para actualizar productos existentes de la orden */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadExistingProductsFromDatabase()}
                      disabled={loadingExistingProducts}
                      className="text-xs"
                    >
                      {loadingExistingProducts ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Actualizar Orden
                    </Button>
                    
                    {/* NUEVO: Botón para sincronización completa */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={syncModalState}
                      disabled={loadingExistingProducts || syncStatus === 'syncing'}
                      className="text-xs"
                    >
                      {syncStatus === 'syncing' ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Sincronizar Todo
                    </Button>
                    
                    {/* NUEVO: Botón para limpiar errores y advertencias */}
                    {(Object.keys(errors).length > 0 || validationWarnings.length > 0) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearErrors}
                        className="text-xs border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpiar Errores
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen de Filtros */}
              <div className="text-sm text-gray-600">
                Mostrando {filteredProducts.length} de {products.length} productos
                {searchTerm && ` que coinciden con "${searchTerm}"`}
                {selectedCategory !== 'all' && ` en categoría "${selectedCategory}"`}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos Disponibles
                <Badge variant="outline" className="ml-2">
                  {filteredProducts.length} producto(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* NUEVO: Mensaje informativo sobre el estado de sincronización */}
              {!isLoading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Info className="h-4 w-4" />
                    <span>
                      {loadingExistingProducts 
                        ? 'Sincronizando productos de la orden...'
                        : orderExistingProducts.length > 0
                          ? `${orderExistingProducts.length} producto(s) ya están asignados a esta orden y aparecen marcados como "Ya en Orden".`
                          : 'Esta orden no tiene productos asignados aún.'
                      }
                    </span>
                  </div>
                </div>
              )}
              
              {/* NUEVO: Mensaje informativo sobre selecciones temporales */}
              {!isLoading && (selectedProducts.length > 0 || hasUnsavedChanges) && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      {selectedProducts.length > 0 
                        ? `${selectedProducts.length} producto(s) seleccionado(s) temporalmente. Los cambios se guardarán automáticamente al cerrar el modal.`
                        : hasUnsavedChanges 
                          ? 'Tienes cambios sin guardar. Los cambios se guardarán automáticamente al cerrar el modal.'
                          : ''
                      }
                    </span>
                  </div>
                </div>
              )}
              
              {/* NUEVO: Panel de errores y advertencias */}
              {!isLoading && (Object.keys(errors).length > 0 || validationWarnings.length > 0) && (
                <div className="mb-4 space-y-3">
                  {/* Errores críticos */}
                  {Object.keys(errors).length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-red-700 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Errores detectados:</span>
                      </div>
                      <div className="space-y-1 text-xs text-red-600">
                        {Object.entries(errors).map(([type, message]) => (
                          <div key={type} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            <span className="capitalize">{type}:</span>
                            <span>{message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Advertencias de validación */}
                  {validationWarnings.length > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-yellow-700 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Advertencias de validación ({validationWarnings.length}):</span>
                      </div>
                      <div className="space-y-1 text-xs text-yellow-600 max-h-32 overflow-y-auto">
                        {validationWarnings.map((warning, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                            <span>{warning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Estado de reintentos */}
                  {isRetrying && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Reintentando conexión... ({retryCount}/{maxRetries})</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
                  <p className="text-gray-600">Cargando productos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No se encontraron productos</p>
                  <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Productos de la página actual */}
                  <div className="grid gap-3">
                    {getCurrentPageProducts().map((product) => {
                      const isSelected = selectedProducts.some(sp => sp.product.id === product.id);
                      const selectedProduct = selectedProducts.find(sp => sp.product.id === product.id);
                      const isInOrder = isProductInOrder(product.id);
                      const lowStock = isLowStock(product.stock);

                      return (
                        <div
                          key={product.id}
                          className={`p-4 border rounded-lg transition-colors ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          } ${isInOrder ? 'opacity-60 bg-gray-50' : ''}`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Checkbox de selección */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`product-${product.id}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => 
                                  handleProductSelection(product, checked as boolean)
                                }
                                disabled={isInOrder}
                              />
                              <Label htmlFor={`product-${product.id}`} className="sr-only">
                                Seleccionar {product.name}
                              </Label>
                            </div>

                            {/* Información del producto */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    {product.name}
                                    {isInOrder && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Ya en Orden
                                      </Badge>
                                    )}
                                    {lowStock && (
                                      <Badge className="bg-red-100 text-red-800 text-xs">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Stock Bajo
                                      </Badge>
                                    )}
                                  </h4>
                                  <p className="text-sm text-gray-600">{product.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                    <span>SKU: {product.sku || 'N/A'}</span>
                                    <span>Categoría: {product.category}</span>
                                    <span className={`font-medium ${lowStock ? 'text-red-600' : 'text-green-600'}`}>
                                      Stock: {product.stock}
                                    </span>
                                  </div>
                                </div>

                                {/* Precio */}
                  <div className="text-right mt-2 sm:mt-0">
                                  <div className="text-lg font-semibold text-gray-900">
                                    ${product.price.toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-500">por unidad</div>
                                </div>
                              </div>

                              {/* Controles de cantidad (solo si está seleccionado) */}
                              {isSelected && (
                                <div className="flex items-center gap-3 pt-2 border-t">
                                  <Label htmlFor={`quantity-${product.id}`} className="text-sm font-medium">
                                    Cantidad:
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQuantityChange(product.id, (selectedProduct?.quantity || 1) - 1)}
                                      disabled={(selectedProduct?.quantity || 1) <= 1}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                      id={`quantity-${product.id}`}
                                      type="number"
                                      min="1"
                                      max={product.stock}
                                      value={selectedProduct?.quantity || 1}
                                      onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                                      className="w-20 text-center"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQuantityChange(product.id, (selectedProduct?.quantity || 1) + 1)}
                                      disabled={(selectedProduct?.quantity || 1) >= product.stock}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Total: ${((selectedProduct?.quantity || 1) * product.price).toFixed(2)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        Página {currentPage} de {totalPages} ({filteredProducts.length} productos)
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Anterior
                        </Button>
                        
                        {/* Números de página */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen de Selección */}
          {selectedProducts.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <ShoppingCart className="h-5 w-5" />
                  Resumen de Selección
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{selectedProducts.length}</div>
                    <div className="text-sm text-green-700">Productos Seleccionados</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{totalSelected}</div>
                    <div className="text-sm text-blue-700">Total de Unidades</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">${totalValue.toFixed(2)}</div>
                    <div className="text-sm text-purple-700">Valor Total</div>
                  </div>
                </div>
                
                <div className="text-xs text-green-700 bg-green-100 p-3 rounded-lg">
                  <p className="font-medium">Productos seleccionados:</p>
                  <div className="mt-2 space-y-1">
                    {selectedProducts.map((sp) => (
                      <div key={sp.product.id} className="flex justify-between">
                        <span>{sp.product.name}</span>
                        <span className="font-medium">
                          {sp.quantity} x ${sp.product.price.toFixed(2)} = ${(sp.quantity * sp.product.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddSelectedProducts}
              disabled={selectedProducts.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar {selectedProducts.length > 0 ? `(${selectedProducts.length})` : ''} Productos
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Modal de Advertencia de Stock */}
      <Dialog open={showStockWarning} onOpenChange={setShowStockWarning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Advertencia de Stock
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium text-red-600">Stock insuficiente para algunos productos</p>
                <p className="text-sm text-red-600 mt-1">
                  Revisa las cantidades seleccionadas y ajusta según el stock disponible.
                </p>
              </AlertDescription>
            </Alert>
            
            <div className="text-xs text-gray-500 bg-red-50 p-3 rounded-lg">
              <p className="font-medium text-red-800">Productos con stock insuficiente:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-red-700">
                {selectedProducts
                  .filter(sp => sp.quantity > sp.product.stock)
                  .map((sp) => (
                    <li key={sp.product.id}>
                      {sp.product.name}: {sp.quantity} solicitados, {sp.product.stock} disponibles
                    </li>
                  ))}
              </ul>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowStockWarning(false)}
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
