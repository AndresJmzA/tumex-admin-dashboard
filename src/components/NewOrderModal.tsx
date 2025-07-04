import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { TimePicker } from '@/components/ui/TimePicker';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

// Tipos para el formulario de nueva orden
interface NewOrderFormData {
  // Información del cliente
  clientId: string;
  clientName: string;
  contactPerson: string;
  phone: string;
  email: string;
  
  // Información del paciente
  patientName: string;
  surgeryDate: string;
  surgeryTime: string;
  
  // Tipo de cobertura
  typeOfCoverage: 'Privado' | 'Seguro';
  insuranceName?: string;
  policyNumber?: string;
  authorizationNumber?: string;
  
  // Productos seleccionados
  selectedProducts: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
  
  // Notas adicionales
  notes: string;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: NewOrderFormData) => void;
}

// Datos mock de productos médicos
const medicalProducts = [
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

// Nueva estructura de datos mock: Cirugías -> Procedimientos -> Items
const cirugias = [
  {
    id: 'cir1',
    nombre: 'Cirugía de Rodilla',
    procedimientos: [
      {
        id: 'proc1',
        nombre: 'Artroscopía de Rodilla',
        items: [
          { id: 'item1', nombre: 'Monitor Multiparamétrico', tipo: 'normal', cantidad: 1, precio: 2500, incluido: true },
          { id: 'item2', nombre: 'Bomba de Infusión', tipo: 'normal', cantidad: 2, precio: 1200, incluido: true },
          {
            id: 'item3',
            nombre: 'Tipo de Balón',
            tipo: 'excluyente',
            opciones: [
              { id: 'item3a', nombre: 'Balón de Basquet', precio: 500, seleccionado: true },
              { id: 'item3b', nombre: 'Balón de Futbol', precio: 400, seleccionado: false }
            ]
          }
        ]
      },
      {
        id: 'proc2',
        nombre: 'Reemplazo Total de Rodilla',
        items: [
          { id: 'item4', nombre: 'Ventilador Mecánico', tipo: 'normal', cantidad: 1, precio: 4500, incluido: true },
          { id: 'item5', nombre: 'Mesa Quirúrgica', tipo: 'normal', cantidad: 1, precio: 12000, incluido: true },
          {
            id: 'item6',
            nombre: 'Tipo de Prótesis',
            tipo: 'excluyente',
            opciones: [
              { id: 'item6a', nombre: 'Prótesis Metálica', precio: 8000, seleccionado: true },
              { id: 'item6b', nombre: 'Prótesis Cerámica', precio: 9500, seleccionado: false }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'cir2',
    nombre: 'Cirugía Cardíaca',
    procedimientos: [
      {
        id: 'proc3',
        nombre: 'Bypass Coronario',
        items: [
          { id: 'item7', nombre: 'Monitor de Signos Vitales', tipo: 'normal', cantidad: 1, precio: 2800, incluido: true },
          { id: 'item8', nombre: 'Desfibrilador', tipo: 'normal', cantidad: 1, precio: 3500, incluido: true },
          {
            id: 'item9',
            nombre: 'Tipo de Sutura',
            tipo: 'excluyente',
            opciones: [
              { id: 'item9a', nombre: 'Sutura Absorbible', precio: 300, seleccionado: true },
              { id: 'item9b', nombre: 'Sutura No Absorbible', precio: 250, seleccionado: false }
            ]
          }
        ]
      }
    ]
  }
];

// Datos mock de clientes (hospitales, clínicas)
const mockClients = [
  {
    id: 'CLI001',
    name: 'Hospital General de la Ciudad',
    type: 'Hospital',
    location: 'Ciudad de México',
    contactPerson: 'Lic. María González',
    phone: '555-0101',
    email: 'logistica@hospitalgeneral.com',
    address: 'Av. Reforma 123, Col. Centro',
    ordersCount: 45,
    lastOrder: '2025-01-15'
  },
  {
    id: 'CLI002',
    name: 'Clínica Privada del Norte',
    type: 'Clínica',
    location: 'Monterrey',
    contactPerson: 'Dr. Roberto Silva',
    phone: '555-0202',
    email: 'roberto.silva@clinicanorte.com',
    address: 'Blvd. Constitución 456, Col. Norte',
    ordersCount: 23,
    lastOrder: '2025-01-20'
  },
  {
    id: 'CLI003',
    name: 'Hospital Especializado del Sur',
    type: 'Hospital',
    location: 'Guadalajara',
    contactPerson: 'Lic. Ana Martínez',
    phone: '555-0303',
    email: 'ana.martinez@hospitalsur.com',
    address: 'Calzada Independencia 789, Col. Sur',
    ordersCount: 67,
    lastOrder: '2025-01-18'
  },
  {
    id: 'CLI004',
    name: 'Centro Médico Integral',
    type: 'Centro Médico',
    location: 'Puebla',
    contactPerson: 'Dr. Luis Hernández',
    phone: '555-0404',
    email: 'luis.hernandez@centromedico.com',
    address: 'Av. Juárez 321, Col. Centro',
    ordersCount: 34,
    lastOrder: '2025-01-22'
  },
  {
    id: 'CLI005',
    name: 'Hospital Regional del Este',
    type: 'Hospital',
    location: 'Veracruz',
    contactPerson: 'Lic. Carmen Rodríguez',
    phone: '555-0505',
    email: 'carmen.rodriguez@hospitaleste.com',
    address: 'Blvd. Díaz Ordaz 654, Col. Este',
    ordersCount: 28,
    lastOrder: '2025-01-12'
  },
  {
    id: 'CLI006',
    name: 'Clínica Privada del Oeste',
    type: 'Clínica',
    location: 'Tijuana',
    contactPerson: 'Dr. Patricia Morales',
    phone: '555-0606',
    email: 'patricia.morales@clinicaoeste.com',
    address: 'Av. Revolución 987, Col. Oeste',
    ordersCount: 19,
    lastOrder: '2025-01-25'
  },
  {
    id: 'CLI007',
    name: 'Instituto Cardiovascular',
    type: 'Instituto',
    location: 'Querétaro',
    contactPerson: 'Dr. Carlos Mendoza',
    phone: '555-0707',
    email: 'carlos.mendoza@cardiovascular.com',
    address: 'Av. Tecnológico 147, Col. Industrial',
    ordersCount: 89,
    lastOrder: '2025-01-19'
  },
  {
    id: 'CLI008',
    name: 'Centro de Especialidades Médicas',
    type: 'Centro Médico',
    location: 'Mérida',
    contactPerson: 'Lic. Fernando López',
    phone: '555-0808',
    email: 'fernando.lopez@especialidades.com',
    address: 'Calle 60 258, Col. Centro',
    ordersCount: 42,
    lastOrder: '2025-01-21'
  }
];

const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NewOrderFormData>({
    clientId: '',
    clientName: '',
    contactPerson: '',
    phone: '',
    email: '',
    patientName: '',
    surgeryDate: '',
    surgeryTime: '',
    typeOfCoverage: 'Privado',
    selectedProducts: [],
    notes: ''
  });

  // Estados para selección de productos
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<Array<{id: string, name: string, category: string, quantity: number, price: number}>>([]);
  const [productQuantities, setProductQuantities] = useState<{[key: string]: number}>({});
  const [viewMode, setViewMode] = useState<'packages' | 'products'>('packages');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Estados para gestión de clientes
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientSearchType, setClientSearchType] = useState<string>('all');
  const [showClientList, setShowClientList] = useState(false);
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);

  const totalSteps = 5;
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Función para actualizar el formulario
  const updateFormData = (field: keyof NewOrderFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funciones para manejo de productos y paquetes
  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    const selectedPkg = cirugias.find(pkg => pkg.id === packageId);
    
    if (selectedPkg) {
      const products = selectedPkg.procedimientos.map(p => {
        const product = medicalProducts.find(prod => prod.id === p.items[0].id);
        return {
          id: p.items[0].id,
          name: product?.name || '',
          category: product?.category || '',
          quantity: p.items[0].cantidad,
          price: product?.price || 0
        };
      });
      
      setSelectedProducts(products);
      
      // Actualizar cantidades
      const quantities: {[key: string]: number} = {};
      p.items.forEach(i => {
        quantities[i.id] = i.cantidad;
      });
      setProductQuantities(quantities);
    }
  };

  const handleProductToggle = (productId: string, productName: string, category: string, price: number) => {
    const isSelected = selectedProducts.some(p => p.id === productId);
    
    if (isSelected) {
      // Remover producto
      setSelectedProducts(prev => prev.filter(p => p.id !== productId));
      setProductQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[productId];
        return newQuantities;
      });
    } else {
      // Agregar producto
      setSelectedProducts(prev => [...prev, { id: productId, name: productName, category, quantity: 1, price }]);
      setProductQuantities(prev => ({ ...prev, [productId]: 1 }));
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remover producto si cantidad es 0
      setSelectedProducts(prev => prev.filter(p => p.id !== productId));
      setProductQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[productId];
        return newQuantities;
      });
    } else {
      // Actualizar cantidad
      setProductQuantities(prev => ({ ...prev, [productId]: quantity }));
      setSelectedProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, quantity } : p
      ));
    }
  };

  // Calcular precio total
  const calculateTotalPrice = () => {
    return selectedProducts.reduce((total, product) => {
      const quantity = productQuantities[product.id] || 1;
      return total + (product.price * quantity);
    }, 0);
  };

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = medicalProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(medicalProducts.map(p => p.category)))];

  // Funciones para gestión de clientes
  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      contactPerson: client.contactPerson,
      phone: client.phone,
      email: client.email
    }));
    setShowClientList(false);
    setClientSearchQuery('');
  };

  const handleCreateNewClient = () => {
    setIsCreatingNewClient(true);
    setSelectedClient(null);
    setFormData(prev => ({
      ...prev,
      clientId: '',
      clientName: '',
      contactPerson: '',
      phone: '',
      email: ''
    }));
  };

  const handleSaveNewClient = () => {
    if (formData.clientName && formData.contactPerson && formData.phone) {
      const newClient = {
        id: `CLI${Date.now()}`,
        name: formData.clientName,
        type: 'Nuevo Cliente',
        location: 'Por definir',
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        address: 'Por definir',
        ordersCount: 0,
        lastOrder: new Date().toISOString().split('T')[0]
      };
      
      setSelectedClient(newClient);
      setFormData(prev => ({
        ...prev,
        clientId: newClient.id
      }));
      setIsCreatingNewClient(false);
    }
  };

  // Filtrar clientes por búsqueda y tipo
  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                         client.contactPerson.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                         client.location.toLowerCase().includes(clientSearchQuery.toLowerCase());
    const matchesType = clientSearchType === 'all' || client.type === clientSearchType;
    return matchesSearch && matchesType;
  });

  // Obtener tipos de cliente únicos
  const clientTypes = ['all', ...Array.from(new Set(mockClients.map(c => c.type)))];

  // Función para validar el paso actual
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1: // Información del cliente
        return !!(formData.clientName && formData.contactPerson && formData.phone && selectedClient);
      case 2: // Información del paciente
        return !!(formData.patientName && formData.surgeryDate && formData.surgeryTime);
      case 3: // Tipo de cobertura
        return !!(formData.typeOfCoverage && 
          (formData.typeOfCoverage === 'Privado' || 
           (formData.typeOfCoverage === 'Seguro' && formData.insuranceName)));
      case 4: // Productos
        return selectedProducts.length > 0;
      case 5: // Resumen y confirmación
        return true;
      default:
        return false;
    }
  };

  // Validación de fecha de cirugía
  const isSurgeryDateValid = () => {
    if (!formData.surgeryDate) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const selected = new Date(formData.surgeryDate);
    return selected >= today;
  };

  // Función para ir al siguiente paso
  const nextStep = () => {
    setErrorMessage('');
    if (!validateCurrentStep()) {
      setErrorMessage('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (currentStep === 2 && !isSurgeryDateValid()) {
      setErrorMessage('La fecha de cirugía no puede ser en el pasado.');
      return;
    }
    // Sincronizar productos seleccionados con formData antes de avanzar al resumen
    if (currentStep === 4) {
      setFormData(prev => ({ ...prev, selectedProducts }));
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Función para ir al paso anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función para enviar el formulario
  const handleSubmit = () => {
    setErrorMessage('');
    if (!validateCurrentStep()) {
      setErrorMessage('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (!isSurgeryDateValid()) {
      setErrorMessage('La fecha de cirugía no puede ser en el pasado.');
      return;
    }
    // Actualizar productos seleccionados con cantidades correctas
    const finalProducts = selectedProducts.map(product => ({
      ...product,
      quantity: productQuantities[product.id] || 1
    }));

    const orderDataWithProducts = {
      ...formData,
      selectedProducts: finalProducts
    };

    onSubmit(orderDataWithProducts);
    toast({
      title: 'Orden creada exitosamente',
      description: 'La orden ha sido registrada en el sistema.',
      variant: 'success',
    });
    onClose();
    // Resetear el formulario
    setFormData({
      clientId: '',
      clientName: '',
      contactPerson: '',
      phone: '',
      email: '',
      patientName: '',
      surgeryDate: '',
      surgeryTime: '',
      typeOfCoverage: 'Privado',
      selectedProducts: [],
      notes: ''
    });
    setCurrentStep(1);
    
    // Resetear estados de productos
    setSelectedPackage('');
    setSelectedProducts([]);
    setProductQuantities({});
    setViewMode('packages');
    setSearchQuery('');
    setSelectedCategory('all');
    
    // Resetear estados de clientes
    setSelectedClient(null);
    setClientSearchQuery('');
    setClientSearchType('all');
    setShowClientList(false);
    setIsCreatingNewClient(false);
  };

  // Nueva función para sincronizar productos seleccionados
  const syncSelectedProducts = (items) => {
    const selected: Array<{id: string, name: string, category: string, quantity: number, price: number}> = [];
    items.forEach(item => {
      if (item.tipo === 'normal' && item.incluido !== false) {
        selected.push({
          id: item.id,
          name: item.nombre,
          category: '',
          quantity: productQuantities[item.id] || item.cantidad,
          price: item.precio
        });
      }
      if (item.tipo === 'excluyente') {
        const selectedOption = item.opciones.find(op => op.seleccionado);
        if (selectedOption) {
          selected.push({
            id: selectedOption.id,
            name: selectedOption.nombre,
            category: '',
            quantity: 1,
            price: selectedOption.precio
          });
        }
      }
    });
    setSelectedProducts(selected);
  };

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Cliente seleccionado o búsqueda */}
            {selectedClient ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Cliente Seleccionado</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedClient(null);
                      setShowClientList(false);
                      setIsCreatingNewClient(false);
                    }}
                  >
                    Cambiar Cliente
                  </Button>
                </div>
                
                <Card className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-semibold text-lg">{selectedClient.name}</div>
                      <div className="text-sm text-gray-600">{selectedClient.type} • {selectedClient.location}</div>
                      <div className="text-sm text-gray-500 mt-1">{selectedClient.address}</div>
                    </div>
                    <div>
                      <div className="font-medium">{selectedClient.contactPerson}</div>
                      <div className="text-sm text-gray-600">{selectedClient.phone}</div>
                      <div className="text-sm text-gray-600">{selectedClient.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {selectedClient.ordersCount} órdenes • Última: {selectedClient.lastOrder}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : isCreatingNewClient ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Crear Nuevo Cliente</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreatingNewClient(false);
                      setShowClientList(true);
                    }}
                  >
                    Buscar Cliente Existente
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nombre del Cliente *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => updateFormData('clientName', e.target.value)}
                      placeholder="Ej: Hospital General de la Ciudad"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Persona de Contacto *</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => updateFormData('contactPerson', e.target.value)}
                      placeholder="Ej: Lic. María González"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      placeholder="Ej: 555-0101"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      placeholder="Ej: logistica@hospital.com"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleSaveNewClient} disabled={!formData.clientName || !formData.contactPerson || !formData.phone}>
                    Guardar Cliente
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreatingNewClient(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seleccionar Cliente</h3>
                
                {/* Búsqueda de clientes */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar por nombre, contacto o ubicación..."
                      value={clientSearchQuery}
                      onChange={(e) => setClientSearchQuery(e.target.value)}
                      onFocus={() => setShowClientList(true)}
                      className="w-full"
                    />
                  </div>
                  <div className="sm:w-48">
                    <Select value={clientSearchType} onValueChange={setClientSearchType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type === 'all' ? 'Todos los tipos' : type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Lista de clientes */}
                {showClientList && (
                  <div className="max-h-64 overflow-y-auto border rounded-md">
                    {filteredClients.length > 0 ? (
                      filteredClients.map(client => (
                        <div 
                          key={client.id}
                          className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleClientSelect(client)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-gray-600">{client.contactPerson}</div>
                              <div className="text-sm text-gray-500">{client.type} • {client.location}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">{client.phone}</div>
                              <div className="text-xs text-gray-500">{client.ordersCount} órdenes</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No se encontraron clientes
                      </div>
                    )}
                  </div>
                )}

                {/* Botón para crear nuevo cliente */}
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={handleCreateNewClient}
                    className="w-full"
                  >
                    + Crear Nuevo Cliente
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Nombre del Paciente *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => updateFormData('patientName', e.target.value)}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surgeryDate">Fecha de Cirugía *</Label>
                <Input
                  id="surgeryDate"
                  type="date"
                  value={formData.surgeryDate}
                  onChange={(e) => updateFormData('surgeryDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surgeryTime">Hora de Cirugía *</Label>
                <TimePicker
                  id="surgeryTime"
                  value={formData.surgeryTime}
                  onChange={(val) => updateFormData('surgeryTime', val)}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typeOfCoverage">Tipo de Cobertura *</Label>
              <Select
                value={formData.typeOfCoverage}
                onValueChange={(value: 'Privado' | 'Seguro') => updateFormData('typeOfCoverage', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo de cobertura" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Privado">Privado</SelectItem>
                  <SelectItem value="Seguro">Seguro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.typeOfCoverage === 'Seguro' && (
              <div className="space-y-2">
                <Label htmlFor="insuranceName">Nombre de la Aseguradora *</Label>
                <Input
                  id="insuranceName"
                  value={formData.insuranceName || ''}
                  onChange={(e) => updateFormData('insuranceName', e.target.value)}
                  placeholder="Ej: Axxa"
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Dropdown de Cirugías */}
            <div className="space-y-2">
              <Label htmlFor="cirugia-select">Selecciona la cirugía</Label>
              <Select
                value={selectedPackage}
                onValueChange={(val) => {
                  setSelectedPackage(val);
                  setSelectedCategory('');
                  setSelectedProducts([]);
                  setProductQuantities({});
                }}
                id="cirugia-select"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elige una cirugía..." />
                </SelectTrigger>
                <SelectContent>
                  {cirugias.map(cir => (
                    <SelectItem key={cir.id} value={cir.id}>{cir.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cards de Procedimientos */}
            {selectedPackage && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Procedimientos Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cirugias.find(c => c.id === selectedPackage)?.procedimientos.map(proc => (
                    <Card
                      key={proc.id}
                      className={`cursor-pointer transition-all ${selectedCategory === proc.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
                      onClick={() => setSelectedCategory(proc.id)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{proc.nombre}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-gray-600 mb-2">
                          {proc.items.length} items en el paquete
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Edición de Items del Procedimiento Seleccionado */}
            {selectedPackage && selectedCategory && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold mb-3">Personaliza el Paquete</h4>
                <div className="space-y-2">
                  {cirugias
                    .find(c => c.id === selectedPackage)
                    ?.procedimientos.find(p => p.id === selectedCategory)
                    ?.items.map(item => {
                      if (item.tipo === 'normal') {
                        return (
                          <div key={item.id} className="flex items-center gap-4 border-b py-2">
                            <Checkbox
                              checked={item.incluido !== false}
                              onCheckedChange={(checked) => {
                                item.incluido = !!checked;
                                syncSelectedProducts(cirugias.find(c => c.id === selectedPackage)?.procedimientos.find(p => p.id === selectedCategory)?.items || []);
                              }}
                            />
                            <span className="flex-1">{item.nombre}</span>
                            <span className="text-gray-500">${item.precio.toLocaleString()}</span>
                            {item.incluido !== false && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    item.incluido = false;
                                    syncSelectedProducts(cirugias.find(c => c.id === selectedPackage)?.procedimientos.find(p => p.id === selectedCategory)?.items || []);
                                  }}
                                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                                >-</button>
                                <span className="w-8 text-center">{productQuantities[item.id] || item.cantidad}</span>
                                <button
                                  onClick={() => {
                                    item.incluido = true;
                                    syncSelectedProducts(cirugias.find(c => c.id === selectedPackage)?.procedimientos.find(p => p.id === selectedCategory)?.items || []);
                                  }}
                                  className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                                >+</button>
                              </div>
                            )}
                          </div>
                        );
                      }
                      if (item.tipo === 'excluyente') {
                        return (
                          <div key={item.id} className="flex flex-col gap-2 border-b py-2">
                            <span className="font-medium">{item.nombre}</span>
                            <div className="flex gap-4">
                              {item.opciones.map(op => (
                                <label key={op.id} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={item.id}
                                    checked={op.seleccionado}
                                    onChange={() => {
                                      op.seleccionado = true;
                                      syncSelectedProducts(cirugias.find(c => c.id === selectedPackage)?.procedimientos.find(p => p.id === selectedCategory)?.items || []);
                                    }}
                                  />
                                  <span>{op.nombre}</span>
                                  <span className="text-gray-500">${op.precio.toLocaleString()}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                </div>
              </div>
            )}

            {/* Resumen de productos seleccionados */}
            {selectedProducts.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Productos Seleccionados</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedProducts.map(product => {
                    const quantity = productQuantities[product.id] || product.quantity || 1;
                    return (
                      <div key={product.id} className="flex justify-between items-center text-sm">
                        <span>{product.name} x{quantity}</span>
                        <span className="font-medium">
                          ${(product.price * quantity).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t pt-2 mt-3">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total:</span>
                    <span className="text-lg text-blue-600">
                      ${calculateTotalPrice().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        // Paso de resumen y confirmación
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold mb-2">Resumen de la Orden</h3>
            <div className="space-y-4">
              {/* Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle>Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{formData.clientName}</div>
                  <div className="text-sm text-gray-600">{formData.contactPerson} • {formData.phone}</div>
                  <div className="text-sm text-gray-500">{formData.email}</div>
                </CardContent>
              </Card>
              {/* Paciente */}
              <Card>
                <CardHeader>
                  <CardTitle>Paciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{formData.patientName}</div>
                  <div className="text-sm text-gray-600">Cirugía: {formData.surgeryDate} a las {formData.surgeryTime}</div>
                </CardContent>
              </Card>
              {/* Cobertura */}
              <Card>
                <CardHeader>
                  <CardTitle>Cobertura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold">{formData.typeOfCoverage}</div>
                  {formData.typeOfCoverage === 'Seguro' && (
                    <div className="text-sm text-gray-600">Aseguradora: {formData.insuranceName}</div>
                  )}
                </CardContent>
              </Card>
              {/* Procedimiento y productos */}
              <Card>
                <CardHeader>
                  <CardTitle>Procedimiento y Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPackage && selectedCategory && (
                    <div className="mb-2">
                      <div className="font-semibold">{cirugias.find(c => c.id === selectedPackage)?.nombre} - {cirugias.find(c => c.id === selectedPackage)?.procedimientos.find(p => p.id === selectedCategory)?.nombre}</div>
                    </div>
                  )}
                  <div className="space-y-1">
                    {formData.selectedProducts.map(product => (
                      <div key={product.id} className="flex justify-between text-sm">
                        <span>{product.name} x{product.quantity}</span>
                        <span>${(product.price * product.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-lg text-blue-600">${calculateTotalPrice().toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Verifica que todos los datos sean correctos antes de confirmar la orden.</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-none pb-32' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <span>Nueva Orden</span>
            <Badge variant="secondary" className="text-xs">
              Paso {currentStep} de {totalSteps}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Indicador de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Contenido del paso actual */}
        <div className="flex-1 pb-6">
          {renderCurrentStep()}
        </div>

        {/* Botones de navegación */}
        <div className="flex justify-between pt-4 border-t bg-white sticky bottom-0">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            
            {currentStep === totalSteps ? (
              <Button
                onClick={handleSubmit}
                disabled={!validateCurrentStep()}
              >
                Confirmar y crear orden
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!validateCurrentStep()}
              >
                Siguiente
              </Button>
            )}
          </div>
        </div>

        {/* Mostrar mensaje de error si existe */}
        {errorMessage && (<div className="text-red-600 text-sm mb-2">{errorMessage}</div>)}
      </DialogContent>
    </Dialog>
  );
};

export default NewOrderModal; 