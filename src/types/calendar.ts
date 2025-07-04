export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'negociacion' | 'orden' | 'servicio' | 'financiero';
  status: 'pendiente' | 'en-proceso' | 'completado';
  assignedTo: string; // ID del usuario asignado
  createdBy: string; // ID del usuario que creó el evento
  department: 'almacen' | 'tecnico' | 'administracion';
  visibility: 'personal' | 'department' | 'all';
  description?: string;
  orderId?: string;
  priority: 'baja' | 'media' | 'alta' | 'critica';
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
  notes?: string;
}

export interface CalendarEventType {
  type: CalendarEvent['type'];
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export interface UserAccessLevel {
  role: 'admin' | 'almacen' | 'tecnico';
  permissions: {
    canViewAll: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canAssign: boolean;
    canFilter: boolean;
  };
  allowedEventTypes: CalendarEvent['type'][];
}

export interface EventFilter {
  userFilter: 'all' | 'personal' | 'specific';
  departmentFilter?: 'almacen' | 'tecnico' | 'administracion';
  typeFilter?: CalendarEvent['type'];
  statusFilter?: CalendarEvent['status'];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Tipos específicos de eventos del negocio
export interface NegociacionEvent extends CalendarEvent {
  type: 'negociacion';
  contraofertaId: string;
  seguroName: string;
  montoOriginal: number;
  montoContraoferta: number;
  fechaLimite: Date;
  estadoContraoferta: 'pendiente' | 'aceptada' | 'rechazada';
}

export interface OrdenEvent extends CalendarEvent {
  type: 'orden';
  orderId: string;
  clienteName: string;
  equipos: string[];
  tipoOrden: 'preparacion' | 'entrega' | 'retiro' | 'instalacion';
  direccion?: string;
}

export interface ServicioEvent extends CalendarEvent {
  type: 'servicio';
  ticketId?: string;
  tipoServicio: 'ticket' | 'mantenimiento' | 'capacitacion' | 'visita-tecnica';
  equiposInvolucrados?: string[];
  clienteName?: string;
}

export interface FinancieroEvent extends CalendarEvent {
  type: 'financiero';
  monto: number;
  tipoFinanciero: 'pago' | 'facturacion' | 'vencimiento' | 'revision';
  contratoId?: string;
  clienteName?: string;
}
