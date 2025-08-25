import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Minus, 
  X, 
  Check, 
  AlertCircle, 
  DollarSign, 
  Package, 
  Calculator, 
  FileText, 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  Save, 
  Send, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Shield, 
  Zap, 
  Target, 
  TrendingUp, 
  Activity, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Percent, 
  Hash, 
  Hash as HashIcon, 
  Tag, 
  ShoppingCart, 
  Receipt, 
  CreditCard, 
  Banknote, 
  Coins, 
  Wallet, 
  PiggyBank, 
  TrendingDown, 
  AlertTriangle, 
  Info, 
  HelpCircle, 
  ExternalLink, 
  Link, 
  Copy, 
  Scissors, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Settings, 
  MoreHorizontal
} from 'lucide-react';

// Tipos para el formulario de cargos adicionales
export interface AdditionalCharge {
  id: string;
  taskId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  category: 'consumables' | 'equipment' | 'supplies' | 'other';
  notes?: string;
  timestamp: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  technician: string;
  supplier?: string;
  invoiceNumber?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

interface ChargeItem {
  id: string;
  name: string;
  category: 'consumables' | 'equipment' | 'supplies' | 'other';
  unitCost: number;
  supplier: string;
  stockAvailable: number;
  description: string;
  isActive: boolean;
}

interface AdditionalChargesFormProps {
  taskId: string;
  taskNumber: string;
  onChargesSubmitted?: (charges: AdditionalCharge[]) => void;
  onClose?: () => void;
  existingCharges?: AdditionalCharge[];
  maxItems?: number;
  allowApproval?: boolean;
}

export const AdditionalChargesForm: React.FC<AdditionalChargesFormProps> = ({
  taskId,
  taskNumber,
  onChargesSubmitted,
  onClose,
  existingCharges = [],
  maxItems = 20,
  allowApproval = false
}) => {
  const [charges, setCharges] = useState<AdditionalCharge[]>(existingCharges);
  const [availableItems, setAvailableItems] = useState<ChargeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ChargeItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showItemSelector, setShowItemSelector] = useState(false);

  // Cargar datos mock de items disponibles
  useEffect(() => {
    loadMockItems();
  }, []);

  const loadMockItems = () => {
    const mockItems: ChargeItem[] = [
      {
        id: '1',
        name: 'Guantes Quirúrgicos L',
        category: 'consumables',
        unitCost: 25,
        supplier: 'Medical Supplies Inc.',
        stockAvailable: 150,
        description: 'Guantes de látex estériles talla L',
        isActive: true
      },
      {
        id: '2',
        name: 'Jeringas 10ml',
        category: 'consumables',
        unitCost: 15,
        supplier: 'Medical Supplies Inc.',
        stockAvailable: 200,
        description: 'Jeringas estériles de 10ml con aguja',
        isActive: true
      },
      {
        id: '3',
        name: 'Gasas Estériles 10x10',
        category: 'consumables',
        unitCost: 8,
        supplier: 'Medical Supplies Inc.',
        stockAvailable: 300,
        description: 'Gasas estériles de 10x10cm',
        isActive: true
      },
      {
        id: '4',
        name: 'Cable HDMI 4K',
        category: 'equipment',
        unitCost: 150,
        supplier: 'TechSupply Co.',
        stockAvailable: 5,
        description: 'Cable HDMI 4K de alta velocidad',
        isActive: true
      },
      {
        id: '5',
        name: 'Batería de Respaldo',
        category: 'equipment',
        unitCost: 800,
        supplier: 'Power Solutions',
        stockAvailable: 3,
        description: 'Batería de respaldo para equipos críticos',
        isActive: true
      },
      {
        id: '6',
        name: 'Cinta Adhesiva Médica',
        category: 'supplies',
        unitCost: 12,
        supplier: 'Medical Supplies Inc.',
        stockAvailable: 100,
        description: 'Cinta adhesiva hipoalergénica',
        isActive: true
      },
      {
        id: '7',
        name: 'Desinfectante Hospitalario',
        category: 'supplies',
        unitCost: 45,
        supplier: 'CleanTech Solutions',
        stockAvailable: 25,
        description: 'Desinfectante de amplio espectro',
        isActive: true
      },
      {
        id: '8',
        name: 'Servicio de Urgencia',
        category: 'other',
        unitCost: 500,
        supplier: 'Servicios Especializados',
        stockAvailable: 999,
        description: 'Cargo por servicio de urgencia fuera de horario',
        isActive: true
      }
    ];

    setAvailableItems(mockItems);
  };

  const addCharge = () => {
    if (!selectedItem || quantity <= 0) {
      alert('Selecciona un item y especifica una cantidad válida');
      return;
    }

    if (charges.length >= maxItems) {
      alert(`Máximo ${maxItems} items permitidos`);
      return;
    }

    const newCharge: AdditionalCharge = {
      id: `charge_${Date.now()}`,
      taskId,
      itemName: selectedItem.name,
      quantity,
      unitCost: selectedItem.unitCost,
      totalCost: selectedItem.unitCost * quantity,
      category: selectedItem.category,
      notes: notes || `Uso durante procedimiento ${taskNumber}`,
      timestamp: new Date().toISOString(),
      approved: false,
      technician: 'Técnico actual', // TODO: Obtener usuario actual
      supplier: selectedItem.supplier,
      urgency,
      reason: reason || 'Uso durante procedimiento'
    };

    setCharges(prev => [...prev, newCharge]);
    
    // Limpiar formulario
    setSelectedItem(null);
    setQuantity(1);
    setNotes('');
    setReason('');
    setUrgency('medium');
  };

  const removeCharge = (chargeId: string) => {
    setCharges(prev => prev.filter(charge => charge.id !== chargeId));
  };

  const updateChargeQuantity = (chargeId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    setCharges(prev => prev.map(charge => 
      charge.id === chargeId 
        ? { 
            ...charge, 
            quantity: newQuantity, 
            totalCost: charge.unitCost * newQuantity 
          }
        : charge
    ));
  };

  const submitCharges = async () => {
    if (charges.length === 0) {
      alert('Agrega al menos un cargo adicional');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onChargesSubmitted) {
        onChargesSubmitted(charges);
      }
      
      // Cerrar modal
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error('Error al enviar cargos:', error);
      alert('Error al enviar los cargos. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      consumables: 'Consumibles',
      equipment: 'Equipos',
      supplies: 'Suministros',
      other: 'Otros'
    };
    return labels[category] || category;
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[urgency] || colors.medium;
  };

  const getUrgencyLabel = (urgency: string) => {
    const labels: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica'
    };
    return labels[urgency] || urgency;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalAmount = charges.reduce((sum, charge) => sum + charge.totalCost, 0);
  const totalItems = charges.reduce((sum, charge) => sum + charge.quantity, 0);

  const filteredItems = availableItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory && item.isActive;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="h-6 w-6" />
              <div>
                <CardTitle className="text-lg">Cargos Adicionales</CardTitle>
                <p className="text-sm opacity-90">
                  {taskNumber} • {charges.length} items • {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Resumen de cargos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600">Total Items</p>
              <p className="text-xl font-bold text-blue-900">{totalItems}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-600">Total Cargos</p>
              <p className="text-xl font-bold text-green-900">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-600">Items Críticos</p>
              <p className="text-xl font-bold text-yellow-900">
                {charges.filter(c => c.urgency === 'critical').length}
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-600">Categorías</p>
              <p className="text-xl font-bold text-purple-900">
                {new Set(charges.map(c => c.category)).size}
              </p>
            </div>
          </div>

          {/* Formulario para agregar cargos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agregar Cargo Adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Selector de item */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Item</label>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setShowItemSelector(true)}
                  >
                    <span>{selectedItem ? selectedItem.name : 'Seleccionar item...'}</span>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Cantidad */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cantidad</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Urgencia */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Urgencia</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>

                {/* Costo unitario (solo lectura) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Costo Unitario</label>
                  <Input
                    value={selectedItem ? formatCurrency(selectedItem.unitCost) : '$0.00'}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              {/* Razón */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Razón del uso</label>
                <Textarea
                  placeholder="Explica por qué se necesita este item adicional..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas adicionales</label>
                <Textarea
                  placeholder="Observaciones, especificaciones, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Botón agregar */}
              <Button
                onClick={addCharge}
                disabled={!selectedItem || quantity <= 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Cargo
              </Button>
            </CardContent>
          </Card>

          {/* Lista de cargos */}
          {charges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cargos Registrados ({charges.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {charges.map((charge) => (
                    <div key={charge.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{charge.itemName}</span>
                            <Badge className={getUrgencyColor(charge.urgency)}>
                              {getUrgencyLabel(charge.urgency)}
                            </Badge>
                            <Badge variant="outline">
                              {getCategoryLabel(charge.category)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{charge.reason}</p>
                          {charge.notes && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              "{charge.notes}"
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(charge.totalCost)}</p>
                          <p className="text-sm text-gray-500">
                            {charge.quantity} x {formatCurrency(charge.unitCost)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Cantidad:</span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateChargeQuantity(charge.id, charge.quantity - 1)}
                              disabled={charge.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {charge.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateChargeQuantity(charge.id, charge.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCharge(charge.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={submitCharges}
              disabled={charges.length === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Cargos ({formatCurrency(totalAmount)})
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal selector de items */}
      {showItemSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle>Seleccionar Item</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowItemSelector(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Filtros */}
              <div className="space-y-3">
                <Input
                  placeholder="Buscar items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex gap-2 overflow-x-auto">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={selectedCategory === 'consumables' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('consumables')}
                  >
                    Consumibles
                  </Button>
                  <Button
                    variant={selectedCategory === 'equipment' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('equipment')}
                  >
                    Equipos
                  </Button>
                  <Button
                    variant={selectedCategory === 'supplies' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('supplies')}
                  >
                    Suministros
                  </Button>
                  <Button
                    variant={selectedCategory === 'other' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('other')}
                  >
                    Otros
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No se encontraron items
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedItem(item);
                          setShowItemSelector(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{item.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(item.category)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <p className="text-xs text-gray-500">
                              Proveedor: {item.supplier} • Stock: {item.stockAvailable}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(item.unitCost)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdditionalChargesForm; 