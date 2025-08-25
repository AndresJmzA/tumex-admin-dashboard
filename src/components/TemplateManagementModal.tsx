import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/supabaseClient';
import { 
  FileText, 
  Search, 
  Package, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Eye,
  Edit,
  Plus,
  Copy,
  Download,
  Printer,
  ArrowLeft,
  ArrowRight,
  Filter,
  X,
  Save,
  Upload,
  QrCode,
  Barcode,
  ClipboardList,
  Truck,
  Box,
  Settings,
  Calendar,
  User,
  MapPin,
  Clock,
  DollarSign,
  CheckSquare,
  Square
} from 'lucide-react';

// Tipos para plantillas temporales (NO se guardan en BD)
interface TemporaryTemplate {
  id: string;
  orderId: string;
  baseTemplateId?: string; // Si se usó como base
  type: 'entrada' | 'salida' | 'mixta';
  products: TemplateProduct[];
  generatedBy: string;
  generatedAt: string;
  status: 'draft' | 'ready' | 'approved';
  notes: string;
  printFormat: 'digital' | 'printed';
  includeBarcodes: boolean;
  includeQR: boolean;
  orderInfo: {
    orderNumber: string;
    customer: string;
    patientName: string;
    surgery: string;
    surgeryDate: string;
    surgeryTime: string;
    location: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface TemplateProduct {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  action: 'entrada' | 'salida';
  notes?: string;
  available: number;
  status: 'available' | 'low_stock' | 'out_of_stock';
  location: string;
}

// Tipos para templates de BD (solo lectura)
interface DatabaseTemplate {
  id: string;
  name: string;
  description: string;
  procedure_id: string;
  procedure_name?: string;
  surgery_type_id?: string;
  surgery_type_name?: string;
  products: TemplateProduct[];
}

interface TemplateManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    customer: string;
    patientName: string;
    surgery: string;
    surgeryDate: string;
    surgeryTime: string;
    location: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    equipment: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      price: number;
    }>;
  };
  onGenerate: (template: TemporaryTemplate) => void;
}

const TemplateManagementModal: React.FC<TemplateManagementModalProps> = ({
  isOpen,
  onClose,
  order,
  onGenerate
}) => {
  const { toast } = useToast();
  
  // Estados principales
  const [creationMode, setCreationMode] = useState<'from_scratch' | 'use_template'>('from_scratch');
  const [currentStep, setCurrentStep] = useState(1);
  const [templateType, setTemplateType] = useState<'entrada' | 'salida' | 'mixta'>('mixta');
  const [printFormat, setPrintFormat] = useState<'digital' | 'printed'>('digital');
  const [includeBarcodes, setIncludeBarcodes] = useState(true);
  const [includeQR, setIncludeQR] = useState(true);
  const [notes, setNotes] = useState<string>('');
  
  // Estados para productos
  const [selectedProducts, setSelectedProducts] = useState<TemplateProduct[]>([]);
  const [availableProducts, setAvailableProducts] = useState<TemplateProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Estados para templates de BD
  const [databaseTemplates, setDatabaseTemplates] = useState<DatabaseTemplate[]>([]);
  const [selectedBaseTemplate, setSelectedBaseTemplate] = useState<DatabaseTemplate | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadDatabaseTemplates();
      loadAvailableProducts();
      initializeFromOrder();
    }
  }, [isOpen]);

  // Inicializar productos desde la orden
  const initializeFromOrder = () => {
    const orderProducts: TemplateProduct[] = order.equipment.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      action: 'entrada' as const,
      available: Math.floor(Math.random() * 10) + 1, // Mock data
      status: 'available' as const,
      location: 'Almacén Principal',
      notes: ''
    }));
    setSelectedProducts(orderProducts);
  };

  // Cargar templates de la base de datos (solo lectura)
  const loadDatabaseTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const { data, error } = await supabase
        .from('Templates')
        .select(`
          *,
          Procedures(name),
          SurgeryTypes(name)
        `)
        .order('name');
      
      if (error) throw error;

      const processedTemplates = (data || []).map(template => ({
        ...template,
        procedure_name: template.Procedures?.name,
        surgery_type_name: template.SurgeryTypes?.name,
        products: [] // Se cargarán cuando se seleccione
      }));

      setDatabaseTemplates(processedTemplates);
    } catch (err) {
      console.error('Error cargando templates:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los templates de la base de datos",
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Cargar productos disponibles del inventario
  const loadAvailableProducts = async () => {
    try {
      setLoadingProducts(true);
      // Mock data - en producción vendría de Supabase
      const mockProducts: TemplateProduct[] = [
        {
          id: '1',
          name: 'Endoscopio Flexible',
          category: 'Endoscopio',
          quantity: 1,
          price: 5000,
          action: 'entrada',
          available: 3,
          status: 'available',
          location: 'Almacén Principal',
          notes: ''
        },
        {
          id: '2',
          name: 'Cable de Conexión',
          category: 'Cable/Conector',
          quantity: 2,
          price: 150,
          action: 'entrada',
          available: 15,
          status: 'available',
          location: 'Almacén Principal',
          notes: ''
        },
        {
          id: '3',
          name: 'Bisturí Eléctrico',
          category: 'Instrumental',
          quantity: 1,
          price: 1200,
          action: 'entrada',
          available: 2,
          status: 'low_stock',
          location: 'Almacén Principal',
          notes: ''
        },
        {
          id: '4',
          name: 'Gasas Estériles',
          category: 'Consumible',
          quantity: 10,
          price: 25,
          action: 'entrada',
          available: 50,
          status: 'available',
          location: 'Almacén Principal',
          notes: ''
        },
        {
          id: '5',
          name: 'Monitor de Presión',
          category: 'Equipo',
          quantity: 1,
          price: 3000,
          action: 'entrada',
          available: 1,
          status: 'low_stock',
          location: 'Almacén Principal',
          notes: ''
        }
      ];

      setAvailableProducts(mockProducts);
    } catch (err) {
      console.error('Error cargando productos:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos del inventario",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Manejar selección de template como base
  const handleUseTemplate = (template: DatabaseTemplate) => {
    setSelectedBaseTemplate(template);
    // Cargar productos del template (mock data)
    const templateProducts: TemplateProduct[] = [
      {
        id: '1',
        name: 'Endoscopio Flexible',
        category: 'Endoscopio',
        quantity: 1,
        price: 5000,
        action: 'entrada',
        available: 3,
        status: 'available',
        location: 'Almacén Principal',
        notes: 'Producto del template base'
      },
      {
        id: '2',
        name: 'Cable de Conexión',
        category: 'Cable/Conector',
        quantity: 2,
        price: 150,
        action: 'entrada',
        available: 15,
        status: 'available',
        location: 'Almacén Principal',
        notes: 'Producto del template base'
      }
    ];
    setSelectedProducts(templateProducts);
    setCurrentStep(2);
  };

  // Agregar producto a la plantilla
  const handleAddProduct = (product: TemplateProduct) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      toast({
        title: "Producto ya agregado",
        description: "Este producto ya está en la plantilla",
        variant: "destructive",
      });
      return;
    }

    setSelectedProducts(prev => [...prev, { ...product, action: 'entrada' as const }]);
  };

  // Remover producto de la plantilla
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Actualizar producto en la plantilla
  const handleUpdateProduct = (productId: string, updates: Partial<TemplateProduct>) => {
    setSelectedProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, ...updates }
          : product
      )
    );
  };

  // Filtrar productos disponibles
  const filteredAvailableProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const notSelected = !selectedProducts.find(p => p.id === product.id);
    
    return matchesSearch && matchesCategory && notSelected;
  });

  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(availableProducts.map(p => p.category)))];

  // Calcular total de la plantilla
  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      if (product.action === 'entrada') {
        return total + (product.price * product.quantity);
      } else {
        return total - (product.price * product.quantity);
      }
    }, 0);
  };

  // Generar plantilla temporal
  const handleGenerateTemplate = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar al menos un producto a la plantilla",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const template: TemporaryTemplate = {
        id: `TPL-${Date.now()}`,
        orderId: order.id,
        baseTemplateId: selectedBaseTemplate?.id,
        type: templateType,
        products: selectedProducts,
        generatedBy: 'Jefe de Almacén', // TODO: Obtener del contexto de autenticación
        generatedAt: new Date().toISOString(),
        status: 'ready',
        notes: notes.trim(),
        printFormat,
        includeBarcodes,
        includeQR,
        orderInfo: {
          orderNumber: order.orderNumber,
          customer: order.customer,
          patientName: order.patientName,
          surgery: order.surgery,
          surgeryDate: order.surgeryDate,
          surgeryTime: order.surgeryTime,
          location: order.location,
          priority: order.priority
        }
      };

      await onGenerate(template);
      toast({
        title: "Plantilla generada",
        description: "La plantilla ha sido generada exitosamente.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar la plantilla. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear estado al cerrar
  const handleClose = () => {
    setCreationMode('from_scratch');
    setCurrentStep(1);
    setSelectedProducts([]);
    setSelectedBaseTemplate(null);
    setSearchQuery('');
    setSelectedCategory('all');
    setNotes('');
    setShowPreview(false);
    onClose();
  };

  // Obtener texto del tipo de plantilla
  const getTemplateTypeText = (type: string) => {
    switch (type) {
      case 'entrada': return 'Entrada de Equipos';
      case 'salida': return 'Salida de Equipos';
      case 'mixta': return 'Entrada y Salida';
      default: return type;
    }
  };

  // Obtener color del tipo de plantilla
  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'entrada': return 'bg-green-100 text-green-800';
      case 'salida': return 'bg-red-100 text-red-800';
      case 'mixta': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Gestión de Plantillas - Orden {order.orderNumber}</span>
            <Badge variant="outline">{order.priority}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo: Información de la orden y configuración */}
          <div className="space-y-6">
            {/* Información de la orden */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Información de la Orden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Cliente:</span>
                    <span className="text-gray-600">{order.customer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Paciente:</span>
                    <span className="text-gray-600">{order.patientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Cirugía:</span>
                    <span className="text-gray-600">{order.surgery}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Fecha:</span>
                    <span className="text-gray-600">
                      {new Date(order.surgeryDate).toLocaleDateString('es-ES')} a las {order.surgeryTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Ubicación:</span>
                    <span className="text-gray-600">{order.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Equipos:</span>
                    <span className="text-gray-600">{order.equipment.length} items</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modo de creación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Modo de Creación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="from_scratch"
                      name="creationMode"
                      checked={creationMode === 'from_scratch'}
                      onChange={() => setCreationMode('from_scratch')}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="from_scratch" className="flex items-center gap-2 cursor-pointer">
                      <Plus className="h-4 w-4" />
                      Crear desde cero
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="use_template"
                      name="creationMode"
                      checked={creationMode === 'use_template'}
                      onChange={() => setCreationMode('use_template')}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="use_template" className="flex items-center gap-2 cursor-pointer">
                      <Copy className="h-4 w-4" />
                      Usar template como base
                    </Label>
                  </div>
                </div>

                {creationMode === 'use_template' && (
                  <div className="space-y-3">
                    <Label>Templates Disponibles</Label>
                    {loadingTemplates ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Cargando templates...</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {databaseTemplates.map(template => (
                          <div
                            key={template.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedBaseTemplate?.id === template.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleUseTemplate(template)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-sm text-gray-600">{template.description}</div>
                                {template.procedure_name && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {template.procedure_name}
                                  </Badge>
                                )}
                              </div>
                              <Checkbox
                                checked={selectedBaseTemplate?.id === template.id}
                                onCheckedChange={() => handleUseTemplate(template)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuración de plantilla */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateType">Tipo de Plantilla</Label>
                  <Select value={templateType} onValueChange={(value: any) => setTemplateType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada de Equipos</SelectItem>
                      <SelectItem value="salida">Salida de Equipos</SelectItem>
                      <SelectItem value="mixta">Entrada y Salida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="printFormat">Formato de Impresión</Label>
                  <Select value={printFormat} onValueChange={(value: any) => setPrintFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="printed">Impreso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Opciones de Impresión</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeBarcodes"
                        checked={includeBarcodes}
                        onCheckedChange={(checked) => setIncludeBarcodes(!!checked)}
                      />
                      <Label htmlFor="includeBarcodes" className="flex items-center gap-2">
                        <Barcode className="h-4 w-4" />
                        Incluir códigos de barras
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeQR"
                        checked={includeQR}
                        onCheckedChange={(checked) => setIncludeQR(!!checked)}
                      />
                      <Label htmlFor="includeQR" className="flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        Incluir códigos QR
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas adicionales para la plantilla..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel central: Gestión de productos */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Productos de la Plantilla
                  <Badge variant="outline">
                    {selectedProducts.length} productos
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Productos seleccionados */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedProducts.map((product, index) => (
                    <Card key={product.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <Select
                              value={product.action}
                              onValueChange={(value: 'entrada' | 'salida') => 
                                handleUpdateProduct(product.id, { action: value })
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="entrada">Entrada</SelectItem>
                                <SelectItem value="salida">Salida</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-600">
                              {product.category} • ${product.price.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Stock: {product.available} • {product.location}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => handleUpdateProduct(product.id, { 
                              quantity: parseInt(e.target.value) || 1 
                            })}
                            className="w-16 text-center"
                          />
                          <div className="text-sm font-medium">
                            ${(product.price * product.quantity).toLocaleString()}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveProduct(product.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Notas del producto */}
                      <div className="mt-2">
                        <Input
                          placeholder="Notas específicas para este producto..."
                          value={product.notes || ''}
                          onChange={(e) => handleUpdateProduct(product.id, { notes: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className={`text-lg font-bold ${
                      calculateTotal() >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${Math.abs(calculateTotal()).toLocaleString()}
                      {calculateTotal() >= 0 ? ' (Entrada)' : ' (Salida)'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel derecho: Productos disponibles */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  Productos Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Búsqueda y filtros */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
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

                {/* Lista de productos disponibles */}
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Cargando productos...</span>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredAvailableProducts.map(product => (
                      <Card key={product.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-600">
                              {product.category} • ${product.price.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Stock: {product.available} • {product.location}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddProduct(product)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {filteredAvailableProducts.length === 0 && !loadingProducts && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3" />
                    <p>No se encontraron productos</p>
                    {searchQuery && (
                      <p className="text-sm">Intenta con otros términos de búsqueda</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Ocultar' : 'Vista'} Previa
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={getTemplateTypeColor(templateType)}>
              {getTemplateTypeText(templateType)}
            </Badge>
            <Button 
              onClick={handleGenerateTemplate}
              disabled={isSubmitting || selectedProducts.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Generar Plantilla
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Vista previa */}
        {showPreview && (
          <div className="mt-6 p-6 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-4">Vista Previa de la Plantilla</h3>
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-bold">TUMex - Plantilla de Almacén</h2>
                <p className="text-sm text-gray-600">{getTemplateTypeText(templateType)}</p>
                <p className="text-xs text-gray-500">Orden: {order.orderNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Cliente:</span> {order.customer}
                </div>
                <div>
                  <span className="font-medium">Paciente:</span> {order.patientName}
                </div>
                <div>
                  <span className="font-medium">Cirugía:</span> {order.surgery}
                </div>
                <div>
                  <span className="font-medium">Fecha:</span> {new Date(order.surgeryDate).toLocaleDateString('es-ES')}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Productos:</h4>
                <div className="space-y-1">
                  {selectedProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between text-sm border-b border-gray-200 pb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-center">{index + 1}.</span>
                        <span>{product.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {product.action}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">x{product.quantity}</span>
                        <span className="text-xs text-gray-500">${product.price.toLocaleString()}</span>
                        <div className="w-4 h-4 border border-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center text-xs text-gray-500 border-t pt-2">
                <p>Generado el: {new Date().toLocaleDateString('es-ES')}</p>
                <p>Formato: {printFormat === 'digital' ? 'Digital' : 'Impreso'}</p>
                {includeBarcodes && <p>✓ Incluye códigos de barras</p>}
                {includeQR && <p>✓ Incluye códigos QR</p>}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TemplateManagementModal; 