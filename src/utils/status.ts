// Utilidades para normalizar y formatear estados de órdenes

export type CanonicalOrderStatus =
  | 'created'
  | 'pending_objects'
  | 'doctor_confirmation'
  | 'objects_confirmed'
  | 'approved'
  | 'rescheduled'
  | 'rejected'
  | 'doctor_approved'
  | 'doctor_rejected'
  | 'templates_ready'
  | 'technicians_assigned'
  | 'in_preparation'
  | 'ready_for_technicians'
  | 'assigned'
  | 'in_transit'
  | 'in_progress'
  | 'returned'
  | 'remission_created'
  | 'equipment_transported'
  | 'surgery_prepared'
  | 'surgery_completed'
  | 'ready_for_billing'
  | 'billed'
  | 'completed'
  | 'cancelled';

// Mapeo de sinónimos y estados provenientes de BD
const STATUS_ALIASES: Record<string, CanonicalOrderStatus> = {
  created: 'created',
  pending_objects: 'pending_objects',
  doctor_confirmation: 'doctor_confirmation',
  objects_confirmed: 'objects_confirmed',
  approved: 'approved',
  rescheduled: 'rescheduled',
  rejected: 'rejected',
  doctor_approved: 'doctor_approved',
  doctor_rejected: 'doctor_rejected',
  templates_ready: 'templates_ready',
  technicians_assigned: 'technicians_assigned',
  in_preparation: 'in_preparation',
  ready_for_technicians: 'ready_for_technicians',
  assigned: 'assigned',
  in_transit: 'in_transit',
  in_progress: 'in_progress',
  in_process: 'in_progress',
  back: 'returned',
  returned: 'returned',
  remission_created: 'remission_created',
  equipment_transported: 'equipment_transported',
  surgery_prepared: 'surgery_prepared',
  surgery_completed: 'surgery_completed',
  ready_for_billing: 'ready_for_billing',
  billed: 'billed',
  closed: 'completed',
  completed: 'completed',
  cancelled: 'cancelled',
};

export const STATUS_LABELS: Record<CanonicalOrderStatus, string> = {
  created: 'Creada',
  pending_objects: 'Pendiente de Objetos',
  doctor_confirmation: 'Confirmación con Médico',
  objects_confirmed: 'Objetos Confirmados',
  approved: 'Aprobada',
  rescheduled: 'Reagendada',
  rejected: 'Rechazada',
  doctor_approved: 'Aceptada por Médico',
  doctor_rejected: 'Rechazada por Médico',
  templates_ready: 'Plantillas Listas',
  technicians_assigned: 'Técnicos Asignados',
  in_preparation: 'En Preparación',
  ready_for_technicians: 'Lista para Técnicos',
  assigned: 'Asignada',
  in_transit: 'En Tránsito',
  in_progress: 'En Proceso',
  returned: 'De Vuelta',
  remission_created: 'Remisión Creada',
  equipment_transported: 'Equipos Trasladados',
  surgery_prepared: 'Quirófano Preparado',
  surgery_completed: 'Cirugía Completada',
  ready_for_billing: 'Lista para Facturar',
  billed: 'Facturada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export const STATUS_CLASSES: Record<CanonicalOrderStatus, string> = {
  created: 'bg-blue-100 text-blue-800',
  pending_objects: 'bg-amber-100 text-amber-800',
  doctor_confirmation: 'bg-indigo-100 text-indigo-800',
  objects_confirmed: 'bg-teal-100 text-teal-800',
  approved: 'bg-green-100 text-green-800',
  rescheduled: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  doctor_approved: 'bg-emerald-100 text-emerald-800',
  doctor_rejected: 'bg-orange-100 text-orange-800',
  templates_ready: 'bg-purple-100 text-purple-800',
  technicians_assigned: 'bg-purple-100 text-purple-800',
  in_preparation: 'bg-yellow-100 text-yellow-800',
  ready_for_technicians: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-cyan-100 text-cyan-800',
  returned: 'bg-gray-100 text-gray-800',
  remission_created: 'bg-teal-100 text-teal-800',
  equipment_transported: 'bg-teal-100 text-teal-800',
  surgery_prepared: 'bg-teal-100 text-teal-800',
  surgery_completed: 'bg-teal-100 text-teal-800',
  ready_for_billing: 'bg-teal-100 text-teal-800',
  billed: 'bg-teal-100 text-teal-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function normalizeStatus(raw: string | null | undefined): CanonicalOrderStatus {
  if (!raw) return 'created';
  const key = String(raw).toLowerCase().trim();
  return STATUS_ALIASES[key] ?? 'created';
}

export function getStatusLabel(raw: string | null | undefined): string {
  return STATUS_LABELS[normalizeStatus(raw)];
}

export function getStatusClass(raw: string | null | undefined): string {
  return STATUS_CLASSES[normalizeStatus(raw)];
}


