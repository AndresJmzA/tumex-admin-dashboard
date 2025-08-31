// Tipos para los estados de orden, roles de usuario y acciones
export type OrderStatus = 
  | 'PENDING_ACCEPTANCE'
  | 'PENDING_DOCTOR_CONFIRMATION'
  | 'PENDING_TECHNICIAN_ASSIGNMENT'
  | 'PENDING_TECHNICIAN_CONFIRMATION'
  | 'PENDING_EQUIPMENT_PREPARATION'
  | 'PENDING_SURGERY'
  | 'IN_PROGRESS'
  | 'PENDING_EQUIPMENT_RETURN'
  | 'PENDING_FINAL_APPROVAL'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type UserRole = 
  | 'GESTOR_OPERACIONES'
  | 'GESTOR_CUENTA'
  | 'DOCTOR'
  | 'TECNICO';

export type Action = 
  | 'ACCEPT_ORDER'
  | 'REJECT_ORDER'
  | 'CONFIRM_SURGERY'
  | 'ASSIGN_TECHNICIAN'
  | 'CONFIRM_TECHNICIAN_AVAILABILITY'
  | 'PREPARE_EQUIPMENT'
  | 'START_SURGERY'
  | 'COMPLETE_SURGERY'
  | 'RETURN_EQUIPMENT'
  | 'APPROVE_COMPLETION'
  | 'CANCEL_ORDER';

// Interfaz para cada entrada de la Matriz de Permisos
interface PermissionMatrixEntry {
  idEstado: OrderStatus;
  estadoOrden: string;
  rolUsuarioAutorizado: UserRole;
  accionesPermitidas: Action[];
  estadoResultante: OrderStatus;
}

/**
 * Obtiene las acciones disponibles para un estado de orden y rol de usuario específicos
 * @param status - El estado actual de la orden
 * @param role - El rol del usuario que intenta realizar la acción
 * @returns Array de acciones permitidas, o array vacío si no hay coincidencias
 */
export function getAvailableActions(status: OrderStatus, role: UserRole): Action[] {
  // Matriz de Permisos codificada basada en el análisis del diagrama de flujo
  const permissionMatrix: PermissionMatrixEntry[] = [
    // Estado: Pendiente de Aceptación
    {
      idEstado: 'PENDING_ACCEPTANCE',
      estadoOrden: 'Pendiente de Aceptación',
      rolUsuarioAutorizado: 'GESTOR_OPERACIONES',
      accionesPermitidas: ['ACCEPT_ORDER', 'REJECT_ORDER'],
      estadoResultante: 'PENDING_DOCTOR_CONFIRMATION'
    },
    
    // Estado: Pendiente de Confirmación del Doctor
    {
      idEstado: 'PENDING_DOCTOR_CONFIRMATION',
      estadoOrden: 'Pendiente de Confirmación del Doctor',
      rolUsuarioAutorizado: 'DOCTOR',
      accionesPermitidas: ['CONFIRM_SURGERY'],
      estadoResultante: 'PENDING_TECHNICIAN_ASSIGNMENT'
    },
    
    // Estado: Pendiente de Asignación de Técnico
    {
      idEstado: 'PENDING_TECHNICIAN_ASSIGNMENT',
      estadoOrden: 'Pendiente de Asignación de Técnico',
      rolUsuarioAutorizado: 'GESTOR_OPERACIONES',
      accionesPermitidas: ['ASSIGN_TECHNICIAN'],
      estadoResultante: 'PENDING_TECHNICIAN_CONFIRMATION'
    },
    
    // Estado: Pendiente de Confirmación del Técnico
    {
      idEstado: 'PENDING_TECHNICIAN_CONFIRMATION',
      estadoOrden: 'Pendiente de Confirmación del Técnico',
      rolUsuarioAutorizado: 'TECNICO',
      accionesPermitidas: ['CONFIRM_TECHNICIAN_AVAILABILITY'],
      estadoResultante: 'PENDING_EQUIPMENT_PREPARATION'
    },
    
    // Estado: Pendiente de Preparación de Equipos
    {
      idEstado: 'PENDING_EQUIPMENT_PREPARATION',
      estadoOrden: 'Pendiente de Preparación de Equipos',
      rolUsuarioAutorizado: 'TECNICO',
      accionesPermitidas: ['PREPARE_EQUIPMENT'],
      estadoResultante: 'PENDING_SURGERY'
    },
    
    // Estado: Pendiente de Cirugía
    {
      idEstado: 'PENDING_SURGERY',
      estadoOrden: 'Pendiente de Cirugía',
      rolUsuarioAutorizado: 'DOCTOR',
      accionesPermitidas: ['START_SURGERY'],
      estadoResultante: 'IN_PROGRESS'
    },
    
    // Estado: En Progreso
    {
      idEstado: 'IN_PROGRESS',
      estadoOrden: 'En Progreso',
      rolUsuarioAutorizado: 'DOCTOR',
      accionesPermitidas: ['COMPLETE_SURGERY'],
      estadoResultante: 'PENDING_EQUIPMENT_RETURN'
    },
    
    // Estado: Pendiente de Devolución de Equipos
    {
      idEstado: 'PENDING_EQUIPMENT_RETURN',
      estadoOrden: 'Pendiente de Devolución de Equipos',
      rolUsuarioAutorizado: 'TECNICO',
      accionesPermitidas: ['RETURN_EQUIPMENT'],
      estadoResultante: 'PENDING_FINAL_APPROVAL'
    },
    
    // Estado: Pendiente de Aprobación Final
    {
      idEstado: 'PENDING_FINAL_APPROVAL',
      estadoOrden: 'Pendiente de Aprobación Final',
      rolUsuarioAutorizado: 'GESTOR_OPERACIONES',
      accionesPermitidas: ['APPROVE_COMPLETION'],
      estadoResultante: 'COMPLETED'
    },
    
    // Estados finales (no tienen acciones permitidas)
    {
      idEstado: 'COMPLETED',
      estadoOrden: 'Completada',
      rolUsuarioAutorizado: 'GESTOR_OPERACIONES',
      accionesPermitidas: [],
      estadoResultante: 'COMPLETED'
    },
    
    {
      idEstado: 'REJECTED',
      estadoOrden: 'Rechazada',
      rolUsuarioAutorizado: 'GESTOR_OPERACIONES',
      accionesPermitidas: [],
      estadoResultante: 'REJECTED'
    },
    
    {
      idEstado: 'CANCELLED',
      estadoOrden: 'Cancelada',
      rolUsuarioAutorizado: 'GESTOR_OPERACIONES',
      accionesPermitidas: [],
      estadoResultante: 'CANCELLED'
    }
  ];

  // Buscar la entrada que coincida exactamente con el status y role proporcionados
  const matchingEntry = permissionMatrix.find(entry => 
    entry.idEstado === status && entry.rolUsuarioAutorizado === role
  );

  // Retornar las acciones permitidas o un array vacío si no hay coincidencias
  return matchingEntry ? matchingEntry.accionesPermitidas : [];
}
