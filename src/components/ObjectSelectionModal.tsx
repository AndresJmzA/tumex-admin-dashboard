import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { supabase } from '@/supabaseClient';
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
}

// Tipos para plantillas
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  products: OrderObject[];
}

// Tipos para precios
type PriceType = 'PMG' | 'Seguro' | 'Manual';

interface PriceConfig {
  type: PriceType;
  manualPrice?: number;
}

interface ObjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (objects: OrderObject[], priceConfig: PriceConfig) => void;
  surgeryType?: string;
  procedureId?: string;
  initialObjects?: OrderObject[];
}

const ObjectSelectionModal: React.FC<ObjectSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  surgeryType,
  procedureId,
  initialObjects = []
}) => {
  const { toast } = useToast();
  
  // Estados principales
  const [selectedObjects, setSelectedObjects] = useState<OrderObject[]>(initialObjects);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [availableProducts, setAvailableProducts] = useState<OrderObject[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showObjectSelection, setShowObjectSelection] = useState(false);
  
  // Estados para plantillas
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateObjects, setTemplateObjects] = useState<OrderObject[]>([]);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  
  // Estados para configuración de precios
  const [priceConfig, setPriceConfig] = useState<PriceConfig>({
    type: 'PMG'
  });
  
  // Estados para warnings
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);

  // Cargar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      loadProducts();
    }
  }, [isOpen, surgeryType, procedureId]);

  // Cargar plantillas desde Supabase
  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const { data, error } = await supabase
        .from('Templates')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      
      // Convertir datos de Supabase a formato de Template
      const templates: Template[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || '',
        category: template.category || 'General',
        products: [] // Los productos se cargarán por separado
      }));
      
      setAvailableTemplates(templates);
    } catch (err) {
      console.error('Error cargando plantillas:', err);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las plantillas',
        variant: 'destructive'
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Cargar productos desde Supabase
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from('Products')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      
      // Convertir datos de Supabase a formato de OrderObject
      const products: OrderObject[] = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        category: product.category || 'General',
        quantity: 1,
        price: product.price || 0,
        notes: '',
        confirmed: false,
        stockAvailable: product.stock || 0,
        stockWarning: (product.stock || 0) < 5
      }));
      
      setAvailableProducts(products);
    } catch (err) {
      console.error('Error cargando productos:', err);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive'
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Aplicar plantilla
  const applyTemplate = (template: Template) => {
    const templateProducts = template.products.map(product => ({
      ...product,
      confirmed: true,
      quantity: 1
    }));
    
    setSelectedObjects(prev => {
      const existingIds = new Set(prev.map(obj => obj.id));
      const newProducts = templateProducts.filter(product => !existingIds.has(product.id));
      return [...prev, ...newProducts];
    });
    
    toast({
      title: 'Plantilla aplicada',
      description: `Se agregaron ${templateProducts.length} productos de la plantilla "${template.name}"`
    });
  };

  // Cargar productos de una plantilla para edición
  const loadTemplateObjects = (template: Template) => {
    // Simular carga de productos de plantilla (en producción vendría de Supabase)
    const templateProducts = availableProducts.slice(0, 5).map(product => ({
      ...product,
      confirmed: true,
      quantity: 1
    }));
    
    setTemplateObjects(templateProducts);
    setEditingTemplate(template);
    setShowTemplateEditor(true);
  };

  // Aplicar plantilla editada
  const applyEditedTemplate = () => {
    const includedProducts = templateObjects.filter(obj => obj.confirmed);
    
    setSelectedObjects(prev => {
      const existingIds = new Set(prev.map(obj => obj.id));
      const newProducts = includedProducts.filter(product => !existingIds.has(product.id));
      return [...prev, ...newProducts];
    });
    
    setShowTemplateEditor(false);
    setEditingTemplate(null);
    setTemplateObjects([]);
    
    toast({
      title: 'Plantilla editada aplicada',
      description: `Se agregaron ${includedProducts.length} productos de la plantilla "${editingTemplate?.name}"`
    });
  };

  // Cancelar edición de plantilla
  const cancelTemplateEdit = () => {
    setShowTemplateEditor(false);
    setEditingTemplate(null);
    setTemplateObjects([]);
  };

  // Actualizar objeto en el editor de plantilla
  const updateTemplateObject = (index: number, field: keyof OrderObject, value: any) => {
    setTemplateObjects(prev => prev.map((obj, i) => 
      i === index ? { 
        ...obj, 
        [field]: field === 'confirmed' ? Boolean(value) : value 
      } : obj
    ));
  };

  // Agregar producto al editor de plantilla
  const addProductToTemplate = (product: OrderObject) => {
    const newProduct = {
      ...product,
      confirmed: true,
      quantity: 1
    };
    setTemplateObjects(prev => [...prev, newProduct]);
  };

  // Remover objeto del editor de plantilla
  const removeTemplateObject = (index: number) => {
    setTemplateObjects(prev => prev.filter((_, i) => i !== index));
  };

  // Calcular precio total de la plantilla
  const calculateTemplatePrice = () => {
    return templateObjects
      .filter(obj => obj.confirmed)
      .reduce((total, obj) => total + (obj.price * obj.quantity), 0);
  };

  // Agregar objeto manualmente
  const addObject = (product: OrderObject) => {
    const newObject = {
      ...product,
      confirmed: true,
      quantity: 1
    };
    setSelectedObjects(prev => [...prev, newObject]);
  };

  // Remover objeto
  const removeObject = (objectId: string) => {
    setSelectedObjects(prev => prev.filter(obj => obj.id !== objectId));
  };

  // Actualizar cantidad de objeto
  const updateObjectQuantity = (objectId: string, quantity: number) => {
    setSelectedObjects(prev => prev.map(obj => 
      obj.id === objectId ? { ...obj, quantity: Math.max(1, quantity) } : obj
    ));
  };

  // Actualizar notas de objeto
  const updateObjectNotes = (objectId: string, notes: string) => {
    setSelectedObjects(prev => prev.map(obj => 
      obj.id === objectId ? { ...obj, notes } : obj
    ));
  };

  // Actualizar confirmación de objeto
  const updateObjectConfirmation = (objectId: string, confirmed: boolean) => {
    setSelectedObjects(prev => prev.map(obj => 
      obj.id === objectId ? { ...obj, confirmed } : obj
    ));
  };

  // Calcular precio total
  const calculateTotalPrice = () => {
    return selectedObjects
      .filter(obj => obj.confirmed)
      .reduce((total, obj) => total + (obj.price * obj.quantity), 0);
  };

  // Validar stock
  const validateStock = () => {
    const warnings: string[] = [];
    selectedObjects.forEach(obj => {
      if (obj.quantity > obj.stockAvailable) {
        warnings.push(`${obj.name}: Cantidad solicitada (${obj.quantity}) excede stock disponible (${obj.stockAvailable})`);
      }
    });
    setStockWarnings(warnings);
  };

  // Filtrar productos
  const filteredProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(availableProducts.map(p => p.category)))];

  // Manejar confirmación
  const handleConfirm = () => {
    validateStock();
    
    const confirmedObjects = selectedObjects.filter(obj => obj.confirmed);
    
    if (confirmedObjects.length === 0) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar al menos un objeto',
        variant: 'destructive'
      });
      return;
    }

    if (priceConfig.type === 'Manual' && !priceConfig.manualPrice) {
      toast({
        title: 'Error',
        description: 'Debes especificar un precio manual',
        variant: 'destructive'
      });
      return;
    }

    onConfirm(confirmedObjects, priceConfig);
    onClose();
  };

  // Manejar cierre
  const handleClose = () => {
    setSelectedObjects(initialObjects);
    setSearchQuery('');
    setSelectedCategory('all');
    setShowObjectSelection(false);
    setShowTemplateEditor(false);
    setEditingTemplate(null);
    setTemplateObjects([]);
    setPriceConfig({ type: 'PMG' });
    setStockWarnings([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <span>Selección de Objetos</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuración de Precios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Configuración de Precios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceType">Tipo de Precio *</Label>
                  <Select
                    value={priceConfig.type}
                    onValueChange={(value: PriceType) => setPriceConfig(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de precio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PMG">PMG</SelectItem>
                      <SelectItem value="Seguro">Seguro</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {priceConfig.type === 'Manual' && (
                  <div className="space-y-2">
                    <Label htmlFor="manualPrice">Precio Manual *</Label>
                    <Input
                      id="manualPrice"
                      type="number"
                      placeholder="0.00"
                      value={priceConfig.manualPrice || ''}
                      onChange={(e) => setPriceConfig(prev => ({ 
                        ...prev, 
                        manualPrice: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plantillas Disponibles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Plantillas Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTemplates ? (
                <div className="text-center py-4">Cargando plantillas...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableTemplates.map(template => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                          <Badge variant="secondary" className="mt-1">{template.category}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => applyTemplate(template)}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Aplicar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadTemplateObjects(template)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editor de Plantilla */}
          {showTemplateEditor && editingTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Editor de Plantilla: {editingTemplate.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Objetos de la plantilla */}
                  <div>
                    <h4 className="font-semibold mb-3">Productos de la Plantilla</h4>
                    <div className="space-y-3">
                      {templateObjects.map((obj, index) => (
                        <div key={obj.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                                     <Checkbox
                             checked={obj.confirmed}
                             onCheckedChange={(checked) => updateTemplateObject(index, 'confirmed', checked as boolean)}
                           />
                          <div className="flex-1">
                            <div className="font-medium">{obj.name}</div>
                            <div className="text-sm text-gray-600">{obj.category}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={obj.quantity}
                              onChange={(e) => updateTemplateObject(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-20"
                            />
                            <Input
                              placeholder="Notas"
                              value={obj.notes}
                              onChange={(e) => updateTemplateObject(index, 'notes', e.target.value)}
                              className="w-32"
                            />
                            <div className="text-sm font-medium">${obj.price}</div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeTemplateObject(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Agregar productos adicionales */}
                  <div>
                    <h4 className="font-semibold mb-3">Agregar Productos Adicionales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {filteredProducts.slice(0, 6).map(product => (
                        <Button
                          key={product.id}
                          size="sm"
                          variant="outline"
                          onClick={() => addProductToTemplate(product)}
                          className="justify-start"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {product.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Total de plantilla */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="font-semibold">Total de Plantilla: ${calculateTemplatePrice()}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={cancelTemplateEdit}>
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                      <Button onClick={applyEditedTemplate}>
                        <Save className="h-4 w-4 mr-1" />
                        Aplicar Plantilla
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selección Manual de Objetos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Selección Manual de Objetos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Búsqueda y filtros */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="sm:w-48">
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
                </div>

                {/* Lista de productos disponibles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium">${product.price}</span>
                            <Badge variant={product.stockWarning ? "destructive" : "secondary"}>
                              Stock: {product.stockAvailable}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addObject(product)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objetos Seleccionados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Objetos Seleccionados ({selectedObjects.filter(obj => obj.confirmed).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedObjects.map(obj => (
                  <div key={obj.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={obj.confirmed}
                      onCheckedChange={(checked) => updateObjectConfirmation(obj.id, Boolean(checked))}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{obj.name}</div>
                      <div className="text-sm text-gray-600">{obj.category}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={obj.quantity}
                        onChange={(e) => updateObjectQuantity(obj.id, parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <Input
                        placeholder="Notas"
                        value={obj.notes}
                        onChange={(e) => updateObjectNotes(obj.id, e.target.value)}
                        className="w-32"
                      />
                      <div className="text-sm font-medium">${obj.price * obj.quantity}</div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeObject(obj.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <div className="font-semibold text-lg">
                  Total: ${calculateTotalPrice()}
                </div>
              </div>

              {/* Warnings de stock */}
              {stockWarnings.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-800">Advertencias de Stock</span>
                  </div>
                  <ul className="text-sm text-orange-700 space-y-1">
                    {stockWarnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar Selección ({selectedObjects.filter(obj => obj.confirmed).length} objetos)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ObjectSelectionModal; 