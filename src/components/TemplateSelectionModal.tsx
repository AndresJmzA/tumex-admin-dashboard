import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Plus
} from 'lucide-react';

// Tipos para plantillas
interface Template {
  id: string;
  name: string;
  description: string;
  procedure_id: string;
  procedure_name?: string;
  surgery_type_id?: string;
  surgery_type_name?: string;
  products: TemplateProduct[];
  created_at: string;
  updated_at: string;
}

interface TemplateProduct {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  included: boolean;
  notes?: string;
}

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template, selectedProducts: TemplateProduct[]) => void;
  surgeryTypeId?: string;
  procedureId?: string;
  initialTemplateId?: string;
}

const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  surgeryTypeId,
  procedureId,
  initialTemplateId
}) => {
  const { toast } = useToast();
  
  // Estados principales
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<TemplateProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showProductDetails, setShowProductDetails] = useState(false);

  // Cargar plantillas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, surgeryTypeId, procedureId]);

  // Cargar plantillas de Supabase
  const loadTemplates = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('Templates')
        .select(`
          *,
          Procedures(name),
          SurgeryTypes(name)
        `)
        .order('name');

      // Filtrar por procedimiento si se proporciona
      if (procedureId) {
        query = query.eq('procedure_id', procedureId);
      }
      // Filtrar por tipo de cirugía si se proporciona
      else if (surgeryTypeId) {
        query = query.eq('surgery_type_id', surgeryTypeId);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Procesar datos y agregar información de productos
      const processedTemplates = (data || []).map(template => ({
        ...template,
        procedure_name: template.Procedures?.name,
        surgery_type_name: template.SurgeryTypes?.name,
        products: [] // Se cargarán cuando se seleccione la plantilla
      }));

      setTemplates(processedTemplates);

      // Seleccionar plantilla inicial si se proporciona
      if (initialTemplateId) {
        const initialTemplate = processedTemplates.find(t => t.id === initialTemplateId);
        if (initialTemplate) {
          setSelectedTemplate(initialTemplate);
          await loadTemplateProducts(initialTemplate);
        }
      }
    } catch (err) {
      console.error('Error cargando plantillas:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos de una plantilla específica
  const loadTemplateProducts = async (template: Template) => {
    try {
      // En un caso real, esto vendría de una tabla de relación Template-Products
      // Por ahora, simulamos productos basados en el procedimiento
      const mockProducts: TemplateProduct[] = [
        {
          id: '1',
          name: 'Endoscopio Flexible',
          category: 'Endoscopio',
          quantity: 1,
          price: 5000,
          included: true,
          notes: 'Endoscopio para procedimiento'
        },
        {
          id: '2',
          name: 'Cable de Conexión',
          category: 'Cable/Conector',
          quantity: 2,
          price: 150,
          included: true,
          notes: 'Cables de conexión'
        },
        {
          id: '3',
          name: 'Bisturí Eléctrico',
          category: 'Instrumental',
          quantity: 1,
          price: 1200,
          included: false,
          notes: 'Bisturí para corte'
        },
        {
          id: '4',
          name: 'Gasas Estériles',
          category: 'Consumible',
          quantity: 10,
          price: 25,
          included: true,
          notes: 'Gasas para limpieza'
        }
      ];

      setSelectedProducts(mockProducts);
    } catch (err) {
      console.error('Error cargando productos de plantilla:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos de la plantilla",
        variant: "destructive",
      });
    }
  };

  // Manejar selección de plantilla
  const handleTemplateSelect = async (template: Template) => {
    setSelectedTemplate(template);
    await loadTemplateProducts(template);
    setShowProductDetails(true);
  };

  // Manejar cambio en productos seleccionados
  const handleProductToggle = (productId: string, included: boolean) => {
    setSelectedProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, included }
          : product
      )
    );
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, quantity: Math.max(1, quantity) }
          : product
      )
    );
  };

  // Manejar cambio de notas
  const handleNotesChange = (productId: string, notes: string) => {
    setSelectedProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, notes }
          : product
      )
    );
  };

  // Calcular total de productos incluidos
  const calculateTotal = () => {
    return selectedProducts
      .filter(product => product.included)
      .reduce((total, product) => total + (product.price * product.quantity), 0);
  };

  // Obtener productos incluidos
  const includedProducts = selectedProducts.filter(product => product.included);

  // Filtrar plantillas por búsqueda
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Obtener categorías únicas de productos
  const categories = ['all', ...Array.from(new Set(selectedProducts.map(p => p.category)))];

  // Filtrar productos por categoría
  const filteredProducts = selectedProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesCategory;
  });

  // Manejar confirmación
  const handleConfirm = () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Debes seleccionar una plantilla",
        variant: "destructive",
      });
      return;
    }

    const finalTemplate = {
      ...selectedTemplate,
      products: selectedProducts
    };

    onSelect(finalTemplate, includedProducts);
    onClose();
  };

  // Resetear estado al cerrar
  const handleClose = () => {
    setSelectedTemplate(null);
    setSelectedProducts([]);
    setSearchQuery('');
    setSelectedCategory('all');
    setShowProductDetails(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Selección de Plantilla
            {selectedTemplate && (
              <Badge variant="secondary">
                {selectedTemplate.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel izquierdo: Lista de plantillas */}
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Plantillas Disponibles</Label>
              
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar plantillas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Lista de plantillas */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Cargando plantillas...</span>
                </div>
              ) : filteredTemplates.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTemplates.map(template => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {template.description}
                            </div>
                            <div className="flex gap-2 mt-2">
                              {template.procedure_name && (
                                <Badge variant="outline" className="text-xs">
                                  {template.procedure_name}
                                </Badge>
                              )}
                              {template.surgery_type_name && (
                                <Badge variant="outline" className="text-xs">
                                  {template.surgery_type_name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Checkbox
                            checked={selectedTemplate?.id === template.id}
                            onCheckedChange={() => handleTemplateSelect(template)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3" />
                  <p>No se encontraron plantillas</p>
                  {searchQuery && (
                    <p className="text-sm">Intenta con otros términos de búsqueda</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho: Detalles de productos */}
          {showProductDetails && selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Productos de la Plantilla</h3>
                <Badge variant="outline">
                  {includedProducts.length} de {selectedProducts.length} incluidos
                </Badge>
              </div>

              {/* Filtros */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar productos..."
                    className="w-full"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
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

              {/* Lista de productos */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={product.included}
                          onCheckedChange={(checked) => 
                            handleProductToggle(product.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {product.category} • ${product.price.toLocaleString()}
                          </div>
                          {product.notes && (
                            <div className="text-xs text-gray-500 mt-1">
                              {product.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                        />
                        <div className="text-sm font-medium">
                          ${(product.price * product.quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirm}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Selección
                </Button>
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {!showProductDetails && (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-3" />
                <p>Selecciona una plantilla para ver sus productos</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectionModal; 