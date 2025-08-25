import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { orderEquipmentService } from '@/services/orderEquipmentService';
import { inventoryService } from '@/services/inventoryService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  Plus, 
  Trash2, 
  Package, 
  DollarSign, 
  AlertTriangle,
  Edit,
  Save,
  X,
  FileText,
  ShoppingCart,
  Phone,
  User,
  Calendar,
  Clock,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

// Tipos para equipos de orden
interface OrderEquipment {
  // lineId se usa para identificar la línea en UI
  id: string; // Deprecated: mantener por compatibilidad en UI existente
  lineId?: string;
  // productId referencia a Products.id en BD
  productId?: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  notes: string;
  confirmed: boolean;
  isFromPackage: boolean;
  packageId?: string;
}

// Tipos para paquetes predefinidos
interface EquipmentPackage {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  equipment: OrderEquipment[];
}

// Tipos para productos disponibles
interface AvailableProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stockAvailable: number;
  stockWarning: boolean;
}

interface OrderEquipmentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipment: OrderEquipment[]) => void;
  onSaveAndContinue?: (equipment: OrderEquipment[]) => void;
  orderId: string;
  orderNumber: string;
  doctorName: string;
  surgeryDate: string;
  surgeryTime: string;
  initialEquipment?: OrderEquipment[];
}

const OrderEquipmentEditor: React.FC<OrderEquipmentEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveAndContinue,
  orderId,
  orderNumber,
  doctorName,
  surgeryDate,
  surgeryTime,
  initialEquipment = []
}) => {
  const { toast } = useToast();
  
  // Estados principales
  const [equipment, setEquipment] = useState<OrderEquipment[]>(initialEquipment);

  // Sincronizar cuando cambian los equipos iniciales (por ejemplo, tras guardar y reabrir)
  useEffect(() => {
    setEquipment(initialEquipment);
  }, [initialEquipment]);
  const [availableProducts, setAvailableProducts] = useState<AvailableProduct[]>([]);
  const [availablePackages, setAvailablePackages] = useState<EquipmentPackage[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  
  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [showPackageSelection, setShowPackageSelection] = useState(false);
  
  // Estados para autocompletado
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<AvailableProduct[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // Estados para categorías
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Estados para selección de paquetes
  const [surgeryTypes, setSurgeryTypes] = useState<Array<{id: string, name: string}>>([]);
  const [procedures, setProcedures] = useState<Array<{id: string, name: string, surgery_type_id: string}>>([]);
  const [selectedSurgeryType, setSelectedSurgeryType] = useState<string>('');
  const [selectedProcedure, setSelectedProcedure] = useState<string>('');
  const [filteredPackages, setFilteredPackages] = useState<EquipmentPackage[]>([]);
  const [loadingSurgeryTypes, setLoadingSurgeryTypes] = useState(false);
  const [loadingProcedures, setLoadingProcedures] = useState(false);
  const [loadingFilteredPackages, setLoadingFilteredPackages] = useState(false);
  
  // Estados para edición
  const [editingEquipment, setEditingEquipment] = useState<OrderEquipment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Estados para warnings
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);

  // Cargar productos disponibles
  const loadAvailableProducts = async () => {
    setLoadingProducts(true);
    try {
      // Intentar cargar desde orderEquipmentService primero
      let products = await orderEquipmentService.getAvailableProducts();
      
      // Si no hay productos, intentar desde inventoryService
      if (!products || products.length === 0) {
        console.log('No products from orderEquipmentService, trying inventoryService...');
        const inventoryProducts = await inventoryService.getProducts({ limit: 100 });
        products = inventoryProducts.data.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          stock_available: product.stock,
          stock_warning: product.stock < 5
        }));
      }
      
      // Transformar datos del servicio al formato del componente
      const transformedProducts: AvailableProduct[] = products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stockAvailable: product.stock_available,
        stockWarning: product.stock_warning
      }));
      
      setAvailableProducts(transformedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los productos disponibles. Verifica la configuración de Supabase.",
        variant: "destructive"
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Cargar tipos de cirugía
  const loadSurgeryTypes = async () => {
    setLoadingSurgeryTypes(true);
    try {
      const surgeryTypesData = await orderEquipmentService.getSurgeryTypes();
      setSurgeryTypes(surgeryTypesData);
    } catch (error) {
      console.error('Error loading surgery types:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los tipos de cirugía.",
        variant: "destructive"
      });
    } finally {
      setLoadingSurgeryTypes(false);
    }
  };

  // Cargar procedimientos por tipo de cirugía
  const loadProcedures = async (surgeryTypeId?: string) => {
    setLoadingProcedures(true);
    try {
      const proceduresData = await orderEquipmentService.getProceduresBySurgeryType(surgeryTypeId);
      setProcedures(proceduresData);
    } catch (error) {
      console.error('Error loading procedures:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los procedimientos.",
        variant: "destructive"
      });
    } finally {
      setLoadingProcedures(false);
    }
  };

  // Cargar paquetes por procedimiento
  const loadPackagesByProcedure = async (procedureId: string) => {
    setLoadingFilteredPackages(true);
    try {
      const packagesData = await orderEquipmentService.getPackagesByProcedure(procedureId);
      
      // Transformar datos del servicio al formato del componente
      const transformedPackages: EquipmentPackage[] = packagesData.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        category: pkg.category,
        price: pkg.price,
        equipment: pkg.equipment.map(eq => ({
          id: eq.product_id,
          name: eq.product_name,
          category: eq.category,
          quantity: eq.quantity,
          price: eq.price,
          notes: '',
          confirmed: false,
          isFromPackage: true,
          packageId: pkg.id
        }))
      }));
      
      setFilteredPackages(transformedPackages);
    } catch (error) {
      console.error('Error loading packages by procedure:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los paquetes del procedimiento.",
        variant: "destructive"
      });
    } finally {
      setLoadingFilteredPackages(false);
    }
  };

  // Cargar paquetes predefinidos (mantener para compatibilidad)
  const loadAvailablePackages = async () => {
    setLoadingPackages(true);
    try {
      const packagesResponse = await orderEquipmentService.getAvailablePackages();
      
      // Transformar datos del servicio al formato del componente
      const transformedPackages: EquipmentPackage[] = packagesResponse.data.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        category: pkg.category,
        price: pkg.price,
        equipment: pkg.equipment.map(eq => ({
          id: eq.product_id,
          name: eq.product_name,
          category: eq.category,
          quantity: eq.quantity,
          price: eq.price,
          notes: '',
          confirmed: false,
          isFromPackage: true,
          packageId: pkg.id
        }))
      }));
      
      setAvailablePackages(transformedPackages);
    } catch (error) {
      console.error('Error loading packages:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar los paquetes disponibles.",
        variant: "destructive"
      });
    } finally {
      setLoadingPackages(false);
    }
  };

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadAvailableProducts();
      loadAvailablePackages();
      loadSurgeryTypes();
      loadCategories();
    }
  }, [isOpen]);

  // Manejar cambio de tipo de cirugía
  const handleSurgeryTypeChange = (surgeryTypeId: string) => {
    setSelectedSurgeryType(surgeryTypeId);
    setSelectedProcedure('');
    setFilteredPackages([]);
    
    if (surgeryTypeId) {
      loadProcedures(surgeryTypeId);
    } else {
      setProcedures([]);
    }
  };

  // Manejar cambio de procedimiento
  const handleProcedureChange = (procedureId: string) => {
    setSelectedProcedure(procedureId);
    
    if (procedureId) {
      loadPackagesByProcedure(procedureId);
    } else {
      setFilteredPackages([]);
    }
  };

  // Limpiar estados al cerrar el modal de paquetes
  const handleClosePackageSelection = () => {
    setShowPackageSelection(false);
    setSelectedSurgeryType('');
    setSelectedProcedure('');
    setFilteredPackages([]);
    setProcedures([]);
  };

  // Función para generar sugerencias basadas en la búsqueda
  const generateSuggestions = (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = availableProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(query.toLowerCase()) ||
                           product.category.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    setSuggestions(filtered.slice(0, 8)); // Limitar a 8 sugerencias
    setShowSuggestions(filtered.length > 0);
    setSelectedSuggestionIndex(-1);
  };

  // Manejar cambios en la búsqueda con debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    generateSuggestions(value);
  };

  // Manejar navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          addEquipment(suggestions[selectedSuggestionIndex]);
          setSearchQuery('');
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Seleccionar sugerencia con clic
  const handleSuggestionClick = (product: AvailableProduct) => {
    addEquipment(product);
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setIsInputFocused(false);
  };

  // Limpiar estados al cerrar el modal de productos
  const handleCloseProductSelection = () => {
    setShowProductSelection(false);
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setSuggestions([]);
    setIsInputFocused(false);
  };

  // Agregar equipo individual
  const addEquipment = (product: AvailableProduct) => {
    const newEquipment: OrderEquipment = {
      id: `temp_${Date.now()}`,
      lineId: `temp_${Date.now()}`,
      productId: product.id,
      name: product.name,
      category: product.category,
      quantity: 1,
      price: product.price,
      notes: '',
      confirmed: false,
      isFromPackage: false
    };
    
    setEquipment(prev => [...prev, newEquipment]);
    setShowProductSelection(false);
    
    toast({
      title: "✅ Equipo Agregado",
      description: `${product.name} ha sido agregado a la orden.`,
    });
  };

  // Aplicar paquete
  const applyPackage = (packageData: EquipmentPackage) => {
    // Remover equipos existentes del mismo paquete
    const filteredEquipment = equipment.filter(eq => eq.packageId !== packageData.id);
    
    // Agregar equipos del paquete
    const packageEquipment = packageData.equipment.map(eq => ({
      ...eq,
      productId: eq.productId || eq.id,
      lineId: `temp_${Date.now()}_${Math.random()}`,
      id: `temp_${Date.now()}_${Math.random()}`,
      packageId: packageData.id
    }));
    
    setEquipment([...filteredEquipment, ...packageEquipment]);
    setShowPackageSelection(false);
    
    toast({
      title: "✅ Paquete Aplicado",
      description: `Paquete "${packageData.name}" ha sido aplicado a la orden.`,
    });
  };

  // Remover equipo
  const removeEquipment = (equipmentId: string) => {
    setEquipment(prev => prev.filter(eq => (eq.lineId || eq.id) !== equipmentId));
    
    toast({
      title: "🗑️ Equipo Removido",
      description: "El equipo ha sido removido de la orden.",
    });
  };

  // Actualizar cantidad
  const updateEquipmentQuantity = (equipmentId: string, quantity: number) => {
    if (quantity <= 0) {
      removeEquipment(equipmentId);
      return;
    }
    
    setEquipment(prev => prev.map(eq => 
      (eq.lineId || eq.id) === equipmentId ? { ...eq, quantity } : eq
    ));
  };

  // Actualizar notas
  const updateEquipmentNotes = (equipmentId: string, notes: string) => {
    setEquipment(prev => prev.map(eq => 
      (eq.lineId || eq.id) === equipmentId ? { ...eq, notes } : eq
    ));
  };

  // Actualizar confirmación
  const updateEquipmentConfirmation = (equipmentId: string, confirmed: boolean) => {
    setEquipment(prev => prev.map(eq => 
      (eq.lineId || eq.id) === equipmentId ? { ...eq, confirmed } : eq
    ));
  };

  // Calcular precio total
  const calculateTotalPrice = () => {
    return equipment.reduce((total, eq) => total + (eq.price * eq.quantity), 0);
  };

  // Validar stock
  const validateStock = () => {
    const warnings: string[] = [];
    
    equipment.forEach(eq => {
      const product = availableProducts.find(p => p.name === eq.name);
      if (product && eq.quantity > product.stockAvailable) {
        warnings.push(`${eq.name}: Cantidad solicitada (${eq.quantity}) excede stock disponible (${product.stockAvailable})`);
      }
    });
    
    setStockWarnings(warnings);
    return warnings.length === 0;
  };

  // Guardar cambios
  const handleSave = () => {
    if (!validateStock()) {
      toast({
        title: "⚠️ Advertencias de Stock",
        description: "Algunos equipos exceden el stock disponible.",
        variant: "destructive"
      });
      return;
    }
    
    onSave(equipment);
    
    toast({
      title: "✅ Cambios Guardados",
      description: "Los equipos de la orden han sido actualizados.",
    });
    
    onClose();
  };

  // Cancelar
  const handleCancel = () => {
    setEquipment(initialEquipment);
    onClose();
  };

  // Obtener productos filtrados
  const filteredProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cargar categorías desde el servicio
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const categoriesData = await inventoryService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron cargar las categorías.",
        variant: "destructive"
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  // Obtener color de categoría
  const getCategoryColor = (category: string) => {
    const colors = {
      'Equipo': 'bg-blue-100 text-blue-800',
      'Consumible': 'bg-green-100 text-green-800',
      'Instrumental': 'bg-purple-100 text-purple-800',
      'Endoscopio': 'bg-indigo-100 text-indigo-800',
      'Cable/Conector': 'bg-teal-100 text-teal-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  // Obtener información del estado del producto
  const getProductStatus = (product: AvailableProduct) => {
    if (product.stockAvailable === 0) {
      return {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        tooltip: "Sin stock disponible - Se puede agregar pero requiere atención",
        disabled: false
      };
    }
    
    if (product.stockWarning) {
      return {
        icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
        tooltip: `Stock bajo (${product.stockAvailable} unidades) - Considerar reabastecimiento`,
        disabled: false
      };
    }
    
    if (product.stockAvailable > 10) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        tooltip: `Stock disponible: ${product.stockAvailable} unidades`,
        disabled: false
      };
    }
    
    return {
      icon: <Info className="h-4 w-4 text-blue-500" />,
      tooltip: `Stock disponible: ${product.stockAvailable} unidades`,
      disabled: false
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Editar Equipos de la Orden
          </DialogTitle>
          <DialogDescription>
            Gestiona los equipos y productos asociados a esta orden de servicio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la orden */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de la Orden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Orden:</span>
                  <span>{orderNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Doctor:</span>
                  <span>{doctorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Fecha:</span>
                  <span>{new Date(surgeryDate).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Hora:</span>
                  <span>{surgeryTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipos actuales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Equipos Actuales ({equipment.length})
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProductSelection(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Individual
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPackageSelection(true)}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Seleccionar Paquete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {equipment.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2" />
                  <p>No hay equipos seleccionados</p>
                  <p className="text-sm">Agrega equipos individuales o selecciona un paquete</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Advertencia de productos sin stock */}
                  {(() => {
                    const productsWithoutStock = equipment.filter(eq => {
                      const originalProduct = availableProducts.find(p => p.name === eq.name);
                      return originalProduct && originalProduct.stockAvailable === 0;
                    });
                    
                    if (productsWithoutStock.length > 0) {
                      return (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">Advertencia de Stock</span>
                          </div>
                          <p className="text-sm text-red-600 mt-1">
                            {productsWithoutStock.length} producto{productsWithoutStock.length > 1 ? 's' : ''} sin stock disponible: {productsWithoutStock.map(eq => eq.name).join(', ')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {equipment.map((eq) => (
                    <div key={eq.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                      (() => {
                        const originalProduct = availableProducts.find(p => p.name === eq.name);
                        return originalProduct && originalProduct.stockAvailable === 0 ? 'border-red-300 bg-red-50' : '';
                      })()
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{eq.name}</span>
                          {(() => {
                            const originalProduct = availableProducts.find(p => p.name === eq.name);
                            if (originalProduct && originalProduct.stockAvailable === 0) {
                              return (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Sin stock disponible</p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            }
                            return null;
                          })()}
                          <Badge variant="outline" className={getCategoryColor(eq.category)}>
                            {eq.category}
                          </Badge>
                          {eq.isFromPackage && (
                            <Badge variant="secondary" className="text-xs">
                              Paquete
                            </Badge>
                          )}
                          {eq.confirmed && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Confirmado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>Cantidad: {eq.quantity}</span>
                          <span>Precio: ${eq.price.toLocaleString()}</span>
                          <span>Total: ${(eq.price * eq.quantity).toLocaleString()}</span>
                          {eq.notes && <span>Notas: {eq.notes}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingEquipment(eq);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeEquipment(eq.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumen y total */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span>Equipos: {equipment.length}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>Confirmados: {equipment.filter(eq => eq.confirmed).length}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>Pendientes: {equipment.filter(eq => !eq.confirmed).length}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${calculateTotalPrice().toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warnings de stock */}
          {stockWarnings.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Advertencias de Stock</span>
                </div>
                <ul className="text-sm text-orange-700 space-y-1">
                  {stockWarnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
            {onSaveAndContinue && (
              <Button 
                onClick={() => onSaveAndContinue(equipment)} 
                className="bg-green-600 hover:bg-green-700"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Guardar y Continuar
              </Button>
            )}
          </div>
        </div>

        {/* Modal de selección de productos */}
        {showProductSelection && (
          <Dialog open={showProductSelection} onOpenChange={handleCloseProductSelection}>
            <DialogContent className="max-w-2xl h-[600px] flex flex-col">
              <DialogHeader>
                <DialogTitle>Agregar Equipo Individual</DialogTitle>
                <DialogDescription>
                  Selecciona productos individuales para agregar a la orden.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Filtros */}
                <div className="flex gap-2 flex-shrink-0">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        setIsInputFocused(true);
                        if (searchQuery.trim()) {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        setIsInputFocused(false);
                        // Delay más largo para permitir clics en sugerencias
                        setTimeout(() => {
                          if (!isInputFocused) {
                            setShowSuggestions(false);
                          }
                        }, 300);
                      }}
                    />
                    
                    {/* Sugerencias de autocompletado */}
                    {showSuggestions && suggestions.length > 0 && isInputFocused && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                        <TooltipProvider>
                          {suggestions.map((product, index) => {
                            const status = getProductStatus(product);
                            return (
                              <div
                                key={product.id}
                                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                                  index === selectedSuggestionIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                } ${product.stockAvailable === 0 ? 'border-l-4 border-red-500 bg-red-50' : ''}`}
                                onClick={() => handleSuggestionClick(product)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{product.name}</span>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          {status.icon}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{status.tooltip}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Badge variant="outline" className={getCategoryColor(product.category)}>
                                        {product.category}
                                      </Badge>
                                      <span>Stock: {product.stockAvailable}</span>
                                      <span>Precio: ${product.price.toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <Plus className={`h-4 w-4 ${product.stockAvailable === 0 ? 'text-red-400' : 'text-gray-400'}`} />
                                </div>
                              </div>
                            );
                          })}
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      generateSuggestions(searchQuery); // Regenerar sugerencias al cambiar categoría
                    }}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={loadingCategories ? "Cargando..." : "Todas las categorías"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                                                {/* Estadísticas de productos */}
                {!loadingProducts && availableProducts.length > 0 && (
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-4">
                      {(() => {
                        const filteredProducts = availableProducts.filter(product => {
                          const matchesSearch = !searchQuery || 
                            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
                          return matchesSearch && matchesCategory;
                        });
                        return (
                          <>
                            <span>Mostrando: {filteredProducts.length} de {availableProducts.length} productos</span>
                            <span>Disponibles: {filteredProducts.filter(p => p.stockAvailable > 0).length}</span>
                            <span>Sin stock: {filteredProducts.filter(p => p.stockAvailable === 0).length}</span>
                            <span>Stock bajo: {filteredProducts.filter(p => p.stockWarning && p.stockAvailable > 0).length}</span>
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Disponible</span>
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span>Stock bajo</span>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Sin stock</span>
                    </div>
                  </div>
                )}

                {/* Lista de productos (siempre mostrar todos los productos) */}
                <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                  {loadingProducts ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p>Cargando productos...</p>
                    </div>
                  ) : availableProducts.length > 0 ? (
                    <TooltipProvider>
                      {availableProducts
                        .filter(product => {
                          const matchesSearch = !searchQuery || 
                            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
                          return matchesSearch && matchesCategory;
                        })
                        .map(product => {
                        const status = getProductStatus(product);
                        return (
                          <div
                            key={product.id}
                            className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 ${
                              product.stockAvailable === 0 ? 'border-red-300 bg-red-50' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{product.name}</span>
                                <Tooltip>
                                  <TooltipTrigger>
                                    {status.icon}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{status.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Badge variant="outline" className={getCategoryColor(product.category)}>
                                  {product.category}
                                </Badge>
                                <span>Stock: {product.stockAvailable}</span>
                                <span>Precio: ${product.price.toLocaleString()}</span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addEquipment(product)}
                              variant={product.stockAvailable === 0 ? "destructive" : "default"}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </TooltipProvider>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2" />
                      <p>No hay productos disponibles</p>
                      <p className="text-sm">Verifica la conexión con la base de datos</p>
                    </div>
                  )}
                </div>

              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de selección de paquetes */}
        {showPackageSelection && (
          <Dialog open={showPackageSelection} onOpenChange={handleClosePackageSelection}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Seleccionar Paquete</DialogTitle>
                <DialogDescription>
                  Selecciona el tipo de cirugía y procedimiento para ver los paquetes disponibles.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Dropdowns de selección */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSurgeryType('');
                        setSelectedProcedure('');
                        setFilteredPackages([]);
                        setProcedures([]);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpiar Selección
                    </Button>
                  </div>
                  <div>
                    <Label htmlFor="surgery-type">Tipo de Cirugía</Label>
                    <Select 
                      value={selectedSurgeryType} 
                      onValueChange={handleSurgeryTypeChange}
                      disabled={loadingSurgeryTypes}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingSurgeryTypes ? "Cargando..." : "Selecciona un tipo de cirugía"} />
                      </SelectTrigger>
                      <SelectContent>
                        {surgeryTypes.map(surgeryType => (
                          <SelectItem key={surgeryType.id} value={surgeryType.id}>
                            {surgeryType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="procedure">Procedimiento</Label>
                    <Select 
                      value={selectedProcedure} 
                      onValueChange={handleProcedureChange}
                      disabled={!selectedSurgeryType || loadingProcedures}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedSurgeryType 
                            ? "Primero selecciona un tipo de cirugía" 
                            : loadingProcedures 
                              ? "Cargando..." 
                              : "Selecciona un procedimiento"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {procedures.map(procedure => (
                          <SelectItem key={procedure.id} value={procedure.id}>
                            {procedure.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Paquetes disponibles */}
                {!selectedSurgeryType && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>Selecciona un tipo de cirugía para comenzar</p>
                  </div>
                )}
                
                {!selectedProcedure && selectedSurgeryType && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>Selecciona un procedimiento para ver los paquetes disponibles</p>
                  </div>
                )}
                
                {selectedProcedure && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Paquetes Disponibles</h3>
                      {loadingFilteredPackages && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Cargando paquetes...
                        </div>
                      )}
                    </div>
                    
                    {filteredPackages.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto">
                        <Accordion type="multiple" className="space-y-2">
                          {filteredPackages.map((packageData, index) => (
                          <AccordionItem 
                            key={packageData.id} 
                            value={`package-${index}`}
                            className="border rounded-lg"
                          >
                            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center gap-3">
                                  <Package className="h-5 w-5 text-blue-600" />
                                  <div className="text-left">
                                    <div className="font-medium">{packageData.name}</div>
                                    <div className="text-sm text-gray-600">{packageData.description}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600">
                                    ${packageData.price.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {packageData.equipment.length} equipos
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
                                  <div>Equipo</div>
                                  <div>Cantidad</div>
                                  <div>Precio</div>
                                </div>
                                {packageData.equipment.map(eq => (
                                  <div key={eq.id} className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className={getCategoryColor(eq.category)}>
                                        {eq.category}
                                      </Badge>
                                      <span>{eq.name}</span>
                                    </div>
                                    <div className="text-center">{eq.quantity}</div>
                                    <div className="text-right">${(eq.price * eq.quantity).toLocaleString()}</div>
                                  </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                  <div className="text-sm text-gray-600">
                                    Total del paquete: <span className="font-semibold">${packageData.price.toLocaleString()}</span>
                                  </div>
                                  <Button
                                    onClick={() => applyPackage(packageData)}
                                    size="sm"
                                  >
                                    <Package className="h-4 w-4 mr-2" />
                                    Aplicar Paquete
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="h-8 w-8 mx-auto mb-2" />
                        <p>No hay paquetes disponibles para este procedimiento</p>
                        <p className="text-sm">Selecciona otro procedimiento o agrega equipos individuales</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de edición de equipo */}
        {showEditModal && editingEquipment && (
          <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Equipo</DialogTitle>
                <DialogDescription>
                  Modifica los detalles del equipo seleccionado.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Nombre</Label>
                  <div className="font-medium">{editingEquipment.name}</div>
                </div>
                
                <div>
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingEquipment.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      updateEquipmentQuantity(editingEquipment.lineId || editingEquipment.id, newQuantity);
                    }}
                  />
                </div>
                
                <div>
                  <Label>Notas</Label>
                  <Textarea
                    value={editingEquipment.notes}
                    onChange={(e) => updateEquipmentNotes(editingEquipment.lineId || editingEquipment.id, e.target.value)}
                    placeholder="Notas adicionales..."
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="confirmed"
                    checked={editingEquipment.confirmed}
                    onCheckedChange={(checked) => 
                      updateEquipmentConfirmation(editingEquipment.lineId || editingEquipment.id, checked as boolean)
                    }
                  />
                  <Label htmlFor="confirmed">Confirmado por el doctor</Label>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setShowEditModal(false)}>
                    Guardar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderEquipmentEditor; 