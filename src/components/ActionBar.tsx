import React from 'react';
import { getAvailableActions, OrderStatus, UserRole, Action } from '../services/OrderActionService';
import styles from './ActionBar.module.css';

// Interfaz para las props del componente
interface ActionBarProps {
  status: OrderStatus;
  role: UserRole;
  actions: Record<Action, () => Promise<void>>;
  isLoading?: boolean;
}

// Mapeo de acciones a etiquetas legibles en español
const actionLabels: Record<Action, string> = {
  ACCEPT_ORDER: 'Aceptar Orden',
  REJECT_ORDER: 'Rechazar Orden',
  CONFIRM_SURGERY: 'Confirmar Cirugía',
  ASSIGN_TECHNICIAN: 'Asignar Técnico',
  CONFIRM_TECHNICIAN_AVAILABILITY: 'Confirmar Disponibilidad',
  PREPARE_EQUIPMENT: 'Preparar Equipos',
  START_SURGERY: 'Iniciar Cirugía',
  COMPLETE_SURGERY: 'Completar Cirugía',
  RETURN_EQUIPMENT: 'Devolver Equipos',
  APPROVE_COMPLETION: 'Aprobar Finalización',
  CANCEL_ORDER: 'Cancelar Orden'
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
