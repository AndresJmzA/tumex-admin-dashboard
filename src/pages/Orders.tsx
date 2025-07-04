import React, { useState, useEffect } from 'react';
import OrderCard, { OrderCardProps } from '@/components/OrderCard';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import DualApprovalModal from '@/components/DualApprovalModal';
import PriceCalculatorModal from '@/components/PriceCalculatorModal';
import NewOrderModal from '@/components/NewOrderModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';

// Tipo extendido para órdenes con detalles completos
interface ExtendedOrderCardProps extends OrderCardProps {
  clientInfo?: {
    clientId: string;
    clientName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  };
  products?: Array<{
    id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    changedBy: string;
    notes?: string;
  }>;
  approvals?: Array<{
    adminName: string;
    timestamp: string;
    approved: boolean;
    notes?: string;
  }>;
  requiresApproval?: boolean;
  totalAmount?: number;
}

// Tipos para el sistema de aprobación dual
interface ApprovalAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ApprovalRequest {
  orderId: string;
  patientName: string;
  totalAmount: number;
  requiresApproval: boolean;
  currentApprovals: Array<{
    adminId: string;
    adminName: string;
    approved: boolean;
    timestamp?: string;
    notes?: string;
    signature?: string;
  }>;
  requiredAdmins: ApprovalAdmin[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  deadline?: string;
}

const Orders: React.FC = () => {
  console.log('Orders component is rendering');
  
  const [selectedState, setSelectedState] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrderCardProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedApprovalRequest, setSelectedApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();
  
  // Carousel state for mobile
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Estados para nueva orden
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    carouselApi.on('select', onSelect);
    onSelect();
    return () => carouselApi.off('select', onSelect);
  }, [carouselApi]);

  // Estados reales de Firebase simplificados
  const orderStates = [
    { value: 'all', label: 'Todas las órdenes', count: 24 },
    { value: 'submitted', label: 'Enviadas', count: 8 },
    { value: 'review', label: 'En Revisión', count: 5 },
    { value: 'approved', label: 'Aprobadas', count: 6 },
    { value: 'preparing', label: 'Preparando', count: 3 },
    { value: 'completed', label: 'Completadas', count: 2 },
    { value: 'cancelled', label: 'Canceladas', count: 0 }
  ];

  const currentState = orderStates.find(s => s.value === selectedState);

  // Datos mock de órdenes básicos
  const mockOrders: ExtendedOrderCardProps[] = [
    {
      orderId: 'ORDPAQJODO220601',
      status: 'review',
      patientName: 'Paciente Sin Aprobaciones',
      patientId: '00000001',
      surgeryDate: '2025-06-10',
      surgeryTime: '8:00 AM',
      typeOfCoverage: 'Seguro',
      insuranceName: 'Axxa',
      itemsCount: 5,
      createdAt: '2025-06-10T08:00:00',
      approvals: [
        { adminName: 'Admin 1', timestamp: '', approved: false, notes: '' },
        { adminName: 'Admin 2', timestamp: '', approved: false, notes: '' }
      ]
    },
    {
      orderId: 'ORDPAQJODO220602',
      status: 'review',
      patientName: 'Paciente Una Aprobación',
      patientId: '00000002',
      surgeryDate: '2025-06-11',
      surgeryTime: '9:00 AM',
      typeOfCoverage: 'Privado',
      itemsCount: 7,
      createdAt: '2025-06-11T09:00:00',
      approvals: [
        { adminName: 'Admin 1', timestamp: '2025-06-11T10:00:00', approved: true, notes: 'Primera aprobación' },
        { adminName: 'Admin 2', timestamp: '', approved: false, notes: '' }
      ]
    },
    {
      orderId: 'ORDPAQJODO220603',
      status: 'approved',
      patientName: 'Paciente Dos Aprobaciones',
      patientId: '00000003',
      surgeryDate: '2025-06-12',
      surgeryTime: '10:00 AM',
      typeOfCoverage: 'Seguro',
      insuranceName: 'GNP',
      itemsCount: 9,
      createdAt: '2025-06-12T10:00:00',
      approvals: [
        { adminName: 'Admin 1', timestamp: '2025-06-12T11:00:00', approved: true, notes: 'Primera aprobación' },
        { adminName: 'Admin 2', timestamp: '2025-06-12T12:00:00', approved: true, notes: 'Segunda aprobación' }
      ]
    },
    {
      orderId: 'ORDPAQJODO220625',
      status: 'submitted',
      patientName: 'Nombre test',
      patientId: '12345678',
      surgeryDate: '2025-06-22',
      surgeryTime: '4:56 PM',
      typeOfCoverage: 'Seguro',
      insuranceName: 'Axxa',
      itemsCount: 13,
      createdAt: '2025-06-22T16:58:19',
      requiresApproval: true,
      totalAmount: 11700,
      clientInfo: {
        clientId: 'CLI001',
        clientName: 'Hospital General de la Ciudad',
        contactPerson: 'Lic. María González',
        phone: '555-0101',
        email: 'logistica@hospitalgeneral.com'
      },
      products: [
        { id: '1', name: 'Monitor Multiparamétrico', category: 'Monitoreo', quantity: 1, price: 2500 },
        { id: '2', name: 'Bomba de Infusión', category: 'Infusión', quantity: 2, price: 1200 },
        { id: '3', name: 'Desfibrilador', category: 'Emergencia', quantity: 1, price: 3500 },
        { id: '4', name: 'Ventilador Mecánico', category: 'Respiración', quantity: 1, price: 4500 }
      ],
      statusHistory: [
        { status: 'submitted', timestamp: '2025-06-22T16:58:19', changedBy: 'Sistema', notes: 'Orden creada automáticamente' },
        { status: 'review', timestamp: '2025-06-22T17:30:00', changedBy: 'Admin 1', notes: 'Enviada a revisión' }
      ],
      approvals: [
        { adminName: 'Admin 1', timestamp: '2025-06-22T17:30:00', approved: true, notes: 'Aprobada inicialmente' },
        { adminName: 'Admin 2', timestamp: '', approved: false, notes: 'Pendiente de segunda aprobación' }
      ]
    },
    {
      orderId: 'ORDPAQJODO220626',
      status: 'review',
      patientName: 'Juan Pérez',
      patientId: '87654321',
      surgeryDate: '2025-06-23',
      surgeryTime: '10:00 AM',
      typeOfCoverage: 'Privado',
      itemsCount: 8,
      createdAt: '2025-06-21T09:15:00',
      clientInfo: {
        clientId: 'CLI002',
        clientName: 'Clínica Privada del Norte',
        contactPerson: 'Dr. Roberto Silva',
        phone: '555-0202',
        email: 'roberto.silva@clinicanorte.com'
      },
      products: [
        { id: '5', name: 'Electrocardiógrafo', category: 'Cardiología', quantity: 1, price: 1800 },
        { id: '6', name: 'Oxímetro de Pulso', category: 'Monitoreo', quantity: 3, price: 300 },
        { id: '7', name: 'Lámpara Quirúrgica', category: 'Iluminación', quantity: 1, price: 2200 }
      ],
      statusHistory: [
        { status: 'submitted', timestamp: '2025-06-21T09:15:00', changedBy: 'Sistema', notes: 'Orden creada automáticamente' },
        { status: 'review', timestamp: '2025-06-21T10:00:00', changedBy: 'Admin 1', notes: 'Enviada a revisión' }
      ]
    },
    {
      orderId: 'ORDPAQJODO220627',
      status: 'approved',
      patientName: 'María López',
      patientId: '11223344',
      surgeryDate: '2025-06-24',
      surgeryTime: '12:30 PM',
      typeOfCoverage: 'Seguro',
      insuranceName: 'GNP',
      itemsCount: 15,
      createdAt: '2025-06-20T14:30:00',
      requiresApproval: true,
      totalAmount: 14200,
      clientInfo: {
        clientId: 'CLI003',
        clientName: 'Hospital Especializado del Sur',
        contactPerson: 'Lic. Ana Martínez',
        phone: '555-0303',
        email: 'ana.martinez@hospitalsur.com'
      },
      products: [
        { id: '8', name: 'Máquina de Anestesia', category: 'Anestesia', quantity: 1, price: 8000 },
        { id: '9', name: 'Monitor de Presión Arterial', category: 'Monitoreo', quantity: 2, price: 1500 },
        { id: '10', name: 'Aspirador Quirúrgico', category: 'Aspiración', quantity: 1, price: 1200 },
        { id: '11', name: 'Cauterio', category: 'Quirúrgico', quantity: 1, price: 3500 }
      ],
      statusHistory: [
        { status: 'submitted', timestamp: '2025-06-20T14:30:00', changedBy: 'Sistema', notes: 'Orden creada automáticamente' },
        { status: 'review', timestamp: '2025-06-20T15:00:00', changedBy: 'Admin 1', notes: 'Enviada a revisión' },
        { status: 'approved', timestamp: '2025-06-20T16:30:00', changedBy: 'Admin 2', notes: 'Aprobada por ambos administradores' }
      ],
      approvals: [
        { adminName: 'Admin 1', timestamp: '2025-06-20T15:30:00', approved: true, notes: 'Primera aprobación' },
        { adminName: 'Admin 2', timestamp: '2025-06-20T16:30:00', approved: true, notes: 'Segunda aprobación' }
      ]
    },
    {
      orderId: 'ORDPAQJODO220628',
      status: 'preparing',
      patientName: 'Carlos Ruiz',
      patientId: '55667788',
      surgeryDate: '2025-06-25',
      surgeryTime: '8:00 AM',
      typeOfCoverage: 'Privado',
      itemsCount: 10,
      createdAt: '2025-06-19T11:45:00',
      requiresApproval: true,
      totalAmount: 16600,
      clientInfo: {
        clientId: 'CLI004',
        clientName: 'Centro Médico Integral',
        contactPerson: 'Dr. Luis Hernández',
        phone: '555-0404',
        email: 'luis.hernandez@centromedico.com'
      },
      products: [
        { id: '12', name: 'Mesa Quirúrgica', category: 'Mobiliario', quantity: 1, price: 12000 },
        { id: '13', name: 'Monitor de Signos Vitales', category: 'Monitoreo', quantity: 2, price: 2800 },
        { id: '14', name: 'Bomba de Succión', category: 'Aspiración', quantity: 1, price: 1800 }
      ],
      statusHistory: [
        { status: 'submitted', timestamp: '2025-06-19T11:45:00', changedBy: 'Sistema', notes: 'Orden creada automáticamente' },
        { status: 'review', timestamp: '2025-06-19T12:00:00', changedBy: 'Admin 1', notes: 'Enviada a revisión' },
        { status: 'approved', timestamp: '2025-06-19T13:00:00', changedBy: 'Admin 2', notes: 'Aprobada' },
        { status: 'preparing', timestamp: '2025-06-19T14:00:00', changedBy: 'Almacén', notes: 'Iniciando preparación' }
      ]
    },
    {
      orderId: 'ORDPAQJODO220629',
      status: 'completed',
      patientName: 'Ana Torres',
      patientId: '99887766',
      surgeryDate: '2025-06-18',
      surgeryTime: '3:00 PM',
      typeOfCoverage: 'Seguro',
      insuranceName: 'Seguros Monterrey',
      itemsCount: 12,
      createdAt: '2025-06-18T15:00:00',
      clientInfo: {
        clientId: 'CLI005',
        clientName: 'Hospital Regional del Este',
        contactPerson: 'Lic. Carmen Rodríguez',
        phone: '555-0505',
        email: 'carmen.rodriguez@hospitaleste.com'
      },
      products: [
        { id: '15', name: 'Endoscopio', category: 'Endoscopía', quantity: 1, price: 15000 },
        { id: '16', name: 'Monitor de Video', category: 'Visualización', quantity: 1, price: 3500 },
        { id: '17', name: 'Fuente de Luz', category: 'Iluminación', quantity: 1, price: 2800 }
      ],
      statusHistory: [
        { status: 'submitted', timestamp: '2025-06-18T15:00:00', changedBy: 'Sistema', notes: 'Orden creada automáticamente' },
        { status: 'review', timestamp: '2025-06-18T15:30:00', changedBy: 'Admin 1', notes: 'Enviada a revisión' },
        { status: 'approved', timestamp: '2025-06-18T16:00:00', changedBy: 'Admin 2', notes: 'Aprobada' },
        { status: 'preparing', timestamp: '2025-06-18T16:30:00', changedBy: 'Almacén', notes: 'Preparación completada' },
        { status: 'completed', timestamp: '2025-06-18T18:00:00', changedBy: 'Técnico', notes: 'Entrega completada' }
      ]
    },
    {
      orderId: 'ORDPAQJODO220630',
      status: 'cancelled',
      patientName: 'Luis Gómez',
      patientId: '44332211',
      surgeryDate: '2025-06-17',
      surgeryTime: '9:00 AM',
      typeOfCoverage: 'Privado',
      itemsCount: 7,
      createdAt: '2025-06-17T09:00:00',
      clientInfo: {
        clientId: 'CLI006',
        clientName: 'Clínica Privada del Oeste',
        contactPerson: 'Dr. Patricia Morales',
        phone: '555-0606',
        email: 'patricia.morales@clinicaoeste.com'
      },
      products: [
        { id: '18', name: 'Ultrasonido', category: 'Diagnóstico', quantity: 1, price: 25000 },
        { id: '19', name: 'Monitor de Presión', category: 'Monitoreo', quantity: 1, price: 1800 }
      ],
      statusHistory: [
        { status: 'submitted', timestamp: '2025-06-17T09:00:00', changedBy: 'Sistema', notes: 'Orden creada automáticamente' },
        { status: 'cancelled', timestamp: '2025-06-17T10:00:00', changedBy: 'Cliente', notes: 'Cirugía cancelada por el paciente' }
      ]
    }
  ];

  // Filtrar órdenes por estado y búsqueda
  const filteredOrders = mockOrders.filter(order => {
    const matchesState = selectedState === 'all' || order.status === selectedState;
    const matchesSearch = searchQuery === '' || 
      order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

  // Función para abrir el modal de detalles
  const handleViewDetails = (order: ExtendedOrderCardProps) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Función para abrir el modal de aprobación dual
  const handleOpenApproval = (order: ExtendedOrderCardProps) => {
    const approvalRequest = mockApprovalRequests.find(req => req.orderId === order.orderId);
    if (approvalRequest) {
      setSelectedApprovalRequest(approvalRequest);
      setIsApprovalModalOpen(true);
    } else {
      // Crear una solicitud de aprobación mock si no existe
      const newApprovalRequest: ApprovalRequest = {
        orderId: order.orderId,
        patientName: order.patientName,
        totalAmount: order.totalAmount || 0,
        requiresApproval: order.requiresApproval || false,
        currentApprovals: order.approvals?.map(approval => ({
          adminId: approval.adminName === 'Admin 1' ? 'admin1' : 'admin2',
          adminName: approval.adminName,
          approved: approval.approved,
          timestamp: approval.timestamp,
          notes: approval.notes,
          signature: approval.approved ? approval.adminName : undefined
        })) || [],
        requiredAdmins: mockAdmins.slice(0, 2),
        status: order.status === 'approved' ? 'approved' : 'pending',
        createdAt: order.createdAt as string,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };
      setSelectedApprovalRequest(newApprovalRequest);
      setIsApprovalModalOpen(true);
    }
  };

  // Función para cerrar el modal de aprobación
  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
    setSelectedApprovalRequest(null);
  };

  // Función para manejar aprobación
  const handleApprove = async (adminId: string, notes: string, signature: string) => {
    console.log('Aprobando orden:', { adminId, notes, signature });
    // Aquí se conectaría con el backend
    alert('Orden aprobada exitosamente');
    handleCloseApprovalModal();
  };

  // Función para manejar rechazo
  const handleReject = async (adminId: string, reason: string) => {
    console.log('Rechazando orden:', { adminId, reason });
    // Aquí se conectaría con el backend
    alert('Orden rechazada');
    handleCloseApprovalModal();
  };

  // Estados para la calculadora de precios
  const [isPriceCalculatorOpen, setIsPriceCalculatorOpen] = useState<boolean>(false);
  const [selectedOrderForPricing, setSelectedOrderForPricing] = useState<ExtendedOrderCardProps | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [priceNotes, setPriceNotes] = useState<string>('');

  // Tabulador de precios mock
  const priceTabulator = {
    private: {
      'Monitor Multiparamétrico': 2500,
      'Bomba de Infusión': 1200,
      'Desfibrilador': 3500,
      'Ventilador Mecánico': 4500,
      'Electrocardiógrafo': 1800,
      'Oxímetro de Pulso': 300,
      'Lámpara Quirúrgica': 2200,
      'Máquina de Anestesia': 8000,
      'Monitor de Presión Arterial': 1500,
      'Aspirador Quirúrgico': 1200,
      'Cauterio': 3500,
      'Mesa Quirúrgica': 12000,
      'Monitor de Signos Vitales': 2800,
      'Bomba de Succión': 1800,
      'Endoscopio': 15000,
      'Monitor de Video': 3500,
      'Fuente de Luz': 2800,
      'Ultrasonido': 25000,
      'Monitor de Presión': 1800
    },
    insurance: {
      'Monitor Multiparamétrico': 2200,
      'Bomba de Infusión': 1000,
      'Desfibrilador': 3200,
      'Ventilador Mecánico': 4000,
      'Electrocardiógrafo': 1600,
      'Oxímetro de Pulso': 250,
      'Lámpara Quirúrgica': 2000,
      'Máquina de Anestesia': 7200,
      'Monitor de Presión Arterial': 1300,
      'Aspirador Quirúrgico': 1000,
      'Cauterio': 3200,
      'Mesa Quirúrgica': 10800,
      'Monitor de Signos Vitales': 2500,
      'Bomba de Succión': 1600,
      'Endoscopio': 13500,
      'Monitor de Video': 3200,
      'Fuente de Luz': 2500,
      'Ultrasonido': 22500,
      'Monitor de Presión': 1600
    }
  };

  // Función para abrir la calculadora de precios
  const handleOpenPriceCalculator = (order: ExtendedOrderCardProps) => {
    setSelectedOrderForPricing(order);
    setIsPriceCalculatorOpen(true);
    
    // Calcular precio automáticamente
    if (order.products) {
      const coverageType = order.typeOfCoverage === 'Seguro' ? 'insurance' : 'private';
      const total = order.products.reduce((sum, product) => {
        const basePrice = priceTabulator[coverageType][product.name] || product.price;
        return sum + (basePrice * product.quantity);
      }, 0);
      setCalculatedPrice(total);
    }
  };

  // Función para cerrar la calculadora de precios
  const handleClosePriceCalculator = () => {
    setIsPriceCalculatorOpen(false);
    setSelectedOrderForPricing(null);
    setCalculatedPrice(0);
    setPriceNotes('');
  };

  // Función para enviar precio al cliente
  const handleSendPrice = async () => {
    console.log('Enviando precio:', { 
      orderId: selectedOrderForPricing?.orderId, 
      price: calculatedPrice, 
      notes: priceNotes 
    });
    // Aquí se conectaría con el backend
    alert(`Precio de $${calculatedPrice.toLocaleString()} enviado al cliente exitosamente`);
    handleClosePriceCalculator();
  };

  // Funciones para aprobar/rechazar desde el modal de detalles
  const handleApproveFromDetails = async () => {
    if (selectedOrder) {
      console.log('Aprobando orden desde detalles:', selectedOrder.orderId);
      // Aquí se conectaría con el backend
      alert(`Orden ${selectedOrder.orderId} aprobada exitosamente`);
      handleCloseModal();
    }
  };

  const handleRejectFromDetails = async () => {
    if (selectedOrder) {
      const reason = prompt('Ingrese el motivo del rechazo:');
      if (reason) {
        console.log('Rechazando orden desde detalles:', { orderId: selectedOrder.orderId, reason });
        // Aquí se conectaría con el backend
        alert(`Orden ${selectedOrder.orderId} rechazada. Motivo: ${reason}`);
        handleCloseModal();
      }
    }
  };

  // Funciones para nueva orden
  const handleOpenNewOrder = () => {
    setIsNewOrderModalOpen(true);
  };

  const handleCloseNewOrder = () => {
    setIsNewOrderModalOpen(false);
  };

  const handleSubmitNewOrder = async (orderData: any) => {
    console.log('Creando nueva orden:', orderData);
    
    // Generar ID único para la nueva orden
    const newOrderId = `ORDPAQJODO${Date.now()}`;
    
    // Crear nueva orden con el formato esperado
    const newOrder: ExtendedOrderCardProps = {
      orderId: newOrderId,
      status: 'submitted',
      patientName: orderData.patientName,
      patientId: `PAT${Date.now()}`, // Generar ID automático
      surgeryDate: orderData.surgeryDate,
      surgeryTime: orderData.surgeryTime,
      typeOfCoverage: orderData.typeOfCoverage,
      insuranceName: orderData.insuranceName,
      itemsCount: orderData.selectedProducts.length || 0,
      createdAt: new Date().toISOString(),
      requiresApproval: true,
      totalAmount: orderData.selectedProducts.reduce((sum: number, product: any) => sum + (product.price * product.quantity), 0),
      clientInfo: {
        clientId: orderData.clientId || 'CLI_NEW',
        clientName: orderData.clientName,
        contactPerson: orderData.contactPerson,
        phone: orderData.phone,
        email: orderData.email
      },
      products: orderData.selectedProducts,
      statusHistory: [
        { 
          status: 'submitted', 
          timestamp: new Date().toISOString(), 
          changedBy: 'Sistema', 
          notes: 'Orden creada desde formulario' 
        }
      ],
      approvals: [
        { adminName: 'Admin 1', timestamp: '', approved: false, notes: '' },
        { adminName: 'Admin 2', timestamp: '', approved: false, notes: '' }
      ]
    };

    // Agregar la nueva orden al array de órdenes
    mockOrders.unshift(newOrder);
    
    // Aquí se conectaría con el backend para persistir la orden
    alert(`Orden ${newOrderId} creada exitosamente`);
    
    // Cerrar el modal
    handleCloseNewOrder();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Órdenes</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Administra y rastrea todas las órdenes de equipos médicos
              </p>
            </div>
            
            {/* Botón de acción principal */}
            <div className="hidden sm:block">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                onClick={handleOpenNewOrder}
              >
                Nueva Orden
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Área de Filtros y Navegación */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Navegación por Estados */}
            <div className="flex-1 min-w-0">
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full lg:w-80 h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {orderStates.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label} ({state.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Búsqueda */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Buscar por paciente, orderId..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pull to refresh visual (solo móvil) */}
      {isMobile && (
        <div className="flex items-center justify-center py-2 text-xs text-gray-400 select-none">
          <svg className="h-4 w-4 animate-bounce mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Desliza hacia abajo para refrescar
        </div>
      )}

      {/* Área de Contenido Principal */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Indicador de estado actual */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Mostrando:</span>
              <span className="font-medium text-gray-900">
                {currentState?.label || 'Todas las órdenes'}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">
                {filteredOrders.length} órdenes
              </span>
            </div>
          </div>

          {/* Mobile: Carrusel tipo snap */}
          {isMobile ? (
            <>
              <Carousel className="w-full" setApi={setCarouselApi}>
                <CarouselContent>
                  {filteredOrders.map(order => {
                    let approvalCount = 0;
                    let approvalTotal = 2;
                    if (order.approvals && Array.isArray(order.approvals)) {
                      approvalCount = order.approvals.filter(a => a.approved).length;
                      approvalTotal = order.approvals.length;
                    }
                    const alwaysApprovedStates = ['approved', 'preparing', 'completed', 'cancelled'];
                    if (alwaysApprovedStates.includes(order.status)) {
                      approvalCount = 2;
                      approvalTotal = 2;
                    }
                    return (
                      <CarouselItem key={order.orderId} className="px-1">
                        <OrderCard
                          {...order}
                          approvalCount={approvalCount}
                          approvalTotal={approvalTotal}
                          onView={() => handleViewDetails(order)}
                          onEdit={() => handleOpenApproval(order)}
                          onPriceCalculator={() => handleOpenPriceCalculator(order)}
                        />
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
              </Carousel>
              {/* Dots - Limitados a máximo 10 para evitar overflow */}
              {filteredOrders.length > 1 && (
                <div className="flex justify-center items-center gap-2 mt-2">
                  {(() => {
                    const maxDots = 10;
                    const totalOrders = filteredOrders.length;
                    const showDots = Math.min(totalOrders, maxDots);
                    
                    return Array.from({ length: showDots }).map((_, idx) => {
                      // Calcular el índice real de la orden basado en el número de dots
                      const realIndex = totalOrders <= maxDots 
                        ? idx 
                        : Math.floor((idx / (maxDots - 1)) * (totalOrders - 1));
                      
                      return (
                        <button
                          key={idx}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            selectedIndex === realIndex ? 'bg-blue-600 scale-125' : 'bg-gray-300'
                          }`}
                          onClick={() => carouselApi?.scrollTo(realIndex)}
                          aria-label={`Ir a la orden ${realIndex + 1}`}
                        />
                      );
                    });
                  })()}
                  {/* Indicador de más órdenes si hay más de 10 */}
                  {filteredOrders.length > 10 && (
                    <span className="text-xs text-gray-500 ml-2">
                      +{filteredOrders.length - 10} más
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            // Desktop/tablet: grid
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map(order => {
                let approvalCount = 0;
                let approvalTotal = 2;
                if (order.approvals && Array.isArray(order.approvals)) {
                  approvalCount = order.approvals.filter(a => a.approved).length;
                  approvalTotal = order.approvals.length;
                }
                const alwaysApprovedStates = ['approved', 'preparing', 'completed', 'cancelled'];
                if (alwaysApprovedStates.includes(order.status)) {
                  approvalCount = 2;
                  approvalTotal = 2;
                }
                return (
                  <div key={order.orderId} className="relative">
                    <OrderCard
                      {...order}
                      approvalCount={approvalCount}
                      approvalTotal={approvalTotal}
                      onView={() => handleViewDetails(order)}
                      onEdit={() => handleOpenApproval(order)}
                      onPriceCalculator={() => handleOpenPriceCalculator(order)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Mensaje cuando no hay órdenes */}
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No se encontraron órdenes que coincidan con los filtros
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation solo en móvil */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 shadow-lg">
          {orderStates.filter(s => s.value !== 'all').map(state => (
            <button
              key={state.value}
              onClick={() => setSelectedState(state.value)}
              className={`flex flex-col items-center justify-center px-2 py-1 text-xs font-medium transition ${selectedState === state.value ? 'text-blue-600' : 'text-gray-500'}`}
            >
              <span>{state.label}</span>
              <span className="text-[10px] font-normal">({state.count})</span>
            </button>
          ))}
        </nav>
      )}

      {/* Botón flotante para nueva orden en móvil */}
      {isMobile && (
        <button
          onClick={handleOpenNewOrder}
          className="fixed bottom-20 right-4 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-200 hover:scale-110"
          aria-label="Crear nueva orden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Modal de Detalles */}
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onApprove={handleApproveFromDetails}
          onReject={handleRejectFromDetails}
          order={selectedOrder}
        />
      )}

      {/* Modal de Aprobación Dual */}
      {selectedApprovalRequest && (
        <DualApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={handleCloseApprovalModal}
          approvalRequest={selectedApprovalRequest}
          currentAdminId="admin1"
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Modal de Calculadora de Precios */}
      {selectedOrderForPricing && (
        <PriceCalculatorModal
          isOpen={isPriceCalculatorOpen}
          onClose={handleClosePriceCalculator}
          order={selectedOrderForPricing}
          onSendPrice={handleSendPrice}
        />
      )}

      {/* Modal de Nueva Orden */}
      {isNewOrderModalOpen && (
        <NewOrderModal
          isOpen={isNewOrderModalOpen}
          onClose={handleCloseNewOrder}
          onSubmit={handleSubmitNewOrder}
        />
      )}
    </div>
  );
};

export default Orders; 