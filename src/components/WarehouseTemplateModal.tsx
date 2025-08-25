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
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/supabaseClient';
import { Printer, FileText, Package, AlertTriangle, CheckCircle, XCircle, Download, Eye, Loader2 } from 'lucide-react';

// Tipos para el modal de plantillas de almacén
interface WarehouseTemplate {
  id: string;
  orderId: string;
  templateType: 'equipment_list' | 'inventory_exit' | 'delivery_checklist';
  equipment: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    serialNumber?: string;
    location: string;
    condition: 'excellent' | 'good' | 'fair' | 'maintenance';
    checked: boolean;
  }>;
  generatedBy: string;
  generatedAt: string;
  notes: string;
  printFormat: 'a4' | 'letter' | 'thermal';
  includeBarcodes: boolean;
  includeQR: boolean;
}

interface WarehouseTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    orderNumber: string;
    customer: string;
    patientName: string;
    surgery: string;
    date: string;
    time: string;
    location: string;
    equipment: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      price: number;
    }>;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  onGenerate: (template: WarehouseTemplate) => void;
}

const WarehouseTemplateModal: React.FC<WarehouseTemplateModalProps> = ({
  isOpen,
  onClose,
  order,
  onGenerate
}) => {
  const [templateType, setTemplateType] = useState<'equipment_list' | 'inventory_exit' | 'delivery_checklist'>('equipment_list');
  const [printFormat, setPrintFormat] = useState<'a4' | 'letter' | 'thermal'>('a4');
  const [includeBarcodes, setIncludeBarcodes] = useState(true);
  const [includeQR, setIncludeQR] = useState(true);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const { toast } = useToast();

  // Cargar plantillas de Supabase
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const { data, error } = await supabase
        .from('Templates')
        .select('*')
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

  // Convertir equipos de la orden a formato de plantilla
  const templateEquipment = order.equipment.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    serialNumber: `SN-${item.id.padStart(6, '0')}`, // Mock serial number
    location: 'Almacén Principal',
    condition: 'excellent' as const,
    checked: false
  }));

  // Generar plantilla
  const handleGenerate = async () => {
    setIsSubmitting(true);
    try {
      const template: WarehouseTemplate = {
        id: `TPL-${Date.now()}`,
        orderId: order.id,
        templateType,
        equipment: templateEquipment,
        generatedBy: 'Jefe de Almacén', // TODO: Obtener del contexto de autenticación
        generatedAt: new Date().toISOString(),
        notes: notes.trim(),
        printFormat,
        includeBarcodes,
        includeQR
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

  // Obtener texto del tipo de plantilla
  const getTemplateTypeText = (type: string) => {
    switch (type) {
      case 'equipment_list': return 'Lista de Equipos';
      case 'inventory_exit': return 'Salida de Inventario';
      case 'delivery_checklist': return 'Checklist de Entrega';
      default: return type;
    }
  };

  // Obtener color del tipo de plantilla
  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'equipment_list': return 'bg-blue-100 text-blue-800';
      case 'inventory_exit': return 'bg-green-100 text-green-800';
      case 'delivery_checklist': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener texto del formato de impresión
  const getPrintFormatText = (format: string) => {
    switch (format) {
      case 'a4': return 'A4';
      case 'letter': return 'Carta';
      case 'thermal': return 'Térmica';
      default: return format;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            <span>Generar Plantilla - Orden {order.orderNumber}</span>
            <Badge variant="outline">{order.priority}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel izquierdo: Configuración de plantilla */}
          <div className="space-y-6">
            {/* Información de la orden */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Orden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Cliente:</span>
                    <p className="text-gray-600">{order.customer}</p>
                  </div>
                  <div>
                    <span className="font-medium">Paciente:</span>
                    <p className="text-gray-600">{order.patientName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Cirugía:</span>
                    <p className="text-gray-600">{order.surgery}</p>
                  </div>
                  <div>
                    <span className="font-medium">Fecha:</span>
                    <p className="text-gray-600">
                      {new Date(order.date).toLocaleDateString('es-ES')} a las {order.time}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Ubicación:</span>
                    <p className="text-gray-600">{order.location}</p>
                  </div>
                  <div>
                    <span className="font-medium">Equipos:</span>
                    <p className="text-gray-600">{order.equipment.length} items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plantillas de Supabase */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Plantillas Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Cargando plantillas...</span>
                  </div>
                ) : availableTemplates.length > 0 ? (
                  <div className="space-y-3">
                    <Label>Seleccionar Plantilla Base</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableTemplates.map(template => (
                        <div
                          key={template.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTemplate?.id === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedTemplate(template)}
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
                              checked={selectedTemplate?.id === template.id}
                              onCheckedChange={() => setSelectedTemplate(template)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p>No hay plantillas disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuración de plantilla */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Plantilla</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateType">Tipo de Plantilla</Label>
                  <Select value={templateType} onValueChange={(value: any) => setTemplateType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipment_list">Lista de Equipos</SelectItem>
                      <SelectItem value="inventory_exit">Salida de Inventario</SelectItem>
                      <SelectItem value="delivery_checklist">Checklist de Entrega</SelectItem>
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
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Carta</SelectItem>
                      <SelectItem value="thermal">Térmica</SelectItem>
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
                      <Label htmlFor="includeBarcodes">Incluir códigos de barras</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeQR"
                        checked={includeQR}
                        onCheckedChange={(checked) => setIncludeQR(!!checked)}
                      />
                      <Label htmlFor="includeQR">Incluir códigos QR</Label>
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

          {/* Panel derecho: Vista previa */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3">Vista Previa de Plantilla</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="text-center mb-4">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Vista previa de la plantilla</p>
                </div>
                
                {/* Encabezado de la plantilla */}
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold">TUMex - Equipos Médicos</h2>
                  <p className="text-sm text-gray-600">{getTemplateTypeText(templateType)}</p>
                  <p className="text-xs text-gray-500">Orden: {order.orderNumber}</p>
                </div>

                {/* Información de la orden */}
                <div className="mb-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
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
                      <span className="font-medium">Fecha:</span> {new Date(order.date).toLocaleDateString('es-ES')}
                    </div>
                    <div>
                      <span className="font-medium">Hora:</span> {order.time}
                    </div>
                    <div>
                      <span className="font-medium">Ubicación:</span> {order.location}
                    </div>
                  </div>
                </div>

                {/* Lista de equipos */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Equipos Requeridos:</h3>
                  <div className="space-y-1">
                    {templateEquipment.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between text-sm border-b border-gray-200 pb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 text-center">{index + 1}.</span>
                          <span>{item.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">x{item.quantity}</span>
                          <span className="text-xs text-gray-500">SN: {item.serialNumber}</span>
                          <div className="w-4 h-4 border border-gray-300 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie de página */}
                <div className="text-center text-xs text-gray-500 border-t pt-2">
                  <p>Generado el: {new Date().toLocaleDateString('es-ES')}</p>
                  <p>Formato: {getPrintFormatText(printFormat)}</p>
                  {includeBarcodes && <p>✓ Incluye códigos de barras</p>}
                  {includeQR && <p>✓ Incluye códigos QR</p>}
                </div>
              </div>
            </div>

            {/* Estadísticas de la plantilla */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total de equipos:</span>
                    <p className="text-lg font-bold">{templateEquipment.length}</p>
                  </div>
                  <div>
                    <span className="font-medium">Formato:</span>
                    <p className="text-lg font-bold">{getPrintFormatText(printFormat)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span>
                    <p className="text-lg font-bold">{getTemplateTypeText(templateType)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Códigos:</span>
                    <p className="text-lg font-bold">
                      {includeBarcodes && includeQR ? 'Barras + QR' : 
                       includeBarcodes ? 'Barras' : 
                       includeQR ? 'QR' : 'Ninguno'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Generando...' : 'Generar Plantilla'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WarehouseTemplateModal; 