import React from 'react';

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
  approvalCount?: number;
  approvalTotal?: number;
}

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  preparing: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  submitted: 'Enviada',
  review: 'En Revisión',
  approved: 'Aprobada',
  preparing: 'Preparando',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

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
  approvalCount = 0,
  approvalTotal = 2,
}) => {
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  let approvalColor = 'text-gray-900';
  let approvalIcon = (
    <svg className="h-4 w-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  if (approvalCount === approvalTotal) {
    approvalColor = 'text-green-600';
    approvalIcon = (
      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  } else if (approvalCount === 1) {
    approvalColor = 'text-red-600';
    approvalIcon = (
      <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
      </svg>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span className="font-semibold text-gray-900 text-sm">{orderId}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
          {statusLabels[status] || status}
        </span>
      </div>

      {/* Paciente y cirugía */}
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium">Paciente:</span>
          <span>{patientName}</span>
        </div>
        {patientId && (
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            <span className="font-medium">Cédula:</span>
            <span>{patientId}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">Cirugía:</span>
          <span>{formatDate(surgeryDate)} {surgeryTime && `• ${surgeryTime}`}</span>
        </div>
      </div>

      {/* Cobertura y aseguradora */}
      <div className="flex flex-wrap gap-2 mb-2">
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
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
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
          <span>{formatDateTime(createdAt)}</span>
        </div>
      </div>
      {/* Acciones rápidas y estado de aprobaciones */}
      <div className="flex items-center justify-between gap-2 mt-2">
        {/* Estado de aprobaciones */}
        <div className={`flex items-center gap-1 font-semibold text-xs ${approvalColor}`} title={`${approvalCount}/${approvalTotal} aprobaciones`}>
          {approvalIcon}
          <span>{approvalCount}/{approvalTotal} aprobaciones</span>
        </div>
        {/* Acciones rápidas */}
        <div className="flex items-center gap-2">
          <button 
            className="p-1 text-gray-500 hover:text-blue-600 rounded transition" 
            title="Ver detalles" 
            onClick={onView}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            className="p-1 text-gray-500 hover:text-green-600 rounded transition" 
            title="Editar" 
            onClick={onEdit}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            className="p-1 text-gray-500 hover:text-purple-600 rounded transition" 
            title="Calculadora de precios" 
            onClick={onPriceCalculator}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard; 