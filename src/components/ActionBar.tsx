import React from 'react';
import { getAvailableActions, Action } from '../services/OrderActionService';
import { CanonicalOrderStatus } from '@/utils/status';
import { UserRole } from '@/contexts/AuthContext';
import styles from './ActionBar.module.css';

// Interfaz para las props del componente
interface ActionBarProps {
  status: CanonicalOrderStatus;
  role: UserRole;
  actions: Record<Action, () => Promise<void>>;
  isLoading?: boolean;
}

// Mapeo de acciones a etiquetas legibles en español
const actionLabels: Record<Action, string> = {
  ACCEPT_ORDER: 'Aceptar Orden',
  REJECT_ORDER: 'Rechazar Orden',
  RESCHEDULE_ORDER: 'Reprogramar Orden',
  CONTACT_DOCTOR: 'Contactar Doctor',
  CONFIRM_EQUIPMENT: 'Confirmar Equipos',
  CONFIRM_ORDER: 'Confirmar Orden',
  REJECT_RESCHEDULE: 'Rechazar Reprogramación',
  PREPARE_ORDER: 'Preparar Orden',
  ASSIGN_TECHNICIANS: 'Asignar Técnicos',
  LOAD_ORDER: 'Cargar Orden',
  SEND_ORDER: 'Enviar Orden',
  ARRIVE_LOCATION: 'Llegar al Lugar',
  INSTALL_ORDER: 'Instalar Orden',
  COMPLETE_ORDER: 'Completar Orden',
  RETURN_BASE: 'Regresar a Base',
  CLOSE_ORDER: 'Cerrar Orden',
  REOPEN_ORDER: 'Reabrir Orden',
  VIEW_ORDER_HISTORY: 'Ver Historial',
  EDIT_ORDER: 'Editar Orden',
  DELETE_ORDER: 'Eliminar Orden'
};

/**
 * Componente que renderiza dinámicamente botones de acción
 * basándose en el estado de la orden y el rol del usuario
 */
export const ActionBar: React.FC<ActionBarProps> = ({ status, role, actions, isLoading = false }) => {
  // Obtener las acciones disponibles para el estado y rol actual
  const availableActions = getAvailableActions(status, role);

  // Si no hay acciones disponibles, no renderizar nada
  if (availableActions.length === 0) {
    return (
      <div className={styles.actionBar}>
        <div className={styles.noActions}>
          No hay acciones disponibles para este estado
        </div>
      </div>
    );
  }

  return (
    <div className={styles.actionBar}>
      <div className={styles.actionsContainer}>
        {availableActions.map((action) => (
          <button
            key={action}
            className={styles.actionButton}
            onClick={actions[action]}
            type="button"
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : actionLabels[action]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionBar;
