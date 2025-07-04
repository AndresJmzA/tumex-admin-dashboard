import { useState } from 'react';
import { CalendarEvent } from '@/types/calendar';
import WeeklyCalendar from "@/components/WeeklyCalendar";
import EventList from "@/components/EventList";
import EventForm from "@/components/EventForm";
import CalendarViewToggle from '@/components/CalendarViewToggle';
import MonthCalendar from '@/components/MonthCalendar';
import AgendaView from '@/components/AgendaView';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const sampleUsers = [
  { id: 'admin-1', name: 'Juan Admin' },
  { id: 'almacen-1', name: 'Carlos Almacén' },
  { id: 'tecnico-1', name: 'Pedro Técnico' }
];

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [view, setView] = useState<'month' | 'agenda'>('month');
  const [monthDate, setMonthDate] = useState(new Date());
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const maxSelected = isMobile ? 1 : isTablet ? 4 : 6;
  const [selectedUsers, setSelectedUsers] = useState<string[]>(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 640) {
      return [sampleUsers[0].id];
    }
    return sampleUsers.map(u => u.id);
  });

  // Datos de ejemplo para mostrar la funcionalidad
  const sampleEvents: CalendarEvent[] = [
    // Juan Admin
    {
      id: '1',
      title: 'Reunión con dirección',
      date: new Date(2025, 0, 27, 9, 0),
      type: 'negociacion',
      status: 'pendiente',
      priority: 'alta',
      assignedTo: 'admin-1',
      createdBy: 'admin-1',
      department: 'administracion',
      visibility: 'all',
      description: 'Revisión de objetivos trimestrales y KPIs.',
      startTime: '09:00',
      endTime: '10:00',
      location: 'Sala de Juntas',
      attendees: ['Juan Admin', 'Dirección'],
      notes: ''
    },
    {
      id: '2',
      title: 'Llamada con proveedor',
      date: new Date(2025, 0, 27, 12, 0),
      type: 'orden',
      status: 'en-proceso',
      priority: 'media',
      assignedTo: 'admin-1',
      createdBy: 'admin-1',
      department: 'administracion',
      visibility: 'all',
      description: 'Negociación de precios para insumos médicos.',
      startTime: '12:00',
      endTime: '12:30',
      location: 'Oficina Principal',
      attendees: ['Juan Admin', 'Proveedor XYZ'],
      notes: ''
    },
    // Carlos Almacén
    {
      id: '3',
      title: 'Inventario matutino',
      date: new Date(2025, 0, 27, 8, 0),
      type: 'servicio',
      status: 'pendiente',
      priority: 'alta',
      assignedTo: 'almacen-1',
      createdBy: 'admin-1',
      department: 'almacen',
      visibility: 'department',
      description: 'Revisión y conteo de materiales críticos.',
      startTime: '08:00',
      endTime: '09:00',
      location: 'Almacén Central',
      attendees: ['Carlos Almacén'],
      notes: ''
    },
    {
      id: '4',
      title: 'Recepción de insumos',
      date: new Date(2025, 0, 27, 15, 0),
      type: 'orden',
      status: 'pendiente',
      priority: 'media',
      assignedTo: 'almacen-1',
      createdBy: 'admin-1',
      department: 'almacen',
      visibility: 'department',
      description: 'Recepción y registro de nuevos insumos médicos.',
      startTime: '15:00',
      endTime: '16:00',
      location: 'Almacén Central',
      attendees: ['Carlos Almacén', 'Proveedor ABC'],
      notes: ''
    },
    // Pedro Técnico
    {
      id: '5',
      title: 'Mantenimiento quirófano',
      date: new Date(2025, 0, 27, 10, 0),
      type: 'servicio',
      status: 'en-proceso',
      priority: 'alta',
      assignedTo: 'tecnico-1',
      createdBy: 'admin-1',
      department: 'tecnico',
      visibility: 'department',
      description: 'Revisión y calibración de equipos de quirófano.',
      startTime: '10:00',
      endTime: '11:30',
      location: 'Quirófano 2',
      attendees: ['Pedro Técnico'],
      notes: ''
    },
    {
      id: '6',
      title: 'Capacitación de equipo',
      date: new Date(2025, 0, 27, 13, 0),
      type: 'servicio',
      status: 'pendiente',
      priority: 'media',
      assignedTo: 'tecnico-1',
      createdBy: 'admin-1',
      department: 'tecnico',
      visibility: 'department',
      description: 'Capacitación sobre uso de nuevo monitor de signos vitales.',
      startTime: '13:00',
      endTime: '14:00',
      location: 'Sala de Capacitación',
      attendees: ['Pedro Técnico', 'Enfermería'],
      notes: ''
    }
  ];

  // Inicializar eventos de ejemplo
  useState(() => {
    setEvents(sampleEvents);
  });

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    setEditingEvent(undefined);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el evento "${event.title}"?`)) {
      setEvents(prev => prev.filter(e => e.id !== event.id));
    }
  };

  const handleViewEvent = (event: CalendarEvent) => {
    alert(`Evento: ${event.title}\nDescripción: ${event.description || 'Sin descripción'}`);
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => 
        e.id === editingEvent.id 
          ? { ...e, ...eventData, id: e.id } as CalendarEvent
          : e
      ));
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventData.title || '',
        date: eventData.date || new Date(),
        type: eventData.type || 'orden',
        status: eventData.status || 'pendiente',
        priority: eventData.priority || 'media',
        assignedTo: eventData.assignedTo || 'current-user',
        createdBy: eventData.createdBy || 'current-user',
        department: eventData.department || 'administracion',
        visibility: eventData.visibility || 'personal',
        description: eventData.description,
        orderId: eventData.orderId,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        location: eventData.location,
        attendees: eventData.attendees,
        notes: eventData.notes
      };
      setEvents(prev => [...prev, newEvent]);
    }
    setIsFormOpen(false);
    setEditingEvent(undefined);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingEvent(undefined);
  };

  // Navegación de mes para MonthCalendar
  const handlePrevMonth = () => {
    setMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className={cn(
      "space-y-4 sm:space-y-6",
      isMobile && "space-y-3",
      isMobile && view === 'agenda' && "overflow-x-hidden px-4"
    )}>
      {/* Sección de Bienvenida y Toggle de Vista */}
      <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2", isMobile && "gap-2")}>
        <div>
          <h1 className={cn("text-2xl sm:text-3xl font-bold text-gray-900 mb-2", isMobile && "text-xl mb-1")}>Calendario de Eventos</h1>
          <p className={cn("text-sm sm:text-base text-gray-600", isMobile && "text-xs")}>Gestiona y visualiza todos los eventos importantes de tu plataforma médica</p>
        </div>
        <div>
          <CalendarViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {/* Selector de personas para la agenda */}
      {view === 'agenda' && (
        <div className={cn("max-w-xl", isMobile && "w-full")}>
          {isMobile ? (
            <Select
              value={selectedUsers[0] || ''}
              onValueChange={val => setSelectedUsers([val])}
            >
              <SelectTrigger className="w-full text-sm">
                <SelectValue placeholder="Selecciona persona..." />
              </SelectTrigger>
              <SelectContent>
                {sampleUsers.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <MultiSelect
              options={sampleUsers.map(u => ({ label: u.name, value: u.id }))}
              value={selectedUsers}
              onChange={setSelectedUsers}
              maxSelected={maxSelected}
              placeholder="Selecciona personas..."
            />
          )}
        </div>
      )}

      {/* Layout principal según vista */}
      {view === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Columna principal: Calendario mensual grande */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-tumex-card p-4 sm:p-6 shadow-sm border border-gray-100">
              {/* Navegación de mes */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="px-2 py-1 rounded-tumex-button bg-gray-50 hover:bg-gray-100 text-gray-600">{'<'}</button>
                <span className="font-semibold text-lg text-gray-900">
                  {monthDate.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handleNextMonth} className="px-2 py-1 rounded-tumex-button bg-gray-50 hover:bg-gray-100 text-gray-600">{'>'}</button>
              </div>
              <MonthCalendar
                monthDate={monthDate}
                selectedDate={selectedDate}
                events={events}
                onSelectDate={date => {
                  setSelectedDate(date);
                  setMonthDate(new Date(date.getFullYear(), date.getMonth(), 1));
                }}
              />
            </div>
          </div>
          {/* Columna lateral: Actividades del día */}
          <div className="lg:col-span-3">
            <EventList
              selectedDate={selectedDate}
              events={events}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onViewEvent={handleViewEvent}
              showActions={true}
            />
          </div>
        </div>
      ) : (
        <div className={cn(
          "bg-white rounded-tumex-card shadow-sm border border-gray-100",
          isMobile ? "rounded-none border-0 shadow-none bg-transparent overflow-x-hidden" : "p-4"
        )}>
          {/* Mensaje si no hay personas seleccionadas */}
          {selectedUsers.length === 0 ? (
            <div className="text-center text-gray-400 py-12 text-sm">Selecciona al menos una persona para ver la agenda.</div>
          ) : (
            <AgendaView
              date={selectedDate}
              events={events}
              users={sampleUsers.filter(u => selectedUsers.includes(u.id))}
              onSelectEvent={handleViewEvent}
            />
          )}
        </div>
      )}

      {/* Formulario de Evento */}
      <EventForm
        event={editingEvent}
        selectedDate={selectedDate}
        onSave={handleSaveEvent}
        onCancel={handleCancelForm}
        isOpen={isFormOpen}
      />
    </div>
  );
};

export default Calendar;
