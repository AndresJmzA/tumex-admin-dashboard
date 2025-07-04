import React from 'react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  order: {
    orderId: string;
    status: string;
    patientName: string;
    surgeryDate: string;
    surgeryTime: string;
    typeOfCoverage: string;
    insuranceName?: string;
    itemsCount: number;
    createdAt: string;
    // Datos expandidos para detalles
    clientInfo?: {
      clientId: string;
      clientName: string;
      contactPerson?: string;
      phone?: string;
      email?: string;
    };
    products?: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      price: number;
    }>;
    statusHistory?: Array<{
      status: string;
      timestamp: string;
      changedBy: string;
      notes?: string;
    }>;
    approvals?: Array<{
      adminName: string;
      timestamp: string;
      approved: boolean;
      notes?: string;
    }>;
    patientId?: string;
  };
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, onApprove, onReject, order }) => {
  if (!isOpen) return null;

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detalles de Orden</h2>
              <p className="text-sm text-gray-600">{order.orderId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </span>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información del Paciente */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información del Paciente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre del Paciente</p>
                <p className="font-medium">{order.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Número de Cédula</p>
                <p className="font-medium">{order.patientId || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Cirugía</p>
                <p className="font-medium">{formatDate(order.surgeryDate)} {order.surgeryTime}</p>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          {order.clientInfo && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Información del Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID del Cliente</p>
                  <p className="font-medium">{order.clientInfo.clientId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre del Cliente</p>
                  <p className="font-medium">{order.clientInfo.clientName}</p>
                </div>
                {order.clientInfo.contactPerson && (
                  <div>
                    <p className="text-sm text-gray-600">Persona de Contacto</p>
                    <p className="font-medium">{order.clientInfo.contactPerson}</p>
                  </div>
                )}
                {order.clientInfo.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className="font-medium">{order.clientInfo.phone}</p>
                  </div>
                )}
                {order.clientInfo.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{order.clientInfo.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cobertura y Seguro */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Cobertura y Seguro
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tipo de Cobertura</p>
                <p className="font-medium">{order.typeOfCoverage}</p>
              </div>
              {order.insuranceName && (
                <div>
                  <p className="text-sm text-gray-600">Aseguradora</p>
                  <p className="font-medium">{order.insuranceName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Productos */}
          {order.products && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Productos ({order.products.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Historial de Estados */}
          {order.statusHistory && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Historial de Estados
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {order.statusHistory.map((change, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[change.status]}`}>
                            {statusLabels[change.status]}
                          </span>
                          <span className="text-sm text-gray-500">{formatDate(change.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Cambiado por: {change.changedBy}</p>
                        {change.notes && (
                          <p className="text-sm text-gray-500 mt-1">{change.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sistema de Aprobación Dual */}
          {order.approvals && (
            <div className="bg-green-50 border border-green-200 rounded-lg">
              <div className="p-4 border-b border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Aprobaciones Requeridas
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.approvals.map((approval, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{approval.adminName}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          approval.approved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {approval.approved ? 'Aprobado' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{formatDate(approval.timestamp)}</p>
                      {approval.notes && (
                        <p className="text-sm text-gray-600 mt-1">{approval.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gestión de Precios y Negociación */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="p-4 border-b border-yellow-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Gestión de Precios y Negociación
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {/* Mock: precios de tabulador y negociación */}
              {/* Simulación de tres casos: activa, aceptada, rechazada */}
              {(() => {
                // Mock de precios y negociación
                const tabuladorPrivado = 12000;
                const tabuladorSeguro = 11000;
                const precioPropuesto = 11700;
                const negotiationState: 'activa' | 'aceptada' | 'rechazada' = 'activa'; // Cambia aquí para simular
                const negotiationHistory = [
                  { actor: 'TUMex', precio: 12000, fecha: '2025-06-20T10:00:00', nota: 'Precio tabulador privado' },
                  { actor: 'Seguro', precio: 11000, fecha: '2025-06-20T12:00:00', nota: 'Contraoferta de seguro' },
                  { actor: 'TUMex', precio: 11700, fecha: '2025-06-20T13:00:00', nota: 'Propuesta final TUMex' },
                ];
                // Validación visual
                let warning = '';
                if (precioPropuesto < tabuladorSeguro) warning = 'El precio propuesto está por debajo del tabulador de seguro.';
                if (precioPropuesto > tabuladorPrivado) warning = 'El precio propuesto está por encima del tabulador privado.';
                // Estado visual
                let negotiationBadge = null;
                if (negotiationState === 'activa') {
                  negotiationBadge = <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium ml-2">Negociación Activa</span>;
                } else if (negotiationState === 'aceptada') {
                  negotiationBadge = <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium ml-2">Negociación Aceptada</span>;
                } else if (negotiationState === 'rechazada') {
                  negotiationBadge = <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium ml-2">Negociación Rechazada</span>;
                }
                return (
                  <>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tabulador Privado</p>
                        <p className="font-medium text-gray-900">{formatCurrency(tabuladorPrivado)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tabulador Seguro</p>
                        <p className="font-medium text-gray-900">{formatCurrency(tabuladorSeguro)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Precio Propuesto</p>
                        <p className="font-medium text-blue-900">{formatCurrency(precioPropuesto)} {negotiationBadge}</p>
                      </div>
                    </div>
                    {warning && (
                      <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-xs">
                        {warning}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Historial de Negociación</h4>
                      <div className="space-y-2">
                        {negotiationHistory.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <span className="font-medium text-gray-700">{item.actor}:</span>
                            <span className="text-gray-900">{formatCurrency(item.precio)}</span>
                            <span className="text-gray-500">{formatDate(item.fecha)}</span>
                            <span className="text-gray-500 italic">{item.nota}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
            >
              Cerrar
            </button>
            {onApprove && (
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md transition"
              >
                Aprobar
              </button>
            )}
            {onReject && (
              <button
                onClick={onReject}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition"
              >
                Rechazar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal; 