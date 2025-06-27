
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'orden-inicio' | 'orden-fin' | 'negociacion-limite' | 'aprobacion-pendiente' | 'critico';
  status: 'normal' | 'urgente' | 'critico';
  description?: string;
  orderId?: string;
}

export interface CalendarEventType {
  type: CalendarEvent['type'];
  label: string;
  color: string;
  bgColor: string;
}
