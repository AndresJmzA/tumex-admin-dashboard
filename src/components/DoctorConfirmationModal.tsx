import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/supabaseClient';
import { 
  Phone, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Package,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  DollarSign,
  Edit,
  Save,
  X
} from 'lucide-react';

// Tipos para la confirmación médica con gestión de objetos
interface OrderObject {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  confirmed: boolean;
  notes?: string;
  fromTemplate: boolean;
}

interface TemplateObject {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  included: boolean;
  notes?: string;
}

interface DoctorConfirmationData {
  orderId: string;
  doctorId: string;
  doctorName: string;
  doctorPhone: string;
  confirmationStatus: 'confirmed' | 'rejected' | 'pending';
  confirmedEquipment: OrderObject[];
  confirmedDate: string;
  confirmedTime: string;
  callNotes: string;
  callDuration: string;
  calledBy: string;
  calledAt: string;
  rejectionReason?: string;
  totalPrice: number;
}

interface DoctorConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    doctorName: string;
    doctorPhone: string;
    doctorEmail: string;
    patientName: string;
    surgery: string;
    surgeryType: string;
    procedure: string;
    date: string;
    time: string;
    equipment: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      price: number;
    }>;
    notes?: string;
  };
  onConfirm: (confirmationData: DoctorConfirmationData) => void;
  onReject: (confirmationData: DoctorConfirmationData) => void;
}

const DoctorConfirmationModal: React.FC<DoctorConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirm,
  onReject
}) => {
  const [callStatus, setCallStatus] = useState<'not_called' | 'calling' | 'completed'>('not_called');
  const [confirmationStatus, setConfirmationStatus] = useState<'confirmed' | 'rejected' | null>(null);
  const [callNotes, setCallNotes] = useState('');
  const [callDuration, setCallDuration] = useState('');
  const [confirmedDate, setConfirmedDate] = useState(order.date);
  const [confirmedTime, setConfirmedTime] = useState(order.time);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Estados para gestión de objetos
  const [selectedObjects, setSelectedObjects] = useState<OrderObject[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showObjectSelection, setShowObjectSelection] = useState(false);
  const [stockWarnings, setStockWarnings] = useState<any[]>([]);

  // Estados para edición de plantillas
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateObjects, setTemplateObjects] = useState<TemplateObject[]>([]);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  // Cargar plantillas y productos disponibles
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      loadProducts();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      // Cargar plantillas según el procedimiento de la orden
      const { data, error } = await supabase
        .from('Templates')
        .select('*')
        .eq('procedure_id', order.procedure) // Asumiendo que order.procedure es el ID del procedimiento
        .order('name');
      
      if (error) throw error;
      setAvailableTemplates(data || []);
    } catch (err) {
      console.error('Error cargando plantillas:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      });
    } finally {
      setLoadingTemplates(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from('Products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setAvailableProducts(data || []);
    } catch (err) {
      console.error('Error cargando productos:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Cargar objetos de una plantilla para edición
  const loadTemplateObjects = async (template: any) => {
    try {
      // Simular carga de productos de la plantilla
      // En un caso real, esto vendría de una tabla de relación Template-Products
      const templateProducts = availableProducts.slice(0, 5).map((product, index) => ({
        id: product.id,
        name: product.name,
        category: product.category || 'General',
        quantity: Math.floor(Math.random() * 3) + 1, // Cantidad aleatoria para demo
        price: product.price || 0,
        included: index < 3, // Los primeros 3 incluidos por defecto
        notes: ''
      }));
      
      setTemplateObjects(templateProducts);
      setEditingTemplate(template);
      setShowTemplateEditor(true);
    } catch (err) {
      console.error('Error cargando objetos de plantilla:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los objetos de la plantilla",
        variant: "destructive",
      });
    }
  };

  // Aplicar plantilla editada
  const applyEditedTemplate = () => {
    const includedObjects = templateObjects.filter(obj => obj.included);
    const orderObjects: OrderObject[] = includedObjects.map(obj => ({
      id: obj.id,
      name: obj.name,
      category: obj.category,
      quantity: obj.quantity,
      price: obj.price,
      confirmed: true,
      notes: obj.notes || '',
      fromTemplate: true
    }));
    
    setSelectedObjects(prev => [...prev, ...orderObjects]);
    setShowTemplateEditor(false);
    setEditingTemplate(null);
    setTemplateObjects([]);
    
    toast({
      title: "Plantilla aplicada",
      description: `Se aplicó la plantilla "${editingTemplate?.name}" con modificaciones`,
    });
  };

  // Cancelar edición de plantilla
  const cancelTemplateEdit = () => {
    setShowTemplateEditor(false);
    setEditingTemplate(null);
    setTemplateObjects([]);
  };

  // Actualizar objeto de plantilla
  const updateTemplateObject = (objectId: string, field: keyof TemplateObject, value: any) => {
    setTemplateObjects(prev => 
      prev.map(obj => 
        obj.id === objectId 
          ? { ...obj, [field]: value }
          : obj
      )
    );
  };

  // Agregar producto a la plantilla
  const addProductToTemplate = (product: any) => {
    const newTemplateObject: TemplateObject = {
      id: product.id,
      name: product.name,
      category: product.category || 'General',
      quantity: 1,
      price: product.price || 0,
      included: true,
      notes: ''
    };
    setTemplateObjects(prev => [...prev, newTemplateObject]);
  };

  // Remover objeto de la plantilla
  const removeTemplateObject = (objectId: string) => {
    setTemplateObjects(prev => prev.filter(obj => obj.id !== objectId));
  };

  // Aplicar plantilla automáticamente (sin edición)
  const applyTemplate = (template: any) => {
    if (template.products) {
      const templateObjects: OrderObject[] = template.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        category: product.category || 'Plantilla',
        quantity: product.quantity || 1,
        price: product.price || 0,
        confirmed: true,
        notes: '',
        fromTemplate: true
      }));
      setSelectedObjects(templateObjects);
      toast({
        title: "Plantilla aplicada",
        description: `Se aplicó la plantilla "${template.name}"`,
      });
    }
  };

  // Agregar objeto individual
  const addObject = (product: any) => {
    const newObject: OrderObject = {
      id: product.id,
      name: product.name,
      category: product.category || 'General',
      quantity: 1,
      price: product.price || 0,
      confirmed: true,
      notes: '',
      fromTemplate: false
    };
    setSelectedObjects(prev => [...prev, newObject]);
  };

  // Remover objeto
  const removeObject = (objectId: string) => {
    setSelectedObjects(prev => prev.filter(obj => obj.id !== objectId));
  };

  // Actualizar cantidad de objeto
  const updateObjectQuantity = (objectId: string, quantity: number) => {
    setSelectedObjects(prev => 
      prev.map(obj => 
        obj.id === objectId 
          ? { ...obj, quantity: Math.max(1, quantity) }
          : obj
      )
    );
  };

  // Actualizar notas de objeto
  const updateObjectNotes = (objectId: string, notes: string) => {
    setSelectedObjects(prev => 
      prev.map(obj => 
        obj.id === objectId 
          ? { ...obj, notes }
          : obj
      )
    );
  };

  // Calcular precio total
  const calculateTotalPrice = () => {
    return selectedObjects.reduce((total, obj) => {
      return total + (obj.price * obj.quantity);
    }, 0);
  };

  // Calcular precio total de plantilla
  const calculateTemplatePrice = () => {
    return templateObjects
      .filter(obj => obj.included)
      .reduce((total, obj) => {
        return total + (obj.price * obj.quantity);
      }, 0);
  };

  // Validar stock disponible
  const validateStock = async () => {
    const warnings = [];
    for (const obj of selectedObjects) {
      const product = availableProducts.find(p => p.id === obj.id);
      if (product && product.available_quantity < obj.quantity) {
        warnings.push({
          id: obj.id,
          name: obj.name,
          requested: obj.quantity,
          available: product.available_quantity,
          message: `Stock insuficiente: ${product.available_quantity} disponibles`
        });
      }
    }
    setStockWarnings(warnings);
    return warnings;
  };

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(availableProducts.map(p => p.category)))];

  // Manejar inicio de llamada
  const handleStartCall = () => {
    setCallStatus('calling');
    toast({
      title: "Llamada iniciada",
      description: `Llamando al Dr. ${order.doctorName} al ${order.doctorPhone}`,
    });
  };

  // Manejar finalización de llamada
  const handleEndCall = () => {
    setCallStatus('completed');
    toast({
      title: "Llamada finalizada",
      description: "Registra los detalles de la confirmación",
    });
  };

  // Manejar confirmación del médico
  const handleDoctorConfirm = async () => {
    if (!callNotes.trim()) {
      toast({
        title: "Notas requeridas",
        description: "Debes registrar las notas de la llamada",
        variant: "destructive",
      });
      return;
    }

    // Validar stock antes de confirmar
    const warnings = await validateStock();
    if (warnings.length > 0) {
      toast({
        title: "Advertencias de stock",
        description: `${warnings.length} productos tienen stock insuficiente`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const confirmationData: DoctorConfirmationData = {
        orderId: order.id,
        doctorId: order.id, // TODO: Obtener doctorId real
        doctorName: order.doctorName,
        doctorPhone: order.doctorPhone,
        confirmationStatus: 'confirmed',
        confirmedEquipment: selectedObjects.filter(obj => obj.confirmed),
        confirmedDate,
        confirmedTime,
        callNotes: callNotes.trim(),
        callDuration,
        calledBy: 'Gerente Comercial', // TODO: Obtener del contexto de autenticación
        calledAt: new Date().toISOString(),
        totalPrice: calculateTotalPrice()
      };

      await onConfirm(confirmationData);
      toast({
        title: "Confirmación registrada",
        description: "La confirmación del médico ha sido registrada exitosamente.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar la confirmación. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar rechazo del médico
  const handleDoctorReject = async () => {
    if (!callNotes.trim() || !rejectionReason.trim()) {
      toast({
        title: "Información requerida",
        description: "Debes registrar las notas de la llamada y el motivo del rechazo",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const confirmationData: DoctorConfirmationData = {
        orderId: order.id,
        doctorId: order.id, // TODO: Obtener doctorId real
        doctorName: order.doctorName,
        doctorPhone: order.doctorPhone,
        confirmationStatus: 'rejected',
        confirmedEquipment: [],
        confirmedDate: '',
        confirmedTime: '',
        callNotes: callNotes.trim(),
        callDuration,
        rejectionReason: rejectionReason.trim(),
        calledBy: 'Gerente Comercial', // TODO: Obtener del contexto de autenticación
        calledAt: new Date().toISOString(),
        totalPrice: 0
      };

      await onReject(confirmationData);
      toast({
        title: "Rechazo registrado",
        description: "El rechazo del médico ha sido registrado exitosamente.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el rechazo. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear estado al cerrar
  const handleClose = () => {
    setCallStatus('not_called');
    setConfirmationStatus(null);
    setCallNotes('');
    setCallDuration('');
    setSelectedObjects([]);
    setConfirmedDate(order.date);
    setConfirmedTime(order.time);
    setRejectionReason('');
    setShowObjectSelection(false);
    setSearchQuery('');
    setSelectedCategory('all');
    setStockWarnings([]);
    setShowTemplateEditor(false);
    setEditingTemplate(null);
    setTemplateObjects([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            <span>Confirmación Médica - Orden {order.orderNumber}</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              📞 Llamada Telefónica
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del médico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Información del Médico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Médico</Label>
                  <p className="text-sm font-medium">{order.doctorName}</p>
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p className="text-sm font-medium">{order.doctorPhone}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-sm text-gray-600">{order.doctorEmail}</p>
                </div>
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <p className="text-sm text-gray-600">{order.patientName}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la cirugía */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Detalles de la Cirugía
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Cirugía</Label>
                  <p className="text-sm font-medium">{order.surgeryType}</p>
                </div>
                <div className="space-y-2">
                  <Label>Procedimiento</Label>
                  <p className="text-sm font-medium">{order.procedure}</p>
                </div>
                <div className="space-y-2">
                  <Label>Cirugía</Label>
                  <p className="text-sm font-medium">{order.surgery}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Programada</Label>
                  <p className="text-sm font-medium">
                    {new Date(order.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Hora Programada</Label>
                  <p className="text-sm font-medium">{order.time}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Control de llamada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Control de Llamada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                {callStatus === 'not_called' && (
                  <Button onClick={handleStartCall} className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Iniciar Llamada
                  </Button>
                )}
                {callStatus === 'calling' && (
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleEndCall}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Finalizar Llamada
                    </Button>
                    <Badge className="bg-green-100 text-green-800">
                      Llamando...
                    </Badge>
                  </div>
                )}
                {callStatus === 'completed' && (
                  <Badge className="bg-blue-100 text-blue-800">
                    Llamada Completada
                  </Badge>
                )}
              </div>

              {callStatus === 'completed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="callDuration">Duración de la Llamada</Label>
                    <Input
                      id="callDuration"
                      value={callDuration}
                      onChange={(e) => setCallDuration(e.target.value)}
                      placeholder="Ej: 5 minutos"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gestión de Objetos */}
          {callStatus === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Gestión de Objetos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plantillas disponibles */}
                {availableTemplates.length > 0 && (
                  <div className="space-y-3">
                    <Label>Plantillas Disponibles</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableTemplates.map(template => (
                        <Card key={template.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-gray-600">{template.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => applyTemplate(template)}
                                className="flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                Aplicar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loadTemplateObjects(template)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                                Editar
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón para agregar objetos manualmente */}
                <div className="flex justify-between items-center">
                  <Label>Objetos Seleccionados</Label>
                  <Button
                    size="sm"
                    onClick={() => setShowObjectSelection(!showObjectSelection)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    {showObjectSelection ? 'Ocultar' : 'Agregar Objetos'}
                  </Button>
                </div>

                {/* Selector de objetos */}
                {showObjectSelection && (
                  <div className="space-y-4 border rounded-lg p-4">
                    {/* Búsqueda y filtros */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          placeholder="Buscar productos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
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
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {filteredProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-600">
                              {product.category} • ${product.price?.toLocaleString() || 0}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addObject(product)}
                            disabled={selectedObjects.some(obj => obj.id === product.id)}
                          >
                            {selectedObjects.some(obj => obj.id === product.id) ? 'Agregado' : 'Agregar'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista de objetos seleccionados */}
                {selectedObjects.length > 0 && (
                  <div className="space-y-3">
                    <Label>Objetos Confirmados</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedObjects.map((obj) => (
                        <div key={obj.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={obj.confirmed}
                            onCheckedChange={(checked) => 
                              setSelectedObjects(prev => 
                                prev.map(item => 
                                  item.id === obj.id 
                                    ? { ...item, confirmed: checked as boolean }
                                    : item
                                )
                              )
                            }
                          />
                          <div className="flex-1">
                            <div className="font-medium">{obj.name}</div>
                            <div className="text-sm text-gray-600">
                              {obj.category} {obj.fromTemplate && <Badge variant="outline" className="text-xs">Plantilla</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={obj.quantity}
                              onChange={(e) => updateObjectQuantity(obj.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                            />
                            <Input
                              placeholder="Notas"
                              value={obj.notes || ''}
                              onChange={(e) => updateObjectNotes(obj.id, e.target.value)}
                              className="w-24 text-xs"
                            />
                            <div className="text-sm font-medium">
                              ${(obj.price * obj.quantity).toLocaleString()}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeObject(obj.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total:</span>
                        <span className="text-lg text-blue-600">
                          ${calculateTotalPrice().toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Warnings de stock */}
                    {stockWarnings.length > 0 && (
                      <div className="border border-orange-200 bg-orange-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-800">Advertencias de Stock</span>
                        </div>
                        <div className="space-y-1">
                          {stockWarnings.map(warning => (
                            <div key={warning.id} className="text-sm text-orange-700">
                              • {warning.name}: {warning.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Editor de Plantilla */}
          {showTemplateEditor && editingTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Editar Plantilla: {editingTemplate.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de objetos de la plantilla */}
                <div className="space-y-3">
                  <Label>Objetos de la Plantilla</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {templateObjects.map((obj) => (
                      <div key={obj.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          checked={obj.included}
                          onCheckedChange={(checked) => 
                            updateTemplateObject(obj.id, 'included', checked)
                          }
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
                            onChange={(e) => updateTemplateObject(obj.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                          />
                          <Input
                            placeholder="Notas"
                            value={obj.notes || ''}
                            onChange={(e) => updateTemplateObject(obj.id, 'notes', e.target.value)}
                            className="w-24 text-xs"
                          />
                          <div className="text-sm font-medium">
                            ${(obj.price * obj.quantity).toLocaleString()}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeTemplateObject(obj.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Agregar productos adicionales */}
                  <div className="border-t pt-3">
                    <Label>Agregar Productos Adicionales</Label>
                    <div className="max-h-32 overflow-y-auto space-y-2 mt-2">
                      {filteredProducts
                        .filter(product => !templateObjects.some(obj => obj.id === product.id))
                        .slice(0, 5)
                        .map(product => (
                          <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-600">
                                {product.category} • ${product.price?.toLocaleString() || 0}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addProductToTemplate(product)}
                            >
                              Agregar
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Total de la plantilla */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total de Plantilla:</span>
                      <span className="text-lg text-blue-600">
                        ${calculateTemplatePrice().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex justify-end gap-3 pt-3">
                    <Button variant="outline" onClick={cancelTemplateEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={applyEditedTemplate}>
                      <Save className="h-4 w-4 mr-2" />
                      Aplicar Plantilla
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirmación del médico */}
          {callStatus === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Confirmación del Médico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    variant={confirmationStatus === 'confirmed' ? 'default' : 'outline'}
                    onClick={() => setConfirmationStatus('confirmed')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Médico Confirma
                  </Button>
                  <Button
                    variant={confirmationStatus === 'rejected' ? 'destructive' : 'outline'}
                    onClick={() => setConfirmationStatus('rejected')}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Médico Rechaza
                  </Button>
                </div>

                {/* Detalles de confirmación */}
                {confirmationStatus === 'confirmed' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="confirmedDate">Fecha Confirmada</Label>
                        <Input
                          id="confirmedDate"
                          type="date"
                          value={confirmedDate}
                          onChange={(e) => setConfirmedDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmedTime">Hora Confirmada</Label>
                        <Input
                          id="confirmedTime"
                          value={confirmedTime}
                          onChange={(e) => setConfirmedTime(e.target.value)}
                          placeholder="Ej: 14:30"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Motivo de rechazo */}
                {confirmationStatus === 'rejected' && (
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">Motivo del Rechazo</Label>
                    <Textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explica el motivo del rechazo del médico..."
                      rows={3}
                    />
                  </div>
                )}

                {/* Notas de la llamada */}
                <div className="space-y-2">
                  <Label htmlFor="callNotes">Notas de la Llamada</Label>
                  <Textarea
                    id="callNotes"
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="Registra los detalles de la conversación con el médico..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">
                    Incluye cualquier información relevante, cambios solicitados, o comentarios del médico
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          {callStatus === 'completed' && confirmationStatus && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              {confirmationStatus === 'confirmed' && (
                <Button 
                  onClick={handleDoctorConfirm}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registrando...' : 'Registrar Confirmación'}
                </Button>
              )}
              {confirmationStatus === 'rejected' && (
                <Button 
                  variant="destructive"
                  onClick={handleDoctorReject}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registrando...' : 'Registrar Rechazo'}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorConfirmationModal; 