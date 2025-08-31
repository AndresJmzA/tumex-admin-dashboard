import React from 'react';
import { OrderStatus } from '../services/OrderActionService';
import styles from './InformationPanel.module.css';

// Interfaces TypeScript
interface Order {
  id: string;
  status: OrderStatus;
  customerName: string;
  // Otros campos de la orden que puedan ser necesarios
}

interface InformationPanelProps {
  order: Order;
}

// Componentes placeholder para cada sección de información
const GeneralDetails: React.FC = () => (
  <div className={styles.infoSection}>
    <h4>Detalles Generales</h4>
    <div className={styles.placeholderContent}>
      <p>Información básica de la orden</p>
      <p>Cliente, fecha, dirección, etc.</p>
    </div>
  </div>
);

const EquipmentList: React.FC = () => (
  <div className={styles.infoSection}>
    <h4>Lista de Equipos</h4>
    <div className={styles.placeholderContent}>
      <p>Equipos solicitados para la orden</p>
      <p>Especificaciones técnicas, cantidades, etc.</p>
    </div>
  </div>
);

const RejectionDetails: React.FC = () => (
  <div className={styles.infoSection}>
    <h4>Detalles del Rechazo</h4>
    <div className={styles.placeholderContent}>
      <p>Motivo del rechazo de la orden</p>
      <p>Comentarios, razones, etc.</p>
    </div>
  </div>
);

const RescheduleForm: React.FC = () => (
  <div className={styles.infoSection}>
    <h4>Formulario de Reprogramación</h4>
    <div className={styles.placeholderContent}>
      <p>Proponer nueva fecha para la orden</p>
      <p>Selector de fecha, comentarios, etc.</p>
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
export const InformationPanel: React.FC<InformationPanelProps> = ({ order }) => {
  // Función para renderizar los componentes según el estado
  const renderComponentsByStatus = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_ACCEPTANCE':
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
            <ConfirmationChecklist />
          </>
        );

      case 'PENDING_DOCTOR_CONFIRMATION':
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
            <ConfirmationChecklist />
          </>
        );

      case 'PENDING_TECHNICIAN_ASSIGNMENT':
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
            <PreparationChecklist />
          </>
        );

      case 'PENDING_TECHNICIAN_CONFIRMATION':
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
            <TechnicianDetails />
          </>
        );

      case 'PENDING_EQUIPMENT_PREPARATION':
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
            <TechnicianDetails />
            <PreparationChecklist />
          </>
        );

      case 'PENDING_SURGERY':
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
            <TechnicianDetails />
            <PreparationChecklist />
          </>
        );

      case 'IN_PROGRESS':
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'PENDING_EQUIPMENT_RETURN':
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'PENDING_FINAL_APPROVAL':
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'COMPLETED':
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
            <TechnicianDetails />
            <TrackingInfo />
          </>
        );

      case 'REJECTED':
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
            <RejectionDetails />
            <RescheduleForm />
          </>
        );

      case 'CANCELLED':
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
            <CancellationSummary />
          </>
        );

      default:
        return (
          <>
            <GeneralDetails />
            <EquipmentList />
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
