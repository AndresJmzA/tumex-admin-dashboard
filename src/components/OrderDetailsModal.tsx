import React, { useState } from 'react';
import './OrderDetailsModal.css';
import { ActionBar } from './ActionBar';
import { Action } from '../services/OrderActionService';
import { CanonicalOrderStatus } from '@/utils/status';
import { UserRole } from '@/contexts/AuthContext';

// Interfaces TypeScript
interface Order {
  id: string;
  status: CanonicalOrderStatus;
  customerName?: string;
  patientName?: string;
}

interface OrderDetailsModalProps {
  order: Order;
  currentUserRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

// Cliente API simulado
const apiClient = {
  patch: (url: string, data: any) => {
    console.log(`PATCH a ${url} con datos:`, data);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
  },
  post: (url: string, data: any) => {
    console.log(`POST a ${url} con datos:`, data);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
  },
  put: (url: string, data: any) => {
    console.log(`PUT a ${url} con datos:`, data);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
  }
};

// Componente principal del modal
const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  currentUserRole,
  isOpen,
  onClose,
  onUpdate
}) => {
  // Estado para controlar el estado de carga
  const [isLoading, setIsLoading] = useState(false);

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (status: CanonicalOrderStatus): string => {
    const statusColors: Record<CanonicalOrderStatus, string> = {
      'created': '#f59e0b',                    // Amarillo - Orden Creada
      'pending_objects': '#8b5cf6',            // Púrpura - Pendiente de Objetos
      'doctor_confirmation': '#6366f1',        // Índigo - Confirmación con Médico
      'objects_confirmed': '#06b6d4',          // Cyan - Objetos Confirmados
      'approved': '#84cc16',                   // Verde lima - Aprobada
      'rescheduled': '#f97316',                // Naranja - Reagendada
      'rejected': '#ef4444',                   // Rojo - Rechazada
      'doctor_approved': '#10b981',            // Verde - Aceptada por Médico
      'doctor_rejected': '#dc2626',            // Rojo oscuro - Rechazada por Médico
      'templates_ready': '#047857',            // Verde esmeralda - Plantillas Listas
      'technicians_assigned': '#059669',       // Verde oscuro - Técnicos Asignados
      'in_preparation': '#1f2937',             // Gris oscuro - En Preparación
      'ready_for_technicians': '#6b7280',      // Gris - Lista para Técnicos
      'assigned': '#3b82f6',                   // Azul - Asignada
      'in_transit': '#8b5cf6',                 // Púrpura - En Tránsito
      'in_progress': '#10b981',                // Verde - En Proceso
      'returned': '#f59e0b',                   // Amarillo - De Vuelta
      'remission_created': '#06b6d4',          // Cyan - Remisión Creada
      'equipment_transported': '#f97316',      // Naranja - Equipos Trasladados
      'surgery_prepared': '#84cc16',           // Verde lima - Quirófano Preparado
      'surgery_completed': '#10b981',          // Verde - Cirugía Completada
      'ready_for_billing': '#f59e0b',         // Amarillo - Lista para Facturar
      'billed': '#1f2937',                     // Gris oscuro - Facturada
      'completed': '#059669',                  // Verde oscuro - Completada
      'cancelled': '#dc2626'                   // Rojo oscuro - Cancelada
    };
    
    return statusColors[status] || '#6b7280'; // Gris por defecto
  };

  // Función para obtener el nombre legible del estado
  const getStatusDisplayName = (status: CanonicalOrderStatus): string => {
    const statusNames: Record<CanonicalOrderStatus, string> = {
      'created': 'Orden Creada',
      'pending_objects': 'Pendiente de Objetos',
      'doctor_confirmation': 'Confirmación con Médico',
      'objects_confirmed': 'Objetos Confirmados',
      'approved': 'Aprobada',
      'rescheduled': 'Reagendada',
      'rejected': 'Rechazada',
      'doctor_approved': 'Aceptada por Médico',
      'doctor_rejected': 'Rechazada por Médico',
      'templates_ready': 'Plantillas Listas',
      'technicians_assigned': 'Técnicos Asignados',
      'in_preparation': 'En Preparación',
      'ready_for_technicians': 'Lista para Técnicos',
      'assigned': 'Asignada',
      'in_transit': 'En Tránsito',
      'in_progress': 'En Proceso',
      'returned': 'De Vuelta',
      'remission_created': 'Remisión Creada',
      'equipment_transported': 'Equipos Trasladados',
      'surgery_prepared': 'Quirófano Preparado',
      'surgery_completed': 'Cirugía Completada',
      'ready_for_billing': 'Lista para Facturar',
      'billed': 'Facturada',
      'completed': 'Completada',
      'cancelled': 'Cancelada'
    };
    
    return statusNames[status] || status;
  };

  // Definir todos los manejadores de acciones con llamadas a API simuladas
  const handleAcceptOrder = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/api/orders/${order.id}/accept`, {});
      console.log('Orden aceptada exitosamente');
      // Llamar a onUpdate para refrescar los datos de la orden
      onUpdate();
    } catch (error) {
      console.error('Error al aceptar la orden:', error);
      alert('Error al aceptar la orden. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectOrder = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/api/orders/${order.id}/reject`, {});
      console.log('Orden rechazada exitosamente');
      // Llamar a onUpdate para refrescar los datos de la orden
      onUpdate();
    } catch (error) {
      console.error('Error al rechazar la orden:', error);
      alert('Error al rechazar la orden. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSurgery = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/api/orders/${order.id}/confirm-surgery`, {});
      console.log('Cirugía confirmada exitosamente');
      // Llamar a onUpdate para refrescar los datos de la orden
      onUpdate();
    } catch (error) {
      console.error('Error al confirmar la cirugía:', error);
      alert('Error al confirmar la cirugía. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTechnician = async () => {
    setIsLoading(true);
    try {
      await apiClient.post(`/api/orders/${order.id}/assign-technician`, {});
      console.log('Técnico asignado exitosamente');
      // Llamar a onUpdate para refrescar los datos de la orden
      onUpdate();
    } catch (error) {
      console.error('Error al asignar técnico:', error);
      alert('Error al asignar técnico. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTechnicianAvailability = async () => {
      setIsLoading(true);
    try {
      await apiClient.patch(`/api/orders/${order.id}/confirm-technician-availability`, {});
      console.log('Disponibilidad del técnico confirmada exitosamente');
      // Llamar a onUpdate para refrescar los datos de la orden
      onUpdate();
    } catch (error) {
      console.error('Error al confirmar disponibilidad del técnico:', error);
      alert('Error al confirmar disponibilidad del técnico. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrepareEquipment = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/api/orders/${order.id}/prepare-equipment`, {});
      console.log('Equipos preparados exitosamente');
      // Llamar a onUpdate para refrescar los datos de la orden
      onUpdate();
    } catch (error) {
      console.error('Error al preparar equipos:', error);
      alert('Error al preparar equipos. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSurgery = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/api/orders/${order.id}/start-surgery`, {});
      console.log('Cirugía iniciada exitosamente');
      // Llamar a onUpdate para refrescar los datos de la orden
      onUpdate();
    } catch (error) {
      console.error('Error al iniciar la cirugía:', error);
      alert('Error al iniciar la cirugía. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSurgery = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/api/orders/${order.id}/complete-surgery`, {});
      console.log('Cirugía completada exitosamente');
      // Llamar a onUpdate para refrescar los datos de la orden
      onUpdate();
    } catch (error) {
      console.error('Error al completar la cirugía:', error);
      alert('Error al completar la cirugía. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnEquipment = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/api/orders/${order.id}/return-equipment`, {});
      console.log('Equipos devueltos exitosamente');
      // Llamar a onUpdate para refrescar los datos de la orden
      onUpdate();
    } catch (error) {
      console.error('Error al devolver equipos:', error);
      alert('Error al devolver equipos. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCompletion = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/api/orders/${order.id}/approve-completion`, {});
      console.log('Finalización aprobada exitosamente');
      // Llamar a onUpdate para refrescar los datos de la orden
      onUpdate();
    } catch (error) {
      console.error('Error al aprobar la finalización:', error);
      alert('Error al aprobar la finalización. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/api/orders/${order.id}/cancel`, {});
      console.log('Orden cancelada exitosamente');
      // Llamar a onUpdate para refrescar los datos de la orden
      onUpdate();
    } catch (error) {
      console.error('Error al cancelar la orden:', error);
      alert('Error al cancelar la orden. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Crear el objeto de acciones para pasar a ActionBar
  const actionHandlers: Record<Action, () => Promise<void>> = {
    ACCEPT_ORDER: handleAcceptOrder,
    REJECT_ORDER: handleRejectOrder,
    RESCHEDULE_ORDER: async () => { console.log('Reprogramar Orden'); },
    CONTACT_DOCTOR: async () => { console.log('Contactar Doctor'); },
    CONFIRM_EQUIPMENT: async () => { console.log('Confirmar Equipos'); },
    CONFIRM_ORDER: handleConfirmSurgery, // Mapear a función existente
    REJECT_RESCHEDULE: async () => { console.log('Rechazar Reprogramación'); },
    PREPARE_ORDER: handlePrepareEquipment, // Mapear a función existente
    ASSIGN_TECHNICIANS: handleAssignTechnician, // Mapear a función existente
    LOAD_ORDER: async () => { console.log('Cargar Orden'); },
    SEND_ORDER: async () => { console.log('Enviar Orden'); },
    ARRIVE_LOCATION: async () => { console.log('Llegar al Lugar'); },
    INSTALL_ORDER: async () => { console.log('Instalar Orden'); },
    COMPLETE_ORDER: handleCompleteSurgery, // Mapear a función existente
    RETURN_BASE: handleReturnEquipment, // Mapear a función existente
    CLOSE_ORDER: handleApproveCompletion, // Mapear a función existente
    REOPEN_ORDER: async () => { console.log('Reabrir Orden'); },
    VIEW_ORDER_HISTORY: async () => { console.log('Ver Historial'); },
    EDIT_ORDER: async () => { console.log('Editar Orden'); },
    DELETE_ORDER: handleCancelOrder // Mapear a función existente
  };

    return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* ModalHeader */}
        <div className="modal-header">
          <div className="header-content">
            <h2 className="order-title">Orden #{order.id}</h2>
            <div 
              className="status-badge"
              style={{ backgroundColor: getStatusBadgeColor(order.status) }}
            >
              {getStatusDisplayName(order.status)}
                    </div>
                      </div>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
                      </div>

        {/* InformationPanel */}
        <div className="information-panel">
          <div className="panel-content">
            <h3>Información de la Orden</h3>
            <p><strong>Cliente:</strong> {order.customerName || order.patientName || 'N/A'}</p>
            <p><strong>Estado:</strong> {getStatusDisplayName(order.status)}</p>
            <p><strong>Rol del Usuario:</strong> {currentUserRole}</p>
            <div className="placeholder-text">
              Detalles de la orden se mostrarán aquí.
                    </div>
                          </div>
                          </div>

        {/* ActionBar */}
        <ActionBar 
          status={order.status}
          role={currentUserRole}
          actions={actionHandlers}
          isLoading={isLoading}
        />
              </div>
              </div>
  );
};

export default OrderDetailsModal; 