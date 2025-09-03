import { useState, useEffect, useMemo } from 'react';
import OrderCard, { OrderCardProps } from '@/components/OrderCard';
import TechnicianAssignmentModal from '@/components/TechnicianAssignmentModal';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import PriceCalculatorModal from '@/components/PriceCalculatorModal';
import NewOrderModal from '@/components/NewOrderModal';
import OrderEquipmentEditor from '@/components/OrderEquipmentEditor';
import WarehouseTemplateModal from '@/components/WarehouseTemplateModal';
import { OrderRejectionModal } from '@/components/OrderRejectionModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { PermissionGuard } from '@/components/PermissionGuard';
import { orderService, ExtendedOrder, OrderStats } from '@/services/orderService';
import { operationalDashboardService, PendingOrder } from '@/services/operationalDashboardService';
import { CanonicalOrderStatus } from '@/utils/status';
import { orderEquipmentService } from '@/services/orderEquipmentService';
import type { OrderEquipment as ServiceOrderEquipment } from '@/services/orderEquipmentService';
import { useToast } from '@/components/ui/use-toast';
import { UserRole } from '@/contexts/AuthContext';
import { useOrderEvents } from '@/hooks/useOrderEvents';
import { useOrderRejection } from '@/hooks/useOrderRejection';
import { getStatusLabel } from '@/utils/status';
import { supabase } from '@/supabaseClient';

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

const Orders: React.FC = () => {
  const { toast } = useToast();
  const { rejectOrder, canRejectOrder } = useOrderRejection();
  
  const [selectedState, setSelectedState] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [highlightOrderId, setHighlightOrderId] = useState<string | null>(null);
  const [isTechModalOpen, setIsTechModalOpen] = useState<boolean>(false);
  const [orderIdForTechModal, setOrderIdForTechModal] = useState<string | null>(null);

  const isMobile = useIsMobile();
  
  // Carousel state for mobile
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Estados para nueva orden
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  
  // Estados para edición de equipos
  const [isEquipmentEditorOpen, setIsEquipmentEditorOpen] = useState<boolean>(false);
  const [currentOrderForEquipment, setCurrentOrderForEquipment] = useState<PendingOrder | null>(null);
  const [orderEquipment, setOrderEquipment] = useState<ServiceOrderEquipment[]>([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);

  // Estados para creación de plantillas
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [currentOrderForTemplate, setCurrentOrderForTemplate] = useState<any>(null);
  
  // Estados para rechazo de órdenes
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState<boolean>(false);
  const [currentOrderForRejection, setCurrentOrderForRejection] = useState<ExtendedOrderCardProps | null>(null);
  
  // Estados para asignación de técnicos eliminados
  
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    carouselApi.on('select', onSelect);
    onSelect();
    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  // Cargar órdenes y estadísticas
  useEffect(() => {
    loadOrders();
    loadOrderStats();
  }, [selectedState]);

  // Suscripción en tiempo real a cambios de órdenes
  useOrderEvents((change) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === change.id || o.orderId === change.id) {
          const updated: ExtendedOrder = {
            ...o,
            status: (change.status as any) || o.status,
            assigned_technicians: (change as any).assigned_technicians ?? (o as any).assigned_technicians,
            updated_at: change.updated_at || o.updated_at,
          };
          return updated;
        }
        return o;
      })
    );
  });

  // Highlight desde navegación (Dashboard -> Ver Orden)
  useEffect(() => {
    const nav = (window as any).history?.state as any;
    const locationState = (nav && nav.usr) || ({} as any);
    if (locationState?.highlightOrderId) {
      setHighlightOrderId(locationState.highlightOrderId);
      // Limpiar el estado para no repetir efecto
      (window as any).history.replaceState({ ...nav, usr: { ...locationState, highlightOrderId: undefined } }, '');
    }
  }, []);

  // Auto-remover highlight tras 3 segundos
  useEffect(() => {
    if (!highlightOrderId) return;
    const timer = setTimeout(() => setHighlightOrderId(null), 3000);
    return () => clearTimeout(timer);
  }, [highlightOrderId]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const filters = {
        status: selectedState === 'all' ? undefined : selectedState,
        search: searchQuery || undefined
      };
      const ordersResponse = await orderService.getOrders(filters);
      setOrders(ordersResponse.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderStats = async () => {
    try {
      const stats = await orderService.getOrderStats();
      setOrderStats(stats);
    } catch (error) {
      console.error('Error loading order stats:', error);
    }
  };

  // Estados actualizados del flujo simplificado
  const orderStates = [
    { value: 'all', label: 'Todas las órdenes', count: orderStats?.totalOrders || 0 },
    { value: 'pending_approval', label: 'Pendientes de Aprobación', count: orderStats?.pendingApproval || 0 },
    { value: 'approved', label: 'Aprobadas', count: orderStats?.approved || 0 },
    { value: 'rescheduled', label: 'Reagendadas', count: 0 },
    { value: 'in_preparation', label: 'En Preparación', count: 0 },
    { value: 'ready_for_technicians', label: 'Lista para Técnicos', count: 0 },
    { value: 'doctor_confirmation', label: 'Confirmación Médico', count: 0 },
    { value: 'templates_ready', label: 'Plantillas Listas', count: 0 },
    { value: 'equipment_transported', label: 'Equipos Trasladados', count: 0 },
    { value: 'remission_created', label: 'Remisión Creada', count: 0 },
    { value: 'surgery_completed', label: 'Cirugías Completadas', count: orderStats?.completed || 0 },
    { value: 'cancelled', label: 'Canceladas', count: orderStats?.cancelled || 0 }
  ];

  const currentState = orderStates.find(s => s.value === selectedState);

  // Filtrar órdenes por búsqueda usando useMemo para optimizar
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = searchQuery === '' || 
        order.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [orders, searchQuery]);

  // Funciones para manejar rechazo de órdenes
  const handleOpenRejectionModal = (order: ExtendedOrderCardProps) => {
    setCurrentOrderForRejection(order);
    setIsRejectionModalOpen(true);
  };

  const handleCloseRejectionModal = () => {
    setIsRejectionModalOpen(false);
    setCurrentOrderForRejection(null);
  };

  const handleSubmitRejection = async (rejectionData: any) => {
    try {
      if (!currentOrderForRejection) return;

      // Llamar al servicio de rechazo
      await rejectOrder(currentOrderForRejection.orderId, rejectionData);

      toast({
        title: "✅ Orden procesada",
        description: rejectionData.should_reschedule 
          ? "La orden ha sido rechazada y reagendada exitosamente."
          : "La orden ha sido rechazada exitosamente.",
      });

      handleCloseRejectionModal();
      
      // Forzar recarga completa de órdenes y estadísticas
      // Agregar un pequeño delay para asegurar que la BD se actualice
      setTimeout(async () => {
        try {
          await loadOrders();
          await loadOrderStats();
          console.log('✅ Órdenes y estadísticas recargadas después del rechazo');
        } catch (reloadError) {
          console.error('❌ Error recargando órdenes después del rechazo:', reloadError);
        }
      }, 500);
      
    } catch (error) {
      console.error('Error al rechazar la orden:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo procesar la orden. Intente nuevamente.",
        variant: "destructive"
      });
    }
  };

  // Transformar ExtendedOrder a ExtendedOrderCardProps usando useMemo
  const transformOrderToCardProps = useMemo(() => {
    return (order: ExtendedOrder): ExtendedOrderCardProps => {
      // Determinar si la orden se puede rechazar
      const canReject = ['pending', 'confirmed', 'pending_approval'].includes(order.status);
      
      return {
        orderId: order.orderId,
        status: order.status,
        patientName: order.patient_name,
        patientId: order.patientId || `PAT${order.id}`,
        surgeryDate: String(order.surgery_date),
        surgeryTime: order.surgery_time,
        typeOfCoverage: order.typeOfCoverage,
        insuranceName: order.insurance_name,
        itemsCount: order.itemsCount,
        createdAt: order.created_at,
        requiresApproval: order.requiresApproval,
        totalAmount: order.totalAmount,
        clientInfo: order.doctorInfo ? {
          clientId: order.doctorInfo.doctorId,
          clientName: order.doctorInfo.doctorName,
          contactPerson: order.doctorInfo.contactPerson,
          phone: order.doctorInfo.phone,
          email: order.doctorInfo.email
        } : undefined,
        products: order.products,
        statusHistory: order.statusHistory,
        approvals: order.approvals,
        canReject,
        onReject: () => handleOpenRejectionModal({
          orderId: order.orderId,
          status: order.status,
          patientName: order.patient_name,
          patientId: order.patientId || `PAT${order.id}`,
          surgeryDate: String(order.surgery_date),
          surgeryTime: order.surgery_time,
          typeOfCoverage: order.typeOfCoverage,
          insuranceName: order.insurance_name,
          itemsCount: order.itemsCount,
          createdAt: order.created_at,
          requiresApproval: order.requiresApproval,
          totalAmount: order.totalAmount,
          clientInfo: order.doctorInfo ? {
            clientId: order.doctorInfo.doctorId,
            clientName: order.doctorInfo.doctorName,
            contactPerson: order.doctorInfo.contactPerson,
            phone: order.doctorInfo.phone,
            email: order.doctorInfo.email
          } : undefined,
          products: order.products,
          statusHistory: order.statusHistory,
          approvals: order.approvals,
          canReject
        })
      };
    };
  }, [handleOpenRejectionModal]);

  // Función para abrir el modal de detalles
  const handleViewDetails = async (order: ExtendedOrderCardProps) => {
    try {
      // Obtener los detalles completos de la orden desde el servicio operativo
      // Usar el ID interno de la orden (que es el ID de Supabase)
      const orderDetails = await operationalDashboardService.getOrderById(order.orderId);
      if (orderDetails) {
        setSelectedOrder(orderDetails);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error obteniendo detalles de la orden:', error);
    }
  };

  // Abrir modal de asignación (esqueleto)
  const handleOpenAssignTechnicians = (orderId: string) => {
    setOrderIdForTechModal(orderId);
    setIsTechModalOpen(true);
  };

  const handleCloseAssignTechnicians = () => {
    setIsTechModalOpen(false);
    setOrderIdForTechModal(null);
  };

  // Callback cuando se asignan técnicos desde el modal
  const handleAssigned = (orderId: string) => {
    // Actualización optimista del estado
    setOrders(prev => prev.map(o => (o.id === orderId || o.orderId === orderId ? { ...o, status: 'technicians_assigned' } : o)));
    // Highlight por 3s
    setHighlightOrderId(orderId);
    // Toast con acción (simple)
    toast({ title: 'Técnicos asignados', description: `La orden ${orderId} fue actualizada.` });
    // Re-fetch con pequeño delay
    setTimeout(() => {
      loadOrders();
      loadOrderStats();
    }, 400);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Función para convertir PendingOrder a Order para el modal
  const convertPendingOrderToOrder = (pendingOrder: PendingOrder) => {
    // Mapear el status de PendingOrder a CanonicalOrderStatus
    const statusMapping: Record<string, CanonicalOrderStatus> = {
      'created': 'created',
      'pending_objects': 'pending_objects',
      'approved': 'approved',
      'doctor_confirmation': 'doctor_confirmation',
      'objects_confirmed': 'objects_confirmed',
      'templates_ready': 'templates_ready',
      'technicians_assigned': 'technicians_assigned',
      'in_preparation': 'in_preparation',
      'ready_for_technicians': 'ready_for_technicians',
      'assigned': 'assigned',
      'in_transit': 'in_transit',
      'in_progress': 'in_progress',
      'surgery_prepared': 'surgery_prepared',
      'surgery_completed': 'surgery_completed',
      'returned': 'returned',
      'remission_created': 'remission_created',
      'ready_for_billing': 'ready_for_billing',
      'billed': 'billed',
      'completed': 'completed',
      'rejected': 'rejected',
      'cancelled': 'cancelled',
      'rescheduled': 'rescheduled',
      'doctor_approved': 'doctor_approved',
      'doctor_rejected': 'doctor_rejected',
      'equipment_transported': 'equipment_transported'
    };

    return {
      id: pendingOrder.id,
      status: statusMapping[pendingOrder.status] || 'created',
      patientName: pendingOrder.patientName
    };
  };

  // Función para actualizar la orden seleccionada después de una acción
  const handleOrderUpdate = async () => {
    if (!selectedOrder) return;
    
    try {
      // Obtener los datos actualizados de la orden
      const updatedOrderDetails = await operationalDashboardService.getOrderById(selectedOrder.id);
      if (updatedOrderDetails) {
        setSelectedOrder(updatedOrderDetails);
        // También actualizar la lista de órdenes
        await loadOrders();
        await loadOrderStats();
      }
    } catch (error) {
      console.error('Error actualizando la orden:', error);
      // En caso de error, recargar toda la lista
      await loadOrders();
      await loadOrderStats();
    }
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
    if (!selectedOrder) return;
    
    console.log('Aprobando orden:', {
      selectedOrderId: selectedOrder.id,
      selectedOrderStatus: selectedOrder.status
    });
    
    try {
      await operationalDashboardService.approveOrder(selectedOrder.id);
      
      // Actualizar el estado local inmediatamente
      // Usar el ID correcto para encontrar la orden
      console.log('Órdenes actuales:', orders.map(o => ({ orderId: o.orderId, id: o.id, status: o.status })));
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === selectedOrder.id || order.id === selectedOrder.id
            ? { ...order, status: 'approved' }
            : order
        )
      );
      
      toast({
        title: 'Orden aprobada',
        description: 'La orden ha sido aprobada exitosamente',
        variant: 'default',
      });
      setIsModalOpen(false);
      setSelectedOrder(null);
      
      // Recargar órdenes y estadísticas después de un breve delay para asegurar sincronización
      setTimeout(() => {
        loadOrders();
        loadOrderStats();
      }, 1000);
    } catch (error) {
      console.error('Error approving order:', error);
      toast({
        title: 'Error',
        description: 'No se pudo aprobar la orden',
        variant: 'destructive',
      });
    }
  };

  const handleRejectFromDetails = async (reason: string) => {
    if (!selectedOrder) return;
    
    try {
      await operationalDashboardService.rejectOrder(selectedOrder.id, reason);
      
      // Actualizar el estado local inmediatamente
      // Usar el ID correcto para encontrar la orden
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === selectedOrder.id || order.id === selectedOrder.id
            ? { ...order, status: 'rejected' }
            : order
        )
      );
      
      toast({
        title: 'Orden rechazada',
        description: 'La orden ha sido rechazada',
        variant: 'default',
      });
      setIsModalOpen(false);
      setSelectedOrder(null);
      
      // Recargar órdenes y estadísticas después de un breve delay para asegurar sincronización
      setTimeout(() => {
        loadOrders();
        loadOrderStats();
      }, 1000);
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: 'Error',
        description: 'No se pudo rechazar la orden',
        variant: 'destructive',
      });
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
    
    try {
      // Obtener un usuario válido de la base de datos o usar el usuario autenticado actual
      let validUserId = orderData.clientId;
      
      // Si no hay clientId, buscar un usuario válido en la base de datos
      if (!validUserId) {
        try {
          // Intentar obtener el primer usuario disponible como fallback
          const { data: users, error: userError } = await supabase
            .from('Users')
            .select('id')
            .limit(1)
            .single();
          
          if (userError || !users) {
            throw new Error('No se pudo obtener un usuario válido de la base de datos');
          }
          
          validUserId = users.id;
          console.log('🔄 Usando usuario fallback:', validUserId);
        } catch (userError) {
          console.error('❌ Error obteniendo usuario válido:', userError);
          toast({
            title: "❌ Error",
            description: "No se pudo obtener un usuario válido. Por favor, selecciona un médico específico.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Crear la orden en Supabase
      const newOrder = await orderService.createOrder({
        user_id: validUserId,
        procedure_id: 'default-procedure',
        patient_name: orderData.patientName,
        surgery_date: orderData.surgeryDate,
        surgery_time: orderData.surgeryTime,
        surgery_location: orderData.surgeryLocation || 'Ubicación por definir',
        coverage_type: orderData.typeOfCoverage,
        insurance_name: orderData.insuranceName,
        notes: orderData.notes
      });

      // Recargar órdenes
      await loadOrders();
      
      toast({
        title: "✅ Orden Creada",
        description: `Orden ${newOrder.id} creada exitosamente`,
      });
      
      handleCloseNewOrder();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo crear la orden. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    }
  };

  // Función para manejar la edición de equipos
  const handleEditEquipment = async (orderId: string) => {
    try {
      setEquipmentLoading(true);
      
      // Obtener la orden actual
      const order = await operationalDashboardService.getOrderById(orderId);
      if (!order) {
        toast({
          title: "❌ Error",
          description: "No se pudo encontrar la orden.",
          variant: "destructive"
        });
        return;
      }
      
      // Obtener equipos actuales de la orden
      const equipmentResponse = await orderEquipmentService.getOrderEquipment(orderId);
      setOrderEquipment(equipmentResponse.data);
      
      // Configurar el estado para el editor
      setCurrentOrderForEquipment(order);
      setIsEquipmentEditorOpen(true);
      
    } catch (error) {
      console.error('Error opening equipment editor:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo abrir el editor de equipos. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setEquipmentLoading(false);
    }
  };

  // Función para convertir equipos del servicio al formato del componente
  const convertServiceEquipmentToComponent = (serviceEquipment: ServiceOrderEquipment[]) => {
    return serviceEquipment.map(eq => ({
      id: eq.id, // mantener para compatibilidad
      lineId: eq.id,
      productId: eq.product_id,
      name: eq.product_name,
      category: eq.category,
      quantity: eq.quantity,
      price: eq.price,
      notes: eq.notes,
      confirmed: eq.confirmed,
      isFromPackage: eq.is_from_package,
      packageId: eq.package_id
    }));
  };

  // Función para convertir equipos del componente al formato del servicio
  const convertComponentEquipmentToService = (componentEquipment: any[]) => {
    return componentEquipment.map(eq => ({
      order_id: currentOrderForEquipment?.id || '',
      product_id: eq.productId || eq.id, // usar productId real; fallback por compatibilidad
      quantity: eq.quantity,
      price: eq.price,
      notes: eq.notes,
      confirmed: !!eq.confirmed,
      is_from_package: !!eq.isFromPackage,
      package_id: eq.packageId,
    }));
  };

  // Función para guardar cambios en equipos
  const handleSaveEquipment = async (equipment: any[]) => {
    try {
      setEquipmentLoading(true);
      
      if (!currentOrderForEquipment) return;
      
      // Convertir equipos del componente al formato del servicio
      const serviceEquipment = convertComponentEquipmentToService(equipment);
      // Persistir en Supabase reemplazando equipos (con manejo de error visible)
      await orderEquipmentService.replaceOrderEquipment(currentOrderForEquipment.id, serviceEquipment);
      // Recargar equipos desde BD
      const refreshed = await orderEquipmentService.getOrderEquipment(currentOrderForEquipment.id);
      setOrderEquipment(refreshed.data);
      // Actualizar initialEquipment del editor en memoria (para próximas aperturas)
      
      toast({
        title: "✅ Equipos Actualizados",
        description: "Los equipos de la orden han sido guardados correctamente.",
      });
      
      setIsEquipmentEditorOpen(false);
      setCurrentOrderForEquipment(null);
      
    } catch (error: any) {
      console.error('Error saving equipment:', error);
      toast({
        title: "❌ Error",
        description: `No se pudieron guardar los equipos. ${error?.message || ''}`.trim(),
        variant: "destructive"
      });
    } finally {
      setEquipmentLoading(false);
    }
  };

  // Función para guardar equipos y continuar el flujo
  const handleSaveAndContinue = async (equipment: any[]) => {
    try {
      setEquipmentLoading(true);
      
      if (!selectedOrder) return;
      
      // Primero guardar los equipos
      await handleSaveEquipment(equipment);
      
      // Luego actualizar el estado de la orden a "in_preparation"
      const { orderService } = await import('@/services/orderService');
      await orderService.updateOrderStatus(selectedOrder.id, 'in_preparation', 'Equipos confirmados y enviados a almacén');
      
      toast({
        title: "✅ Flujo Continuado",
        description: "Los equipos han sido guardados y la orden ha sido enviada a almacén para preparación.",
      });
      
      // Cerrar el modal de detalles
      handleCloseModal();
      
      // Recargar las órdenes para mostrar el nuevo estado
      await loadOrders();
      
    } catch (error) {
      console.error('Error saving and continuing:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo completar el proceso. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setEquipmentLoading(false);
    }
  };

  // Función para cerrar el editor de equipos
  const handleCloseEquipmentEditor = () => {
    setIsEquipmentEditorOpen(false);
    setCurrentOrderForEquipment(null);
    setOrderEquipment([]);
  };

  // Funciones para creación de plantillas
  const handleCreateTemplate = async (orderId: string) => {
    try {
      // Buscar la orden seleccionada
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        toast({
          title: "❌ Error",
          description: "No se encontró la orden especificada.",
          variant: "destructive"
        });
        return;
      }

      // Convertir la orden al formato esperado por el modal de plantillas
      const orderForTemplate = {
        id: order.id,
        orderNumber: order.orderId,
        customer: order.patient_name,
        patientName: order.patient_name,
        surgery: order.procedureInfo?.procedureName || 'Cirugía',
        date: order.surgery_date,
        time: order.surgery_time,
        location: order.surgery_location,
        equipment: order.products || [],
        priority: 'medium' as const
      };

      setCurrentOrderForTemplate(orderForTemplate);
      setIsTemplateModalOpen(true);
      
    } catch (error) {
      console.error('Error opening template modal:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo abrir el modal de plantillas.",
        variant: "destructive"
      });
    }
  };

  const handleCloseTemplateModal = () => {
    setIsTemplateModalOpen(false);
    setCurrentOrderForTemplate(null);
  };

  const handleGenerateTemplate = async (template: any) => {
    try {
      // Aquí se generaría la plantilla real
      console.log('Generando plantilla:', template);
      
      // Simular generación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "✅ Plantilla Generada",
        description: "La plantilla se ha generado correctamente.",
      });
      
      handleCloseTemplateModal();
    } catch (error) {
      console.error('Error generating template:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo generar la plantilla.",
        variant: "destructive"
      });
    }
  };

  // Función para descargar plantillas
  const handleDownloadTemplate = async (orderId: string, format: 'pdf' | 'excel') => {
    try {
      // Aquí se generaría y descargaría la plantilla
      console.log(`Descargando plantilla ${format} para orden:`, orderId);
      
      // Simular descarga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Crear un enlace de descarga temporal
      const link = document.createElement('a');
      link.href = `data:text/${format === 'pdf' ? 'pdf' : 'vnd.ms-excel'};charset=utf-8,Plantilla_Orden_${orderId}.${format}`;
      link.download = `Plantilla_Orden_${orderId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      throw error;
    }
  };

  // Función para marcar como lista para recoger
  const handleMarkAsReady = async (orderId: string) => {
    try {
      // Actualizar el estado de la orden a "closed" (que es el equivalente a "ready")
      await orderService.updateOrderStatus(orderId, 'closed', 'Orden marcada como lista para recoger');
      
      toast({
        title: "✅ Orden Marcada como Lista",
        description: "La orden ha sido marcada como lista para recoger.",
      });
      
      // Recargar las órdenes para mostrar el nuevo estado
      await loadOrders();
      
    } catch (error) {
      console.error('Error marking order as ready:', error);
      throw error;
    }
  };

  // NUEVA: Función para enviar orden a almacén (cambiar estado a "En preparación")
  const handleSendToWarehouse = async (orderId: string) => {
    try {
      console.log('🔄 Enviando orden a almacén:', orderId);
      
      // Actualizar el estado de la orden a "in_preparation"
      await orderService.updateOrderStatus(orderId, 'in_preparation', 'Orden enviada a almacén para preparación');
      
      toast({
        title: "✅ Orden Enviada a Almacén",
        description: "La orden ha sido enviada a almacén para preparación.",
      });
      
      // Recargar las órdenes para mostrar el nuevo estado
      await loadOrders();
      
    } catch (error) {
      console.error('Error enviando orden a almacén:', error);
      throw error;
    }
  };

  // NUEVA: Función para marcar orden como lista para técnicos (cambiar estado a "Lista para Técnicos")
  const handleMarkAsReadyForTechnicians = async (orderId: string) => {
    try {
      console.log('🔄 Marcando orden como lista para técnicos:', orderId);
      
      // Actualizar el estado de la orden a "ready_for_technicians"
      await orderService.updateOrderStatus(orderId, 'ready_for_technicians', 'Orden lista para asignar técnicos');
      
      toast({
        title: "✅ Orden Lista para Técnicos",
        description: "La orden ha sido marcada como lista para asignar técnicos.",
      });
      
      // Recargar las órdenes para mostrar el nuevo estado
      await loadOrders();
      
    } catch (error) {
      console.error('Error marcando orden como lista para técnicos:', error);
      throw error;
    }
  };

  // Flujo de asignación de técnicos eliminado

  return (
    <PermissionGuard requiredRole={[UserRole.ADMINISTRADOR_GENERAL, UserRole.GERENTE_COMERCIAL, UserRole.GERENTE_OPERATIVO, UserRole.GERENTE_ADMINISTRATIVO, UserRole.JEFE_ALMACEN, UserRole.TECNICO]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h1>
                <p className="text-gray-600">Administra y rastrea todas las órdenes de equipos médicos</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleOpenNewOrder}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Orden
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filtros y Búsqueda */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Filtros de Estado */}
              {!isMobile && (
                <div className="flex flex-wrap gap-2">
                  {orderStates.map(state => (
                    <button
                      key={state.value}
                      onClick={() => setSelectedState(state.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedState === state.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {state.label} ({state.count})
                    </button>
                  ))}
                </div>
              )}

              {/* Búsqueda */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por paciente, orden..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Órdenes */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando órdenes...</span>
              </div>
            ) : (
              <div>
                {filteredOrders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map((order) => {
                      const orderCardProps = transformOrderToCardProps(order);
                      const isHighlight = highlightOrderId === order.id;
                      return (
                        <div key={`wrap-${order.id}`} className={isHighlight ? 'ring-2 ring-purple-400 rounded-lg animate-pulse' : ''}>
                          <OrderCard
                            key={order.id}
                            {...orderCardProps}
                            onView={() => handleViewDetails(orderCardProps)}
                            onEdit={() => handleViewDetails(orderCardProps)}
                            onPriceCalculator={() => handleOpenPriceCalculator(orderCardProps)}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron órdenes</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No se encontraron órdenes que coincidan con los filtros
                    </p>
                  </div>
                )}
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
            order={convertPendingOrderToOrder(selectedOrder)}
            currentUserRole={UserRole.GERENTE_OPERATIVO}
            onUpdate={handleOrderUpdate}
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
            onOrderCreated={loadOrders}
          />
        )}

        {/* Modal de Editor de Equipos */}
        {currentOrderForEquipment && (
          <OrderEquipmentEditor
            isOpen={isEquipmentEditorOpen}
            onClose={handleCloseEquipmentEditor}
            onSave={handleSaveEquipment}
            onSaveAndContinue={handleSaveAndContinue}
            orderId={currentOrderForEquipment.id}
            orderNumber={currentOrderForEquipment.id}
            doctorName={currentOrderForEquipment.doctorName}
            surgeryDate={currentOrderForEquipment.surgeryDate}
            surgeryTime={currentOrderForEquipment.surgeryTime}
            initialEquipment={convertServiceEquipmentToComponent(orderEquipment)}
          />
        )}

        {/* Modal esqueleto: Asignación de Técnicos */}
        {isTechModalOpen && (
          <TechnicianAssignmentModal
            isOpen={isTechModalOpen}
            onClose={handleCloseAssignTechnicians}
            orderId={orderIdForTechModal}
            onAssigned={handleAssigned}
          />
        )}

        {/* Modal de Plantillas */}
        {currentOrderForTemplate && (
          <WarehouseTemplateModal
            isOpen={isTemplateModalOpen}
            onClose={handleCloseTemplateModal}
            order={currentOrderForTemplate}
            onGenerate={handleGenerateTemplate}
          />
        )}

        {/* Modal de Rechazo de Orden */}
        {currentOrderForRejection && (
          <OrderRejectionModal
            isOpen={isRejectionModalOpen}
            onClose={handleCloseRejectionModal}
            orderId={currentOrderForRejection.orderId}
            orderPatientName={currentOrderForRejection.patientName}
            orderDate={String(currentOrderForRejection.surgeryDate)}
            onSubmit={handleSubmitRejection}
          />
        )}

        {/* Flujo de asignación de técnicos retirado */}
      </div>
    </PermissionGuard>
  );
};

export default Orders; 