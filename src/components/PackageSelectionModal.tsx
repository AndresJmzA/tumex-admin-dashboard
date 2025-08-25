import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { orderEquipmentService } from '@/services/orderEquipmentService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Plus, 
  Minus,
  Search,
  Filter,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Star,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/contexts/AuthContext';

interface Package {
  id: string;
  name: string;
  description: string;
  procedure_type: string;
  surgery_type: string;
  total_products: number;
  total_value: number;
  usage_count: number;
  last_used?: string;
  created_at: string;
  categories: PackageCategory[];
}

interface PackageCategory {
  name: string;
  display_name: string;
  products: PackageProduct[];
  total_quantity: number;
  total_value: number;
}

interface PackageProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  default_quantity: number;
  is_required: boolean;
  description?: string;
}

interface SelectedPackageProduct {
  product: PackageProduct;
  quantity: number;
  isSelected: boolean;
}

interface PackageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  existingProducts: string[]; // IDs de productos ya en la orden
  onPackageSelected: (selectedProducts: SelectedPackageProduct[]) => void;
}

export const PackageSelectionModal: React.FC<PackageSelectionModalProps> = ({
  isOpen,
  onClose,
  orderId,
  existingProducts,
  onPackageSelected
}) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedPackageProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcedureType, setSelectedProcedureType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showStockWarning, setShowStockWarning] = useState(false);
  
  const { hasRole } = usePermissions();

  // Verificar permisos del usuario
  const canEditEquipment = () => {
    return (
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_OPERATIVO) ||
      hasRole(UserRole.ADMINISTRADOR_GENERAL) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO)
    );
  };

  // Cargar paquetes desde Supabase
  useEffect(() => {
    const loadPackages = async () => {
      setIsLoading(true);
      try {
        const response = await orderEquipmentService.getAvailablePackages();
        // Obtener stock real por producto
        const availableProducts = await orderEquipmentService.getAvailableProducts();
        const stockMap = new Map<string, number>(
          (availableProducts || []).map(p => [p.id, p.stock_available])
        );

        const mapped: Package[] = (response.data || [])
          .filter(pkg => pkg && pkg.id && pkg.name && pkg.categories && Array.isArray(pkg.categories))
          .map(pkg => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description || 'Sin descripción',
            procedure_type: pkg.procedure_type || 'Tipo no especificado',
            surgery_type: pkg.surgery_type || 'Tipo no especificado',
            total_products: pkg.total_products || 0,
            total_value: pkg.total_value || 0,
            usage_count: 0,
            created_at: pkg.created_at || new Date().toISOString(),
            categories: pkg.categories
              .filter(cat => cat && cat.products && Array.isArray(cat.products))
              .map(cat => ({
                name: cat.name || 'General',
                display_name: cat.display_name || 'General',
                products: cat.products
                  .filter(p => p && p.product_id && p.product_name)
                  .map(p => ({
                    id: p.product_id,
                    name: p.product_name,
                    category: p.category || 'General',
                    price: p.price || 0,
                    stock: stockMap.get(p.product_id) ?? 0,
                    default_quantity: p.quantity || 1,
                    is_required: true,
                    description: ''
                  })),
                total_quantity: cat.total_quantity || 0,
                total_value: cat.total_value || 0
              }))
          }))
          .filter(pkg => pkg.categories.length > 0); // Solo paquetes con categorías válidas
        setPackages(mapped);
        setFilteredPackages(mapped);
      } catch (error) {
        console.error('Error loading packages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadPackages();
    }
  }, [isOpen]);

  // Filtrar paquetes
  useEffect(() => {
    let filtered = packages;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.procedure_type && pkg.procedure_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pkg.surgery_type && pkg.surgery_type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por tipo de procedimiento
    if (selectedProcedureType !== 'all') {
      filtered = filtered.filter(pkg => 
        pkg.procedure_type && 
        pkg.procedure_type.trim() !== '' && 
        pkg.procedure_type === selectedProcedureType
      );
    }

    setFilteredPackages(filtered);
  }, [packages, searchTerm, selectedProcedureType]);

  // Obtener tipos de procedimiento únicos (filtrando valores vacíos)
  const procedureTypes = ['all', ...Array.from(new Set(
    packages
      .map(p => p.procedure_type)
      .filter(type => type && type.trim() !== '' && type !== 'Tipo no especificado')
  ))];

  // Función para seleccionar un paquete
  const handlePackageSelection = (pkg: Package) => {
    setSelectedPackage(pkg);
    
    // Inicializar productos seleccionados con cantidades por defecto
    const initialSelected = pkg.categories.flatMap(category => 
      category.products.map(product => ({
        product,
        quantity: product.default_quantity,
        isSelected: true
      }))
    );
    
    setSelectedProducts(initialSelected);
  };

  // Función para actualizar cantidad de un producto
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    // Validar que sea un número entero no negativo
    if (newQuantity < 0 || !Number.isInteger(newQuantity) || isNaN(newQuantity)) {
      return;
    }
    
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
    return existingProducts.includes(productId);
  };

  // Función para verificar stock bajo (solo como advertencia informativa)
  // NOTA: El stock bajo no bloquea ninguna acción, solo informa al usuario
  const isLowStock = (stock: number) => {
    return stock <= 5;
  };

  // Función para verificar si hay stock insuficiente para la cantidad solicitada
  // NOTA: Esto se usa solo para mostrar advertencias, no para bloquear acciones
  const hasInsufficientStock = (requestedQuantity: number, availableStock: number) => {
    return requestedQuantity > availableStock;
  };

  // Función para agregar productos seleccionados
  const handleAddSelectedProducts = () => {
    const validProducts = selectedProducts.filter(sp => sp.quantity > 0);
    
    if (validProducts.length === 0) {
      alert('Por favor selecciona al menos un producto del paquete');
      return;
    }

    // Verificar stock insuficiente (solo como advertencia informativa)
    const productsWithInsufficientStock = validProducts.filter(sp => 
      hasInsufficientStock(sp.quantity, sp.product.stock)
    );
    
    if (productsWithInsufficientStock.length > 0) {
      // Mostrar advertencia pero permitir continuar
      setShowStockWarning(true);
      return;
    }

    // Si no hay problemas de stock, agregar directamente
    onPackageSelected(validProducts);
    onClose();
  };

  // Función para continuar agregando productos a pesar de la advertencia de stock
  const handleContinueWithStockWarning = () => {
    const validProducts = selectedProducts.filter(sp => sp.quantity > 0);
    
    // Agregar productos incluso con stock insuficiente (el usuario confirmó que quiere continuar)
    onPackageSelected(validProducts);
    setShowStockWarning(false);
    onClose();
  };

  // Función para limpiar selección
  const handleClearSelection = () => {
    setSelectedPackage(null);
    setSelectedProducts([]);
  };

  // Función para seleccionar todos los productos
  const handleSelectAllProducts = () => {
    if (!selectedPackage) return;
    
    const allSelected = selectedPackage.categories.flatMap(category => 
      category.products.map(product => ({
        product,
        quantity: product.default_quantity,
        isSelected: true
      }))
    );
    
    setSelectedProducts(allSelected);
  };

  // Función para deseleccionar todos los productos
  const handleDeselectAllProducts = () => {
    setSelectedProducts([]);
  };

  // Calcular total de productos seleccionados
  const totalSelected = selectedProducts.reduce((sum, sp) => sum + sp.quantity, 0);
  const totalValue = selectedProducts.reduce((sum, sp) => sum + (sp.product.price * sp.quantity), 0);

  // Agrupar productos por categoría
  const groupProductsByCategory = (products: PackageProduct[]) => {
    const grouped = products.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as Record<string, PackageProduct[]>);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Selección de Paquetes Predefinidos
          </DialogTitle>
          <DialogDescription>
            Explora y selecciona paquetes predefinidos para agregar a tu orden. Los productos están organizados por categorías con cantidades optimizadas para cada procedimiento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filtros y Búsqueda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Búsqueda */}
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar Paquetes</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Nombre, descripción o tipo de procedimiento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtro por Tipo de Procedimiento */}
                <div className="space-y-2">
                  <Label htmlFor="procedureType">Tipo de Procedimiento</Label>
                  <Select value={selectedProcedureType} onValueChange={setSelectedProcedureType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      {procedureTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type === 'all' ? 'Todos los tipos' : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Resumen de Filtros */}
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                <span className="font-medium">Resumen de filtros:</span> Mostrando {filteredPackages.length} de {packages.length} paquetes disponibles
                {searchTerm && (
                  <span className="block mt-1 text-blue-600">
                    🔍 Búsqueda: "{searchTerm}"
                  </span>
                )}
                {selectedProcedureType !== 'all' && (
                  <span className="block mt-1 text-green-600">
                    📋 Tipo: {selectedProcedureType}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Paquetes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Paquetes Disponibles
                <Badge variant="outline" className="ml-2">
                  {filteredPackages.length} paquete(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
                  <p className="text-gray-600 font-medium">Cargando paquetes disponibles...</p>
                  <p className="text-sm text-gray-500">Esto puede tomar unos segundos</p>
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No se encontraron paquetes</p>
                  <p className="text-sm text-gray-400">💡 Sugerencias:</p>
                  <ul className="text-xs text-gray-400 mt-2 space-y-1">
                    <li>• Intenta usar términos de búsqueda más generales</li>
                    <li>• Cambia el filtro de tipo de procedimiento</li>
                    <li>• Verifica que haya paquetes configurados en el sistema</li>
                  </ul>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`p-6 border rounded-lg transition-colors cursor-pointer hover:border-blue-300 hover:shadow-md ${
                        selectedPackage?.id === pkg.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => handlePackageSelection(pkg)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              {pkg.procedure_type}
                            </Badge>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              {pkg.surgery_type}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600">{pkg.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{pkg.total_products}</span>
                              <span className="text-gray-600">productos</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">${pkg.total_value.toFixed(2)}</span>
                              <span className="text-gray-600">valor</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{pkg.usage_count}</span>
                              <span className="text-gray-600">usos</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{pkg.last_used ? new Date(pkg.last_used).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            ${pkg.total_value.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">Valor del paquete</div>
                          <div className="mt-2">
                            <Star className="h-4 w-4 text-yellow-500 inline mr-1" />
                            <span className="text-sm text-gray-600">Recomendado</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalle del Paquete Seleccionado */}
          {selectedPackage && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Package className="h-5 w-5" />
                  Detalle del Paquete: {selectedPackage.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Información del Paquete */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedPackage.total_products}</div>
                    <div className="text-sm text-blue-700">Total de Productos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{totalSelected}</div>
                    <div className="text-sm text-green-700">Productos Seleccionados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">${totalValue.toFixed(2)}</div>
                    <div className="text-sm text-purple-700">Valor Total</div>
                  </div>
                </div>

                {/* Acciones de Selección */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllProducts}
                    className="text-xs"
                  >
                    Seleccionar Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAllProducts}
                    className="text-xs"
                  >
                    Limpiar Selección
                  </Button>
                </div>

                {/* Lista de Productos del Paquete */}
                <div className="space-y-4">
                  {selectedPackage.categories.map((category) => (
                    <div key={category.name} className="border rounded-lg overflow-hidden bg-white">
                      <div className="bg-gray-100 px-4 py-2 border-b">
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {category.display_name}
                          <Badge variant="outline" className="ml-auto">
                            {category.products.length} producto(s)
                          </Badge>
                        </h4>
                      </div>
                      
                      <div className="divide-y">
                        {category.products.map((product) => {
                          const selectedProduct = selectedProducts.find(sp => sp.product.id === product.id);
                          const isInOrder = isProductInOrder(product.id);
                          const lowStock = isLowStock(product.stock);

                          return (
                            <div 
                              key={product.id} 
                              className={`p-4 flex items-center justify-between ${
                                isInOrder ? 'opacity-60 bg-gray-50' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {/* Checkbox de selección */}
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`package-product-${product.id}`}
                                    checked={selectedProduct?.isSelected || false}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedProducts(prev => [
                                          ...prev.filter(sp => sp.product.id !== product.id),
                                          { product, quantity: product.default_quantity, isSelected: true }
                                        ]);
                                      } else {
                                        setSelectedProducts(prev => prev.filter(sp => sp.product.id !== product.id));
                                      }
                                    }}
                                    disabled={isInOrder}
                                  />
                                  <Label htmlFor={`package-product-${product.id}`} className="sr-only">
                                    Seleccionar {product.name}
                                  </Label>
                                </div>

                                {/* Información del producto */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-medium text-gray-900">{product.name}</h5>
                                    {product.is_required && (
                                      <Badge className="bg-red-100 text-red-800 text-xs">
                                        Requerido
                                      </Badge>
                                    )}
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
                                  </div>
                                  
                                  <p className="text-sm text-gray-600">{product.description}</p>
                                  
                                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                    <span>Cantidad por defecto: {product.default_quantity}</span>
                                    <span className={`font-medium ${lowStock ? 'text-red-600' : 'text-green-600'}`}>
                                      Stock: {product.stock}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {/* Controles de cantidad */}
                                {selectedProduct?.isSelected && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQuantityChange(product.id, (selectedProduct?.quantity || 1) - 1)}
                                      disabled={(selectedProduct?.quantity || 1) <= 0}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={selectedProduct?.quantity || 0}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        // Solo procesar si es un número válido
                                        if (value === '' || /^\d+$/.test(value)) {
                                          const numValue = value === '' ? 0 : parseInt(value);
                                          handleQuantityChange(product.id, numValue);
                                        }
                                      }}
                                      onKeyDown={(e) => {
                                        // Prevenir incremento/decremento con teclas de flecha
                                        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                          e.preventDefault();
                                        }
                                        // Solo permitir números, backspace, delete, tab, enter
                                        if (!/[\d\b\s\t\n]/.test(e.key) && !['Tab', 'Enter', 'Backspace', 'Delete'].includes(e.key)) {
                                          e.preventDefault();
                                        }
                                      }}
                                      className="w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      placeholder="0"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQuantityChange(product.id, (selectedProduct?.quantity || 1) + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                                
                                {/* Precio */}
                                <div className="text-right min-w-[80px]">
                                  <div className="font-medium text-gray-900">
                                    ${(product.price * (selectedProduct?.quantity || 0)).toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ${product.price.toFixed(2)} c/u
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen de Selección */}
                {selectedProducts.length > 0 && (
                  <div className="text-xs text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      <p className="font-medium text-gray-800">Resumen de productos seleccionados</p>
                      <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700">
                        {selectedProducts.length} producto(s)
                      </Badge>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedProducts.map((sp) => (
                        <div key={sp.product.id} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                          <span className="text-gray-700">{sp.product.name}</span>
                          <span className="font-medium text-blue-600">
                            {sp.quantity} x ${sp.product.price.toFixed(2)} = ${(sp.quantity * sp.product.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total seleccionado:</span>
                        <span className="font-bold text-lg text-blue-600">${totalValue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Package className="h-4 w-4 mr-2" />
              {selectedProducts.length === 0 
                ? 'Selecciona productos para continuar' 
                : `Agregar ${selectedProducts.length} producto${selectedProducts.length !== 1 ? 's' : ''} a la orden`
              }
            </Button>
          </div>
        </div>
      </DialogContent>

            {/* Modal de Advertencia de Stock */}
      <Dialog open={showStockWarning} onOpenChange={setShowStockWarning}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Advertencia de Stock
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex flex-col h-full">
            <Alert>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription>
                <p className="font-medium text-amber-700">⚠️ Advertencia de stock insuficiente</p>
                <p className="text-sm text-gray-600 mt-1">
                  Algunos productos seleccionados tienen cantidades solicitadas mayores al stock disponible. 
                  Esta información es solo para tu conocimiento y no impide continuar con la orden.
                </p>
              </AlertDescription>
            </Alert>
            
            <div className="text-xs text-gray-600 bg-amber-50 p-3 rounded-lg flex-1 overflow-hidden border border-amber-200">
              <p className="font-medium text-amber-800 mb-2">
                Productos con stock insuficiente ({selectedProducts.filter(sp => hasInsufficientStock(sp.quantity, sp.product.stock)).length} productos):
              </p>
              <div className="max-h-48 overflow-y-auto border border-amber-200 rounded p-2 bg-white">
                <ul className="space-y-1">
                  {selectedProducts
                    .filter(sp => hasInsufficientStock(sp.quantity, sp.product.stock))
                    .map((sp) => (
                      <li key={sp.product.id} className="flex justify-between items-center py-1 border-b border-amber-100 last:border-b-0">
                        <span className="font-medium text-gray-700">{sp.product.name}</span>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                          {sp.quantity} solicitados, {sp.product.stock} disponibles
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
              <p className="text-xs text-gray-600 mt-2 italic">
                💡 Recuerda: Esta advertencia es solo informativa. Puedes continuar agregando estos productos a la orden normalmente.
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowStockWarning(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                ← Volver a revisar
              </Button>
              <Button 
                onClick={handleContinueWithStockWarning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                ✅ Continuar con la orden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
