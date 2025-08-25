import React from 'react';
import { ConditionalContent } from '@/components/PermissionGuard';
import { getStatusLabel, getStatusClass } from '@/utils/status';

// Tipos mock para la orden
export interface OrderCardProps {
  orderId: string;
  status: string;
  patientName: string;
  patientId?: string;
  surgeryDate: string | Date;
  surgeryTime: string;
  typeOfCoverage: string;
  insuranceName?: string;
  itemsCount: number;
  createdAt: string | Date;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPriceCalculator?: () => void;
  onAssignTechnicians?: () => void;
  onReject?: () => void;
  canReject?: boolean;
}

// Mapeos locales reemplazados por utilidades canónicas en utils/status

const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  status,
  patientName,
  patientId,
  surgeryDate,
  surgeryTime,
  typeOfCoverage,
  insuranceName,
  itemsCount,
  createdAt,
  onView,
  onEdit,
  onDelete,
  onPriceCalculator,
  onAssignTechnicians,
  onReject,
  canReject = false,
}) => {
  const formatDate = (date: string | Date) => {
    if (!date) return 'Fecha no disponible';
    
    const d = new Date(date);
    // Verificar si la fecha es válida
    if (isNaN(d.getTime())) {
      return 'Fecha inválida';
    }
    
    return d.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (date: string | Date) => {
    if (!date) return 'Fecha no disponible';
    
    const d = new Date(date);
    // Verificar si la fecha es válida
    if (isNaN(d.getTime())) {
      return 'Fecha inválida';
    }
    
    return d.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5); // Mostrar solo HH:MM
  };

  let approvalColor = 'text-gray-900';
  let approvalIcon = (
    <svg className="h-4 w-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  if (status === 'approved' || status === 'doctor_confirmation' || status === 'templates_ready' || 
      /* technicians_assigned retirado */ status === 'equipment_transported' || status === 'remission_created' || 
      status === 'surgery_prepared' || status === 'surgery_completed' || status === 'ready_for_billing' || 
      status === 'billed') {
    approvalColor = 'text-green-600';
    approvalIcon = (
      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  } else if (status === 'cancelled') {
    approvalColor = 'text-red-600';
    approvalIcon = (
      <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
      </svg>
    );
  }

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="font-semibold text-gray-900 text-sm">{orderId}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusClass(status)}`}>
          {getStatusLabel(status)}
        </span>
      </div>

      {/* Leyenda para plantillas listas */}
      {status === 'templates_ready' && (
        <div className="mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            Lista para asignar técnicos
          </span>
        </div>
      )}

      {/* Información del paciente */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium">Paciente:</span>
          <span className="font-semibold">{patientName}</span>
        </div>
        
        {/* Fecha y hora de cirugía */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Cirugía:</span>
          <span className="font-semibold">
            {formatDate(surgeryDate)} {surgeryTime && `• ${formatTime(surgeryTime)}`}
          </span>
        </div>
      </div>

      {/* Cobertura y aseguradora */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {typeOfCoverage}
        </span>
        {insuranceName && (
          <span className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {insuranceName}
          </span>
        )}
      </div>

      {/* Productos y fecha de creación */}
      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>{itemsCount} productos</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Creada: {formatDateTime(createdAt)}</span>
        </div>
      </div>
      {/* Acciones rápidas y estado de aprobaciones */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100">
        {/* Estado de aprobación */}
        <div className={`flex items-center gap-1 font-semibold text-xs ${approvalColor}`} title="Estado de aprobación">
          {approvalIcon}
          <span>{status === 'pending_approval' ? 'Pendiente' : status === 'approved' ? 'Aprobada' : status === 'cancelled' ? 'Cancelada' : 'En Proceso'}</span>
        </div>
        {/* Acciones rápidas */}
        <div className="flex items-center gap-2">
          {/* Botón Asignar Técnicos removido: solo se muestra en el modal de detalles */}
          
          {/* Botón de Rechazo - Solo para órdenes que se pueden rechazar */}
          {canReject && onReject && (
            <button 
              className="p-1 text-gray-500 hover:text-red-600 rounded transition" 
              title="Rechazar orden" 
              onClick={(e) => {
                e.stopPropagation();
                onReject();
              }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Botón Calculadora de Precios - Solo para roles comerciales y administrativos */}
          <ConditionalContent requiredPermissions={['finances:read']}>
            <button 
              className="p-1 text-gray-500 hover:text-purple-600 rounded transition" 
              title="Calculadora de precios" 
              onClick={onPriceCalculator}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 002 2z" />
              </svg>
            </button>
          </ConditionalContent>
        </div>
      </div>
    </div>
  );
};

export default OrderCard; 