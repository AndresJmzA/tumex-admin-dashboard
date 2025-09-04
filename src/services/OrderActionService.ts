// Importar las Fuentes de Verdad del Proyecto
import { CanonicalOrderStatus } from '@/utils/status';
import { UserRole } from '@/contexts/AuthContext';

// Tipos para las acciones disponibles en el sistema
export type Action = 
  | 'ACCEPT_ORDER'                 // Aceptar Orden
  | 'REJECT_ORDER'                 // Rechazar Orden
  | 'RESCHEDULE_ORDER'             // Reprogramar Orden
  | 'CONTACT_DOCTOR'               // Contactar Doctor
  | 'CONFIRM_EQUIPMENT'            // Confirmar Equipos
  | 'CONFIRM_ORDER'                // Confirmar Orden
  | 'REJECT_RESCHEDULE'            // Rechazar Reprogramación
  | 'PREPARE_ORDER'                // Preparar Orden
  | 'ASSIGN_TECHNICIANS'           // Asignar Técnicos
  | 'LOAD_ORDER'                   // Cargar Orden
  | 'SEND_ORDER'                   // Enviar Orden
  | 'ARRIVE_LOCATION'              // Llegar al Lugar
  | 'INSTALL_ORDER'                // Instalar Orden
  | 'COMPLETE_ORDER'               // Completar Orden
  | 'RETURN_BASE'                  // Regresar a Base
  | 'CLOSE_ORDER'                  // Cerrar Orden
  | 'REOPEN_ORDER'                 // Reabrir Orden
  | 'VIEW_ORDER_HISTORY'           // Ver Historial de Orden
  | 'EDIT_ORDER'                   // Editar Orden
  | 'DELETE_ORDER';                // Eliminar Orden

// Interfaz para cada entrada de la Matriz de Permisos
interface PermissionMatrixEntry {
  idEstado: CanonicalOrderStatus;  // Estado canónico de la orden
  estadoOrden: string;             // Nombre legible del estado
  rolUsuarioAutorizado: UserRole;  // Rol del usuario autorizado
  accionesPermitidas: Action[];    // Acciones disponibles
  estadoResultante: CanonicalOrderStatus; // Estado resultante
}

/**
 * Obtiene las acciones disponibles para un estado de orden y rol de usuario específicos
 * @param status - El estado actual de la orden (usando CanonicalOrderStatus)
 * @param role - El rol del usuario que intenta realizar la acción (usando UserRole del AuthContext)
 * @returns Array de acciones permitidas, o array vacío si no hay coincidencias
 */
export function getAvailableActions(status: CanonicalOrderStatus, role: UserRole): Action[] {
  // Matriz de Permisos reconstruida usando estados y roles canónicos
  const permissionMatrix: PermissionMatrixEntry[] = [
    // Cuando una orden está recién creada
    {
      idEstado: 'created',
      estadoOrden: 'Orden Creada',
      rolUsuarioAutorizado: UserRole.GERENTE_OPERATIVO,
      accionesPermitidas: ['ACCEPT_ORDER', 'REJECT_ORDER'],
      estadoResultante: 'approved'
    },
    
    // Cuando una orden es rechazada
    {
      idEstado: 'rejected',
      estadoOrden: 'Rechazada',
      rolUsuarioAutorizado: UserRole.GERENTE_OPERATIVO,
      accionesPermitidas: ['RESCHEDULE_ORDER'],
      estadoResultante: 'rescheduled'
    },
    
    // Cuando una orden ha sido aprobada por operaciones
    {
      idEstado: 'approved',
      estadoOrden: 'Aprobada',
      rolUsuarioAutorizado: UserRole.MEDICO,
      accionesPermitidas: ['CONFIRM_ORDER'],
      estadoResultante: 'doctor_confirmation'
    },
    
    // Cuando una orden está en confirmación con el médico
    {
      idEstado: 'doctor_confirmation',
      estadoOrden: 'Confirmación con Médico',
      rolUsuarioAutorizado: UserRole.MEDICO,
      accionesPermitidas: ['CONFIRM_ORDER', 'REJECT_RESCHEDULE'],
      estadoResultante: 'objects_confirmed'
    },
    
    // Cuando los objetos han sido confirmados
    {
      idEstado: 'objects_confirmed',
      estadoOrden: 'Objetos Confirmados',
      rolUsuarioAutorizado: UserRole.GERENTE_COMERCIAL,
      accionesPermitidas: ['CONTACT_DOCTOR', 'CONFIRM_EQUIPMENT'],
      estadoResultante: 'templates_ready'
    },
    
    // Cuando las plantillas están listas
    {
      idEstado: 'templates_ready',
      estadoOrden: 'Plantillas Listas',
      rolUsuarioAutorizado: UserRole.GERENTE_OPERATIVO,
      accionesPermitidas: ['PREPARE_ORDER'],
      estadoResultante: 'in_preparation'
    },
    
    // Cuando la orden está en preparación
    {
      idEstado: 'in_preparation',
      estadoOrden: 'En Preparación',
      rolUsuarioAutorizado: UserRole.GERENTE_OPERATIVO,
      accionesPermitidas: ['ASSIGN_TECHNICIANS'],
      estadoResultante: 'technicians_assigned'
    },
    
    // Cuando los técnicos han sido asignados
    {
      idEstado: 'technicians_assigned',
      estadoOrden: 'Técnicos Asignados',
      rolUsuarioAutorizado: UserRole.TECNICO,
      accionesPermitidas: ['LOAD_ORDER'],
      estadoResultante: 'assigned'
    },
    
    // Cuando la orden está asignada a técnicos
    {
      idEstado: 'assigned',
      estadoOrden: 'Asignada',
      rolUsuarioAutorizado: UserRole.TECNICO,
      accionesPermitidas: ['SEND_ORDER'],
      estadoResultante: 'in_transit'
    },
    
    // Cuando la orden está en tránsito
    {
      idEstado: 'in_transit',
      estadoOrden: 'En Tránsito',
      rolUsuarioAutorizado: UserRole.TECNICO,
      accionesPermitidas: ['ARRIVE_LOCATION'],
      estadoResultante: 'in_progress'
    },
    
    // Cuando la orden está en proceso
    {
      idEstado: 'in_progress',
      estadoOrden: 'En Proceso',
      rolUsuarioAutorizado: UserRole.TECNICO,
      accionesPermitidas: ['INSTALL_ORDER'],
      estadoResultante: 'surgery_prepared'
    },
    
    // Cuando el quirófano está preparado
    {
      idEstado: 'surgery_prepared',
      estadoOrden: 'Quirófano Preparado',
      rolUsuarioAutorizado: UserRole.MEDICO,
      accionesPermitidas: ['COMPLETE_ORDER'],
      estadoResultante: 'surgery_completed'
    },
    
    // Cuando la cirugía ha sido completada
    {
      idEstado: 'surgery_completed',
      estadoOrden: 'Cirugía Completada',
      rolUsuarioAutorizado: UserRole.TECNICO,
      accionesPermitidas: ['RETURN_BASE'],
      estadoResultante: 'returned'
    },
    
    // Cuando los técnicos han regresado
    {
      idEstado: 'returned',
      estadoOrden: 'De Vuelta',
      rolUsuarioAutorizado: UserRole.GERENTE_OPERATIVO,
      accionesPermitidas: ['CLOSE_ORDER'],
      estadoResultante: 'completed'
    },
    
    // Cuando la orden ha sido reagendada
    {
      idEstado: 'rescheduled',
      estadoOrden: 'Reagendada',
      rolUsuarioAutorizado: UserRole.GERENTE_OPERATIVO,
      accionesPermitidas: ['EDIT_ORDER'],
      estadoResultante: 'created'
    },
    
    // Cuando la orden ha sido aceptada por el médico
    {
      idEstado: 'doctor_approved',
      estadoOrden: 'Aceptada por Médico',
      rolUsuarioAutorizado: UserRole.GERENTE_COMERCIAL,
      accionesPermitidas: ['CONFIRM_EQUIPMENT'],
      estadoResultante: 'templates_ready'
    },
    
    // Cuando la orden ha sido rechazada por el médico
    {
      idEstado: 'doctor_rejected',
      estadoOrden: 'Rechazada por Médico',
      rolUsuarioAutorizado: UserRole.GERENTE_COMERCIAL,
      accionesPermitidas: ['REJECT_RESCHEDULE'],
      estadoResultante: 'cancelled'
    },
    
    // Cuando la orden está lista para técnicos
    {
      idEstado: 'ready_for_technicians',
      estadoOrden: 'Lista para Técnicos',
      rolUsuarioAutorizado: UserRole.TECNICO,
      accionesPermitidas: ['LOAD_ORDER'],
      estadoResultante: 'assigned'
    },
    
    // Cuando los equipos han sido trasladados
    {
      idEstado: 'equipment_transported',
      estadoOrden: 'Equipos Trasladados',
      rolUsuarioAutorizado: UserRole.TECNICO,
      accionesPermitidas: ['INSTALL_ORDER'],
      estadoResultante: 'surgery_prepared'
    },
    
    // Cuando la orden está lista para facturar
    {
      idEstado: 'ready_for_billing',
      estadoOrden: 'Lista para Facturar',
      rolUsuarioAutorizado: UserRole.FINANZAS,
      accionesPermitidas: ['VIEW_ORDER_HISTORY'],
      estadoResultante: 'billed'
    },
    
    // Cuando la orden ha sido facturada
    {
      idEstado: 'billed',
      estadoOrden: 'Facturada',
      rolUsuarioAutorizado: UserRole.FINANZAS,
      accionesPermitidas: ['VIEW_ORDER_HISTORY'],
      estadoResultante: 'completed'
    },
    
    // Cuando se ha creado la remisión
    {
      idEstado: 'remission_created',
      estadoOrden: 'Remisión Creada',
      rolUsuarioAutorizado: UserRole.GERENTE_OPERATIVO,
      accionesPermitidas: ['VIEW_ORDER_HISTORY'],
      estadoResultante: 'ready_for_billing'
    },
    
    // Estados finales
    {
      idEstado: 'completed',
      estadoOrden: 'Completada',
      rolUsuarioAutorizado: UserRole.GERENTE_OPERATIVO,
      accionesPermitidas: ['VIEW_ORDER_HISTORY'],
      estadoResultante: 'completed'
    },
    
    {
      idEstado: 'cancelled',
      estadoOrden: 'Cancelada',
      rolUsuarioAutorizado: UserRole.GERENTE_OPERATIVO,
      accionesPermitidas: ['REOPEN_ORDER'],
      estadoResultante: 'created'
    }
  ];

  // Buscar la entrada que coincida exactamente con el status y role proporcionados
  const matchingEntry = permissionMatrix.find(entry => 
    entry.idEstado === status && entry.rolUsuarioAutorizado === role
  );

  // Retornar las acciones permitidas o un array vacío si no hay coincidencias
  return matchingEntry ? matchingEntry.accionesPermitidas : [];
}
