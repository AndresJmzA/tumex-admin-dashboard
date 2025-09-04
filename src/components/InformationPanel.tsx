import React from 'react';
import { CanonicalOrderStatus } from '@/utils/status';
import styles from './InformationPanel.module.css';

// Interfaces TypeScript
interface Order {
  id: string;
  status: CanonicalOrderStatus;
  customerName?: string;
  patientName?: string;
  surgeryDate?: string;
  surgeryTime?: string;
  surgeryLocation?: string;
  procedureName?: string;
  notes?: string;
  createdAt?: string;
  order_products?: any[]; // Lista de equipos/productos de la orden
  equipments?: any[]; // Lista de equipos de la orden (fuente de verdad)
  // Otros campos de la orden que puedan ser necesarios
}

interface InformationPanelProps {
  order: Order;
  onViewDetailsClick?: () => void;
}

// Componentes placeholder para cada sección de información
const GeneralDetails: React.FC<{ order: Order }> = ({ order }) => (
  <div className={styles.infoSection}>
    <h4>Detalles Generales</h4>
    <div className={styles.orderDetails}>
      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>ID de Orden:</span>
        <span className={styles.detailValue}>{order.id}</span>
      </div>
      
      {order.customerName && (
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Cliente:</span>
          <span className={styles.detailValue}>{order.customerName}</span>
        </div>
      )}
      
      {order.patientName && (
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Paciente:</span>
          <span className={styles.detailValue}>{order.patientName}</span>
        </div>
      )}
      
      {order.procedureName && (
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Procedimiento:</span>
          <span className={styles.detailValue}>{order.procedureName}</span>
        </div>
      )}
      
      {order.surgeryDate && (
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Fecha de Cirugía:</span>
          <span className={styles.detailValue}>{order.surgeryDate}</span>
        </div>
      )}
      
      {order.surgeryTime && (
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Hora de Cirugía:</span>
          <span className={styles.detailValue}>{order.surgeryTime}</span>
        </div>
      )}
      
      {order.surgeryLocation && (
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Ubicación:</span>
          <span className={styles.detailValue}>{order.surgeryLocation}</span>
        </div>
      )}
      
      {order.notes && (
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Notas:</span>
          <span className={styles.detailValue}>{order.notes}</span>
        </div>
      )}
      
      {order.createdAt && (
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Fecha de Creación:</span>
          <span className={styles.detailValue}>
            {new Date(order.createdAt).toLocaleString('es-ES')}
          </span>
        </div>
      )}
    </div>
  </div>
);

const EquipmentList: React.FC<{ order: Order; onViewDetailsClick?: () => void }> = ({ order, onViewDetailsClick }) => {
  // Calcular el número de artículos
  const itemCount = order.order_products?.length || 0;
  
  // Crear texto dinámico para el contador
  const counterText = itemCount > 0 ? `${itemCount} artículos` : 'No hay artículos en esta orden.';

  return (
    <div className={styles.infoSection}>
      <h4>Lista de Equipos</h4>
      <div className={styles.placeholderContent}>
        <p>Equipos solicitados para la orden</p>
        <p>{counterText}</p>
        {onViewDetailsClick && (
          <button 
            onClick={onViewDetailsClick}
            disabled={itemCount === 0}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: itemCount === 0 ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: itemCount === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Ver Artículos
          </button>
        )}
      </div>
    </div>
  );
};

const RejectionDetails: React.FC = () => (
  <div className={styles.infoSection}>
    <h4>Detalles del Rechazo</h4>
    <div className={styles.placeholderContent}>
      <p>Motivo del rechazo de la orden</p>
      <p>Comentarios, razones, etc.</p>
    </div>
  </div>
);

const RescheduleForm: React.FC<{ order: Order }> = ({ order }) => (
  <div className={styles.infoSection}>
    <h4>Reprogramar Orden</h4>
    <div className={styles.placeholderContent}>
      <p>Proponer nueva fecha para la orden</p>
      <p>Selector de fecha, comentarios, etc.</p>
      <button 
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Confirmar Reprogramación
      </button>
    </div>
  </div>
);

const ConfirmationChecklist: React.FC = () => (
  <div className={styles.infoSection}>
    <h4>Checklist de Confirmación</h4>
    <div className={styles.placeholderContent}>
      <p>Lista de verificación para confirmar con el doctor</p>
      <p>Items a revisar, confirmaciones, etc.</p>
    </div>
  </div>
);

const PreparationChecklist: React.FC = () => (
  <div className={styles.infoSection}>
    <h4>Checklist de Preparación</h4>
    <div className={styles.placeholderContent}>
      <p>Lista de verificación para preparación interna</p>
      <p>Plantillas, equipos, logística, etc.</p>
    </div>
  </div>
);

const TechnicianAssignment: React.FC = () => (
  <div className={styles.infoSection}>
    <h4>Asignación de Técnicos</h4>
    <div className={styles.placeholderContent}>
      <p>Interfaz para asignar técnicos a la orden</p>
      <p>Selector de técnicos, horarios, etc.</p>
    </div>
  </div>
);

const TechnicianDetails: React.FC = () => (
  <div className={styles.infoSection}>
    <h4>Detalles de Técnicos</h4>
    <div className={styles.placeholderContent}>
      <p>Información de los técnicos asignados</p>
      <p>Nombres, especialidades, contacto, etc.</p>
    </div>
  </div>
);

const TrackingInfo: React.FC = () => (
  <div className={styles.infoSection}>
    <h4>Información de Seguimiento</h4>
    <div className={styles.placeholderContent}>
      <p>Estado del envío y ubicación</p>
      <p>En ruta, en sitio, tiempo estimado, etc.</p>
    </div>
  </div>
);

const CancellationSummary: React.FC = () => (
  <div className={styles.infoSection}>
    <h4>Resumen de Cancelación</h4>
    <div className={styles.placeholderContent}>
      <p>Información sobre la cancelación de la orden</p>
      <p>Motivo, fecha, responsable, etc.</p>
    </div>
  </div>
);

/**
 * Componente principal que renderiza condicionalmente las secciones de información
 * según el estado actual de la orden
 */
export const InformationPanel: React.FC<InformationPanelProps> = ({ order, onViewDetailsClick }) => {
  // Función para renderizar los componentes según el estado
  const renderComponentsByStatus = (status: CanonicalOrderStatus) => {
    switch (status) {
      case 'created':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
          </>
        );

      case 'pending_objects':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <ConfirmationChecklist />
          </>
        );

      case 'doctor_confirmation':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <ConfirmationChecklist />
          </>
        );

      case 'objects_confirmed':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <ConfirmationChecklist />
          </>
        );

      case 'approved':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <ConfirmationChecklist />
          </>
        );

      case 'templates_ready':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <PreparationChecklist />
          </>
        );

      case 'in_preparation':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <PreparationChecklist />
          </>
        );

      case 'technicians_assigned':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
          </>
        );

      case 'ready_for_technicians':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
          </>
        );

      case 'assigned':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
          </>
        );

      case 'in_transit':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'in_progress':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'equipment_transported':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'surgery_prepared':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'surgery_completed':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'returned':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'remission_created':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'ready_for_billing':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'billed':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'completed':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'rejected':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <RejectionDetails />
            <RescheduleForm order={order} />
          </>
        );

      case 'rescheduled':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <RescheduleForm order={order} />
          </>
        );

      case 'doctor_approved':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <ConfirmationChecklist />
          </>
        );

      case 'doctor_rejected':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <RejectionDetails />
            <RescheduleForm order={order} />
          </>
        );

      case 'cancelled':
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
            <CancellationSummary />
          </>
        );

      default:
        return (
          <>
            <GeneralDetails order={order} />
            <EquipmentList order={order} onViewDetailsClick={onViewDetailsClick} />
          </>
        );
    }
  };

  return (
    <div className={styles.informationPanel}>
      <div className={styles.panelContent}>
        <h3>Información de la Orden</h3>
        <div className={styles.componentsContainer}>
          {renderComponentsByStatus(order.status)}
        </div>
      </div>
    </div>
  );
};

export default InformationPanel;
