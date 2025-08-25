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
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  Edit, 
  Save, 
  Send, 
  Calculator,
  Package,
  User,
  Calendar,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Plus,
  Minus,
  History,
  Clock
} from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { orderService, ExtendedOrder } from '@/services/orderService';

// Tipos para el modal de generación de remisiones
interface RemissionItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  serialNumber?: string;
  condition: 'excellent' | 'good' | 'fair' | 'maintenance';
  notes: string;
}

interface RemissionData {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
  };
  patient: {
    name: string;
    id: string;
    age: number;
    gender: 'male' | 'female' | 'other';
  };
  surgery: {
    name: string;
    date: string;
    time: string;
    location: string;
    doctor: string;
    specialRequirements: string;
  };
  equipment: RemissionItem[];
  services: Array<{
    id: string;
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  additionalCharges: Array<{
    id: string;
    description: string;
    amount: number;
    approved: boolean;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    total: number;
    deposit: number;
    balance: number;
  };
  notes: string;
  terms: string;
  generatedBy: string;
  generatedAt: string;
  status: 'draft' | 'sent' | 'approved' | 'paid';
}

interface RemissionHistory {
  id: string;
  orderId: string;
  remissionId: string;
  generatedAt: string;
  generatedBy: string;
  status: string;
  notes?: string;
}

interface RemissionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onGenerate: (remission: RemissionData) => void;
}

const RemissionGeneratorModal: React.FC<RemissionGeneratorModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onGenerate
}) => {
  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [remissionData, setRemissionData] = useState<RemissionData | null>(null);
  const [remissionHistory, setRemissionHistory] = useState<RemissionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeTax, setIncludeTax] = useState(true);
  const [taxRate, setTaxRate] = useState(16);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  // Cargar datos de la orden
  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderData();
      loadRemissionHistory();
    }
  }, [isOpen, orderId]);

  const loadOrderData = async () => {
    try {
      setIsLoading(true);
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);

      if (orderData) {
        // Crear datos de remisión basados en la orden real
        const remissionData: RemissionData = {
          id: `REM-${Date.now()}`,
          orderId: orderData.id,
          orderNumber: orderData.id,
          customer: {
            name: orderData.doctorInfo?.doctorName || 'Doctor no especificado',
            address: 'Dirección del hospital',
            phone: orderData.doctorInfo?.phone || '+52 55 1234 5678',
            email: orderData.doctorInfo?.email || 'doctor@hospital.com',
            taxId: 'RFC123456789'
          },
          patient: {
            name: orderData.patient_name,
            id: orderData.patientId || 'P-001',
            age: 45, // Valor por defecto
            gender: 'female' as const
          },
          surgery: {
            name: orderData.procedureInfo?.procedureName || 'Procedimiento no especificado',
            date: orderData.surgery_date,
            time: orderData.surgery_time,
            location: orderData.surgery_location,
            doctor: orderData.doctorInfo?.doctorName || 'Doctor no especificado',
            specialRequirements: orderData.notes || 'Sin requisitos especiales'
          },
          equipment: orderData.products?.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.quantity * item.price,
            serialNumber: `SN-${item.id.padStart(6, '0')}`,
            condition: 'excellent' as const,
            notes: ''
          })) || [],
          services: [
            {
              id: '1',
              name: 'Servicio de Técnico',
              description: 'Servicio de instalación y configuración',
              quantity: 1,
              unitPrice: 500,
              totalPrice: 500
            },
            {
              id: '2',
              name: 'Transporte',
              description: 'Transporte de equipos al sitio',
              quantity: 1,
              unitPrice: 300,
              totalPrice: 300
            }
          ],
          additionalCharges: [],
          totals: {
            subtotal: 0,
            tax: 0,
            total: 0,
            deposit: 0,
            balance: 0
          },
          notes: orderData.notes || '',
          terms: 'Pago a 30 días. Equipos deben ser devueltos en buen estado.',
          generatedBy: 'Gerente Administrativo',
          generatedAt: new Date().toISOString(),
          status: 'draft'
        };

        setRemissionData(remissionData);
        calculateTotals(remissionData);
      }
    } catch (error) {
      console.error('Error loading order data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de la orden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRemissionHistory = async () => {
    try {
      // Simular historial de remisiones (en una implementación real, esto vendría de Supabase)
      const history: RemissionHistory[] = [
        {
          id: 'hist-1',
          orderId,
          remissionId: 'REM-001',
          generatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
          generatedBy: 'Gerente Administrativo',
          status: 'sent',
          notes: 'Primera remisión enviada'
        }
      ];
      setRemissionHistory(history);
    } catch (error) {
      console.error('Error loading remission history:', error);
    }
  };

  // Calcular totales
  const calculateTotals = (data: RemissionData) => {
    const equipmentTotal = data.equipment.reduce((sum, item) => sum + item.totalPrice, 0);
    const servicesTotal = data.services.reduce((sum, service) => sum + service.totalPrice, 0);
    const chargesTotal = data.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    
    const subtotal = equipmentTotal + servicesTotal + chargesTotal;
    const tax = includeTax ? subtotal * (taxRate / 100) : 0;
    const total = subtotal + tax;
    const deposit = total * 0.3; // 30% de depósito
    const balance = total - deposit;

    setRemissionData(prev => prev ? {
      ...prev,
      totals: { subtotal, tax, total, deposit, balance }
    } : null);
  };

  // Actualizar datos del cliente
  const updateCustomerData = (field: keyof RemissionData['customer'], value: string) => {
    setRemissionData(prev => prev ? {
      ...prev,
      customer: { ...prev.customer, [field]: value }
    } : null);
  };

  // Actualizar datos del paciente
  const updatePatientData = (field: keyof RemissionData['patient'], value: string | number) => {
    setRemissionData(prev => prev ? {
      ...prev,
      patient: { ...prev.patient, [field]: value }
    } : null);
  };

  // Actualizar datos de la cirugía
  const updateSurgeryData = (field: keyof RemissionData['surgery'], value: string) => {
    setRemissionData(prev => prev ? {
      ...prev,
      surgery: { ...prev.surgery, [field]: value }
    } : null);
  };

  // Agregar servicio
  const addService = () => {
    if (!remissionData) return;

    const newService = {
      id: `service-${Date.now()}`,
      name: 'Nuevo Servicio',
      description: 'Descripción del servicio',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };

    setRemissionData(prev => prev ? {
      ...prev,
      services: [...prev.services, newService]
    } : null);
  };

  // Actualizar servicio
  const updateService = (serviceId: string, field: string, value: string | number) => {
    setRemissionData(prev => prev ? {
      ...prev,
      services: prev.services.map(service => {
        if (service.id === serviceId) {
          const updated = { ...service, [field]: value };
          updated.totalPrice = updated.quantity * updated.unitPrice;
          return updated;
        }
        return service;
      })
    } : null);
  };

  // Eliminar servicio
  const removeService = (serviceId: string) => {
    setRemissionData(prev => prev ? {
      ...prev,
      services: prev.services.filter(service => service.id !== serviceId)
    } : null);
  };

  // Generar PDF
  const handleGeneratePDF = async () => {
    if (!remissionData) return;

    setIsGenerating(true);
    
    try {
      // Simular generación de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      calculateTotals(remissionData);
      
      // Guardar en historial
      const newHistoryItem: RemissionHistory = {
        id: `hist-${Date.now()}`,
        orderId: remissionData.orderId,
        remissionId: remissionData.id,
        generatedAt: new Date().toISOString(),
        generatedBy: remissionData.generatedBy,
        status: 'generated',
        notes: 'Remisión generada exitosamente'
      };

      setRemissionHistory(prev => [newHistoryItem, ...prev]);
      
      await onGenerate(remissionData);
      
      toast({
        title: "Remisión generada",
        description: "El PDF de la remisión ha sido generado exitosamente.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la remisión.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Imprimir remisión
  const handlePrint = () => {
    if (!remissionData) return;
    
    // Simular impresión
    toast({
      title: "Imprimiendo",
      description: "Enviando remisión a la impresora...",
    });
  };

  // Enviar por email
  const handleSendEmail = () => {
    if (!remissionData) return;
    
    // Simular envío por email
    toast({
      title: "Enviando",
      description: "Remisión enviada por email al doctor.",
    });
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Cargando información de la orden...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!order || !remissionData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="text-center p-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p>No se pudo cargar la información de la orden.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Generar Remisión - Orden {order.id}</span>
            <Badge className={getStatusColor(remissionData.status)}>
              {remissionData.status.toUpperCase()}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="ml-auto"
            >
              <History className="h-4 w-4 mr-1" />
              Historial
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo: Configuración */}
          <div className="space-y-6">
            {/* Información del cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nombre del Cliente</Label>
                  <Input
                    id="customerName"
                    value={remissionData.customer.name}
                    onChange={(e) => updateCustomerData('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Dirección</Label>
                  <Textarea
                    id="customerAddress"
                    value={remissionData.customer.address}
                    onChange={(e) => updateCustomerData('address', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Teléfono</Label>
                    <Input
                      id="customerPhone"
                      value={remissionData.customer.phone}
                      onChange={(e) => updateCustomerData('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      value={remissionData.customer.email}
                      onChange={(e) => updateCustomerData('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerTaxId">RFC</Label>
                  <Input
                    id="customerTaxId"
                    value={remissionData.customer.taxId}
                    onChange={(e) => updateCustomerData('taxId', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información del paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Nombre del Paciente</Label>
                    <Input
                      id="patientName"
                      value={remissionData.patient.name}
                      onChange={(e) => updatePatientData('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientId">ID del Paciente</Label>
                    <Input
                      id="patientId"
                      value={remissionData.patient.id}
                      onChange={(e) => updatePatientData('id', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientAge">Edad</Label>
                    <Input
                      id="patientAge"
                      type="number"
                      value={remissionData.patient.age}
                      onChange={(e) => updatePatientData('age', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientGender">Género</Label>
                    <Select 
                      value={remissionData.patient.gender} 
                      onValueChange={(value: 'male' | 'female' | 'other') => updatePatientData('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Femenino</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de la cirugía */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Información de la Cirugía
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="surgeryName">Tipo de Cirugía</Label>
                  <Input
                    id="surgeryName"
                    value={remissionData.surgery.name}
                    onChange={(e) => updateSurgeryData('name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="surgeryDate">Fecha</Label>
                    <Input
                      id="surgeryDate"
                      type="date"
                      value={remissionData.surgery.date}
                      onChange={(e) => updateSurgeryData('date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surgeryTime">Hora</Label>
                    <Input
                      id="surgeryTime"
                      type="time"
                      value={remissionData.surgery.time}
                      onChange={(e) => updateSurgeryData('time', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surgeryLocation">Ubicación</Label>
                  <Input
                    id="surgeryLocation"
                    value={remissionData.surgery.location}
                    onChange={(e) => updateSurgeryData('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surgeryDoctor">Doctor</Label>
                  <Input
                    id="surgeryDoctor"
                    value={remissionData.surgery.doctor}
                    onChange={(e) => updateSurgeryData('doctor', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surgeryRequirements">Requisitos Especiales</Label>
                  <Textarea
                    id="surgeryRequirements"
                    value={remissionData.surgery.specialRequirements}
                    onChange={(e) => updateSurgeryData('specialRequirements', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Servicios adicionales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Servicios Adicionales
                  </span>
                  <Button size="sm" onClick={addService}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {remissionData.services.map(service => (
                  <div key={service.id} className="border rounded p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Input
                        value={service.name}
                        onChange={(e) => updateService(service.id, 'name', e.target.value)}
                        placeholder="Nombre del servicio"
                        className="flex-1 mr-2"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeService(service.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={service.description}
                      onChange={(e) => updateService(service.id, 'description', e.target.value)}
                      placeholder="Descripción del servicio"
                      rows={2}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Cantidad</Label>
                        <Input
                          type="number"
                          value={service.quantity}
                          onChange={(e) => updateService(service.id, 'quantity', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Precio Unit.</Label>
                        <Input
                          type="number"
                          value={service.unitPrice}
                          onChange={(e) => updateService(service.id, 'unitPrice', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total</Label>
                        <Input
                          value={formatCurrency(service.totalPrice)}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Configuración de impuestos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Configuración de Impuestos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeTax"
                    checked={includeTax}
                    onCheckedChange={(checked) => setIncludeTax(!!checked)}
                  />
                  <Label htmlFor="includeTax">Incluir IVA</Label>
                </div>
                {includeTax && (
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tasa de IVA (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel central: Vista previa */}
          <div className="space-y-6">
            {/* Vista previa de la remisión */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Vista Previa de la Remisión
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="text-center mb-4">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Vista previa del PDF</p>
                </div>
                
                {/* Encabezado */}
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold">TUMex - Equipos Médicos</h2>
                  <p className="text-sm text-gray-600">Nota de Remisión</p>
                  <p className="text-xs text-gray-500">Remisión: {remissionData.id}</p>
                </div>

                {/* Información del cliente */}
                <div className="mb-4 text-sm">
                  <h3 className="font-medium mb-2">Cliente:</h3>
                  <p>{remissionData.customer.name}</p>
                  <p className="text-gray-600">{remissionData.customer.address}</p>
                  <p className="text-gray-600">RFC: {remissionData.customer.taxId}</p>
                </div>

                {/* Información del paciente */}
                <div className="mb-4 text-sm">
                  <h3 className="font-medium mb-2">Paciente:</h3>
                  <p>{remissionData.patient.name} - ID: {remissionData.patient.id}</p>
                  <p className="text-gray-600">Edad: {remissionData.patient.age} años</p>
                </div>

                {/* Información de la cirugía */}
                <div className="mb-4 text-sm">
                  <h3 className="font-medium mb-2">Cirugía:</h3>
                  <p>{remissionData.surgery.name}</p>
                  <p className="text-gray-600">
                    {new Date(remissionData.surgery.date).toLocaleDateString('es-ES')} a las {remissionData.surgery.time}
                  </p>
                  <p className="text-gray-600">Ubicación: {remissionData.surgery.location}</p>
                  <p className="text-gray-600">Doctor: {remissionData.surgery.doctor}</p>
                </div>

                {/* Equipos */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Equipos:</h3>
                  <div className="space-y-1">
                    {remissionData.equipment.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Servicios */}
                {remissionData.services.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Servicios:</h3>
                    <div className="space-y-1">
                      {remissionData.services.map(service => (
                        <div key={service.id} className="flex justify-between text-sm">
                          <span>{service.name}</span>
                          <span>{formatCurrency(service.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Totales */}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(remissionData.totals.subtotal)}</span>
                  </div>
                  {includeTax && (
                    <div className="flex justify-between text-sm">
                      <span>IVA ({taxRate}%):</span>
                      <span>{formatCurrency(remissionData.totals.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{formatCurrency(remissionData.totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Equipos:</span>
                    <p className="text-lg font-bold">{remissionData.equipment.length}</p>
                  </div>
                  <div>
                    <span className="font-medium">Servicios:</span>
                    <p className="text-lg font-bold">{remissionData.services.length}</p>
                  </div>
                  <div>
                    <span className="font-medium">Subtotal:</span>
                    <p className="text-lg font-bold">{formatCurrency(remissionData.totals.subtotal)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Total:</span>
                    <p className="text-lg font-bold">{formatCurrency(remissionData.totals.total)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel derecho: Historial y acciones */}
          <div className="space-y-6">
            {/* Historial de remisiones */}
            {showHistory && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Historial de Remisiones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {remissionHistory.map(item => (
                      <div key={item.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{item.remissionId}</span>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Generado: {formatDate(item.generatedAt)}</p>
                          <p>Por: {item.generatedBy}</p>
                          {item.notes && <p>Notas: {item.notes}</p>}
                        </div>
                      </div>
                    ))}
                    {remissionHistory.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No hay historial de remisiones
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acciones rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handlePrint}
                  className="w-full"
                  variant="outline"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button 
                  onClick={handleSendEmail}
                  className="w-full"
                  variant="outline"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar por Email
                </Button>
                <Button 
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generar PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Información de la orden */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Información de la Orden
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>ID de Orden:</span>
                  <span className="font-medium">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Paciente:</span>
                  <span className="font-medium">{order.patient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Doctor:</span>
                  <span className="font-medium">{order.doctorInfo?.doctorName || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Procedimiento:</span>
                  <span className="font-medium">{order.procedureInfo?.procedureName || 'No especificado'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span className="font-medium">{new Date(order.surgery_date).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hora:</span>
                  <span className="font-medium">{order.surgery_time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ubicación:</span>
                  <span className="font-medium">{order.surgery_location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cobertura:</span>
                  <span className="font-medium">{order.coverage_type || 'No especificada'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Productos:</span>
                  <span className="font-medium">{order.products?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{formatCurrency(order.totalAmount || 0)}</span>
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
            onClick={handleGeneratePDF}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generando...' : 'Generar PDF'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemissionGeneratorModal; 