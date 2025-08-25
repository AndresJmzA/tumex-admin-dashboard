// Tipos para el sistema de rechazo de órdenes

export type RejectionReason = 
  | 'Técnicos no disponibles'
  | 'Traslapo de fechas'
  | 'Equipo no disponible'
  | 'Otro';

export type RejectionStatus = 'Rejected' | 'Rescheduled';

export interface OrderRejection {
  id: string;
  order_id: string;
  rejection_reason: RejectionReason;
  custom_reason?: string;
  notes?: string;
  reschedule_date?: string;
  rejected_by: string;
  rejected_at: string;
  status: RejectionStatus;
}

export interface CreateOrderRejectionData {
  order_id: string;
  rejection_reason: RejectionReason;
  custom_reason?: string;
  notes?: string;
  reschedule_date?: string;
  rejected_by: string;
  status: RejectionStatus;
}

export interface OrderRejectionFormData {
  rejection_reason: RejectionReason;
  custom_reason: string;
  notes: string;
  should_reschedule: boolean;
  reschedule_date: string;
}
