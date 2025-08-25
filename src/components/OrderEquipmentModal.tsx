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
import { useToast } from '@/components/ui/use-toast';
import { X, Plus, Minus, Package, Settings, RefreshCw } from 'lucide-react';
import { useOptimizedPackages } from '../hooks/useOptimizedPackages';
import { PackageSelectionModal } from './PackageSelectionModal';

// Tipos para el modal de modificación de equipos
interface OrderEquipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  isSelected: boolean;
  isFromPackage?: boolean;
  packageId?: string;
}

interface OrderEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  patientName: string;
  currentEquipment: OrderEquipment[];
  onSave: (equipment: OrderEquipment[], notes: string) => void;
  procedureId?: string;
  surgeryTypeId?: string;
}

// Datos mock de productos médicos disponibles (mantenemos para compatibilidad)
const availableEquipment = [
  // Monitoreo
  { id: '1', name: 'Monitor Multiparamétrico', category: 'Monitoreo', price: 2500, available: true },
  { id: '2', name: 'Monitor de Signos Vitales', category: 'Monitoreo', price: 2800, available: true },
  { id: '3', name: 'Monitor de Presión Arterial', category: 'Monitoreo', price: 1500, available: true },
  { id: '4', name: 'Oxímetro de Pulso', category: 'Monitoreo', price: 300, available: true },
  { id: '5', name: 'Electrocardiógrafo', category: 'Monitoreo', price: 1800, available: true },
  
  // Infusión y Aspiración
  { id: '6', name: 'Bomba de Infusión', category: 'Infusión', price: 1200, available: true },
  { id: '7', name: 'Bomba de Succión', category: 'Aspiración', price: 1800, available: true },
  { id: '8', name: 'Aspirador Quirúrgico', category: 'Aspiración', price: 1200, available: true },
  
  // Emergencia
  { id: '9', name: 'Desfibrilador', category: 'Emergencia', price: 3500, available: true },
  
  // Respiración
  { id: '10', name: 'Ventilador Mecánico', category: 'Respiración', price: 4500, available: true },
  
  // Iluminación
  { id: '11', name: 'Lámpara Quirúrgica', category: 'Iluminación', price: 2200, available: true },
  { id: '12', name: 'Fuente de Luz', category: 'Iluminación', price: 2800, available: true },
  
  // Anestesia
  { id: '13', name: 'Máquina de Anestesia', category: 'Anestesia', price: 8000, available: true },
  
  // Quirúrgico
  { id: '14', name: 'Cauterio', category: 'Quirúrgico', price: 3500, available: true },
  
  // Mobiliario
  { id: '15', name: 'Mesa Quirúrgica', category: 'Mobiliario', price: 12000, available: true },
  
  // Visualización
  { id: '16', name: 'Monitor de Video', category: 'Visualización', price: 3500, available: true },
  
  // Endoscopía
  { id: '17', name: 'Endoscopio', category: 'Endoscopía', price: 15000, available: true },
  
  // Diagnóstico
  { id: '18', name: 'Ultrasonido', category: 'Diagnóstico', price: 25000, available: true }
];

const OrderEquipmentModal: React.FC<OrderEquipmentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  patientName,
  currentEquipment,
  onSave,
  procedureId,
  surgeryTypeId
}) => {
  const [equipment, setEquipment] = useState<OrderEquipment[]>(currentEquipment);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<any>(null);
  
  const { toast } = useToast();
  const { applyPackageToOrder } = useOptimizedPackages();

  // Categorías disponibles (incluyendo las del paquete optimizado)
  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'equipo', label: 'Equipo' },
    { value: 'instrumental', label: 'Instrumental' },
    { value: 'consumible', label: 'Consumible' },
    { value: 'complemento', label: 'Complemento' },
    { value: 'Monitoreo', label: 'Monitoreo' },
    { value: 'Infusión', label: 'Infusión' },
    { value: 'Aspiración', label: 'Aspiración' },
    { value: 'Emergencia', label: 'Emergencia' },
    { value: 'Respiración', label: 'Respiración' },
    { value: 'Iluminación', label: 'Iluminación' },
    { value: 'Anestesia', label: 'Anestesia' },
    { value: 'Quirúrgico', label: 'Quirúrgico' },
    { value: 'Mobiliario', label: 'Mobiliario' },
    { value: 'Visualización', label: 'Visualización' },
    { value: 'Endoscopía', label: 'Endoscopía' },
    { value: 'Diagnóstico', label: 'Diagnóstico' }
  ];

  // Filtrar equipos por categoría
  const filteredEquipment = selectedCategory === 'all' 
    ? availableEquipment 
    : availableEquipment.filter(item => item.category === selectedCategory);

  // Agregar equipo a la orden
  const addEquipment = (equipmentItem: any) => {
    const existingItem = equipment.find(item => item.id === equipmentItem.id);
    
    if (existingItem) {
      setEquipment(equipment.map(item => 
        item.id === equipmentItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setEquipment([...equipment, {
        ...equipmentItem,
        quantity: 1,
        isSelected: true,
        isFromPackage: false
      }]);
    }
  };

  // Quitar equipo de la orden
  const removeEquipment = (equipmentId: string) => {
    setEquipment(equipment.filter(item => item.id !== equipmentId));
  };

  // Cambiar cantidad de un equipo
  const changeQuantity = (equipmentId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeEquipment(equipmentId);
    } else {
      setEquipment(equipment.map(item => 
        item.id === equipmentId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Aplicar paquete a la orden
  const handlePackageSelected = async (procedureId: string, packageData: any) => {
    try {
      setCurrentPackage(packageData);
      
      // Aplicar el paquete usando el servicio
      const result = await applyPackageToOrder(orderId, procedureId, {
        replace_existing: true,
        confirm_equipment: true,
        user_id: 'current_user' // Esto debería venir del contexto de autenticación
      });

      if (result.success) {
        // Convertir los productos del paquete al formato de OrderEquipment
        const packageProducts: OrderEquipment[] = packageData.categories.flatMap((category: any) =>
          category.products.map((product: any) => ({
            id: product.product_id,
            name: product.product_name,
            category: product.category_display,
            quantity: product.quantity,
            price: product.price,
            isSelected: true,
            isFromPackage: true,
            packageId: procedureId
          }))
        );

        setEquipment(packageProducts);
        
        toast({
          title: "Paquete aplicado",
          description: `Se ha aplicado el paquete del procedimiento "${packageData.procedure_name}" exitosamente.`,
        });
      }
    } catch (error) {
      console.error('Error aplicando paquete:', error);
      toast({
        title: "Error",
        description: "No se pudo aplicar el paquete. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Calcular total
  const calculateTotal = () => {
    return equipment.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calcular estadísticas del paquete
  const getPackageStats = () => {
    const packageItems = equipment.filter(item => item.isFromPackage);
    const customItems = equipment.filter(item => !item.isFromPackage);
    
    return {
      packageItems: packageItems.length,
      customItems: customItems.length,
      packageValue: packageItems.reduce((total, item) => total + (item.price * item.quantity), 0),
      customValue: customItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    };
  };

  // Guardar cambios
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(equipment, notes);
      toast({
        title: "Equipos actualizados",
        description: "Los equipos de la orden han sido actualizados exitosamente.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los equipos. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = getPackageStats();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Modificar Equipos - Orden {orderId}</span>
              <Badge variant="secondary">Paciente: {patientName}</Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Panel superior: Gestión de paquetes */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Package className="h-5 w-5" />
                Gestión de Paquetes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.packageItems}</div>
                  <div className="text-sm text-blue-700">Productos del Paquete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.customItems}</div>
                  <div className="text-sm text-green-700">Productos Personalizados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ${(stats.packageValue + stats.customValue).toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-700">Valor Total</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowPackageModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {currentPackage ? 'Cambiar Paquete' : 'Aplicar Paquete'}
                </Button>
                
                {currentPackage && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setCurrentPackage(null);
                      setEquipment(equipment.filter(item => !item.isFromPackage));
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Remover Paquete
                  </Button>
                )}
              </div>

              {currentPackage && (
                <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Paquete activo:</strong> {currentPackage.procedure_name} 
                    ({currentPackage.surgery_type_name})
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel izquierdo: Equipos disponibles */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Filtrar por categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Equipos Disponibles</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredEquipment.map(item => (
                    <Card key={item.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.category}</div>
                          <div className="text-sm font-medium text-blue-600">
                            ${item.price.toLocaleString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addEquipment(item)}
                          className="ml-2"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel derecho: Equipos seleccionados */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Equipos de la Orden</h3>
                <div className="text-sm text-gray-600">
                  {equipment.length} equipos seleccionados
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {equipment.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay equipos seleccionados
                  </div>
                ) : (
                  equipment.map(item => (
                    <Card key={item.id} className={`p-3 ${item.isFromPackage ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{item.name}</div>
                            {item.isFromPackage && (
                              <Badge variant="secondary" className="text-xs">
                                <Package className="h-3 w-3 mr-1" />
                                Paquete
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{item.category}</div>
                          <div className="text-sm font-medium text-blue-600">
                            ${(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => changeQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => changeQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeEquipment(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {equipment.length > 0 && (
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Subtotal Paquete:</span>
                      <span className="text-blue-600">
                        ${stats.packageValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Subtotal Personalizado:</span>
                      <span className="text-green-600">
                        ${stats.customValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between items-center font-bold">
                      <span>Total:</span>
                      <span className="text-lg text-purple-600">
                        ${(stats.packageValue + stats.customValue).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas sobre los cambios</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explica los cambios realizados en los equipos..."
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de selección de paquetes */}
      <PackageSelectionModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        onPackageSelected={handlePackageSelected}
        surgeryTypeId={surgeryTypeId}
        initialProcedureId={procedureId}
      />
    </>
  );
};

export default OrderEquipmentModal; 