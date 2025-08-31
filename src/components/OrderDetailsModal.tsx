import React, { useState } from 'react';
import './OrderDetailsModal.css';
import { ActionBar } from './ActionBar';
import { OrderStatus, UserRole, Action } from '../services/OrderActionService';

// Interfaces TypeScript
interface Order {
  id: string;
  status: OrderStatus;
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
  const getStatusBadgeColor = (status: OrderStatus): string => {
    const statusColors: Record<OrderStatus, string> = {
      'PENDING_ACCEPTANCE': '#f59e0b',      // Amarillo
      'PENDING_DOCTOR_CONFIRMATION': '#8b5cf6', // Púrpura
      'PENDING_TECHNICIAN_ASSIGNMENT': '#6366f1', // Índigo
      'PENDING_TECHNICIAN_CONFIRMATION': '#06b6d4', // Cyan
      'PENDING_EQUIPMENT_PREPARATION': '#f97316',   // Naranja
      'PENDING_SURGERY': '#84cc16',       // Verde lima
      'IN_PROGRESS': '#10b981',          // Verde
      'PENDING_EQUIPMENT_RETURN': '#047857',  // Verde esmeralda
      'PENDING_FINAL_APPROVAL': '#059669',    // Verde oscuro
      'COMPLETED': '#1f2937',       // Gris oscuro
      'REJECTED': '#ef4444',          // Rojo
      'CANCELLED': '#dc2626'     // Rojo oscuro
    };
    
    return statusColors[status] || '#6b7280'; // Gris por defecto
  };

  // Función para obtener el nombre legible del estado
  const getStatusDisplayName = (status: OrderStatus): string => {
    const statusNames: Record<OrderStatus, string> = {
      'PENDING_ACCEPTANCE': 'Pendiente de Aceptación',
      'PENDING_DOCTOR_CONFIRMATION': 'Pendiente de Confirmación del Doctor',
      'PENDING_TECHNICIAN_ASSIGNMENT': 'Pendiente de Asignación de Técnico',
      'PENDING_TECHNICIAN_CONFIRMATION': 'Pendiente de Confirmación del Técnico',
      'PENDING_EQUIPMENT_PREPARATION': 'Pendiente de Preparación de Equipos',
      'PENDING_SURGERY': 'Pendiente de Cirugía',
      'IN_PROGRESS': 'En Progreso',
      'PENDING_EQUIPMENT_RETURN': 'Pendiente de Devolución de Equipos',
      'PENDING_FINAL_APPROVAL': 'Pendiente de Aprobación Final',
      'COMPLETED': 'Completada',
      'REJECTED': 'Rechazada',
      'CANCELLED': 'Cancelada'
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
    CONFIRM_SURGERY: handleConfirmSurgery,
    ASSIGN_TECHNICIAN: handleAssignTechnician,
    CONFIRM_TECHNICIAN_AVAILABILITY: handleConfirmTechnicianAvailability,
    PREPARE_EQUIPMENT: handlePrepareEquipment,
    START_SURGERY: handleStartSurgery,
    COMPLETE_SURGERY: handleCompleteSurgery,
    RETURN_EQUIPMENT: handleReturnEquipment,
    APPROVE_COMPLETION: handleApproveCompletion,
    CANCEL_ORDER: handleCancelOrder
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