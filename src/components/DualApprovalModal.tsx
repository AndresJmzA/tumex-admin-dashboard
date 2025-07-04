import React, { useState } from 'react';

interface ApprovalAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ApprovalRequest {
  orderId: string;
  patientName: string;
  totalAmount: number;
  requiresApproval: boolean;
  currentApprovals: Array<{
    adminId: string;
    adminName: string;
    approved: boolean;
    timestamp?: string;
    notes?: string;
    signature?: string;
  }>;
  requiredAdmins: ApprovalAdmin[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  deadline?: string;
}

interface DualApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  approvalRequest: ApprovalRequest;
  currentAdminId?: string;
  onApprove?: (adminId: string, notes: string, signature: string) => void;
  onReject?: (adminId: string, reason: string) => void;
}

const DualApprovalModal: React.FC<DualApprovalModalProps> = ({
  isOpen,
  onClose,
  approvalRequest,
  currentAdminId,
  onApprove,
  onReject
}) => {
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [digitalSignature, setDigitalSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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

  const currentAdmin = approvalRequest.requiredAdmins.find(admin => admin.id === currentAdminId);
  const currentApproval = approvalRequest.currentApprovals.find(approval => approval.adminId === currentAdminId);
  const hasApproved = currentApproval?.approved;
  const hasRejected = currentApproval && !currentApproval.approved;
  const canApprove = currentAdmin && !hasApproved && !hasRejected;

  const approvedCount = approvalRequest.currentApprovals.filter(approval => approval.approved).length;
  const rejectedCount = approvalRequest.currentApprovals.filter(approval => !approval.approved).length;
  const isFullyApproved = approvedCount >= 2;
  const isRejected = rejectedCount > 0;

  const handleApprove = async () => {
    if (!currentAdminId || !onApprove) return;
    
    setIsSubmitting(true);
    try {
      await onApprove(currentAdminId, approvalNotes, digitalSignature);
      setApprovalNotes('');
      setDigitalSignature('');
    } catch (error) {
      console.error('Error al aprobar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!currentAdminId || !onReject) return;
    
    setIsSubmitting(true);
    try {
      await onReject(currentAdminId, rejectionReason);
      setRejectionReason('');
    } catch (error) {
      console.error('Error al rechazar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sistema de Aprobación Dual</h2>
              <p className="text-sm text-gray-600">Orden: {approvalRequest.orderId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información de la Orden */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de la Orden</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Paciente</p>
                <p className="font-medium">{approvalRequest.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="font-medium text-lg text-green-600">{formatCurrency(approvalRequest.totalAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de Creación</p>
                <p className="font-medium">{formatDate(approvalRequest.createdAt)}</p>
              </div>
              {approvalRequest.deadline && (
                <div>
                  <p className="text-sm text-gray-600">Fecha Límite</p>
                  <p className="font-medium">{formatDate(approvalRequest.deadline)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Estado de Aprobaciones */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Estado de Aprobaciones</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvalRequest.requiredAdmins.map((admin) => {
                  const approval = approvalRequest.currentApprovals.find(a => a.adminId === admin.id);
                  const isCurrentAdmin = admin.id === currentAdminId;
                  
                  return (
                    <div key={admin.id} className={`p-4 rounded-lg border ${
                      approval?.approved ? 'bg-green-50 border-green-200' :
                      approval && !approval.approved ? 'bg-red-50 border-red-200' :
                      isCurrentAdmin ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{admin.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          approval?.approved ? 'bg-green-100 text-green-800' :
                          approval && !approval.approved ? 'bg-red-100 text-red-800' :
                          isCurrentAdmin ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {approval?.approved ? 'Aprobado' :
                           approval && !approval.approved ? 'Rechazado' :
                           isCurrentAdmin ? 'Pendiente (Tú)' :
                           'Pendiente'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{admin.role}</p>
                      {approval?.timestamp && (
                        <p className="text-xs text-gray-500 mt-1">{formatDate(approval.timestamp)}</p>
                      )}
                      {approval?.notes && (
                        <p className="text-sm text-gray-700 mt-1">{approval.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Resumen del Estado */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado General:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isFullyApproved ? 'bg-green-100 text-green-800' :
                    isRejected ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isFullyApproved ? 'Aprobada' :
                     isRejected ? 'Rechazada' :
                     `${approvedCount}/2 Aprobaciones`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interfaz de Aprobación para el Administrador Actual */}
          {currentAdmin && canApprove && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Tu Aprobación</h3>
                <p className="text-sm text-gray-600">Administrador: {currentAdmin.name}</p>
              </div>
              <div className="p-4 space-y-4">
                {/* Notas de Aprobación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas de Aprobación (Opcional)
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Agrega comentarios sobre tu decisión..."
                  />
                </div>

                {/* Firma Digital */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Firma Digital
                  </label>
                  <input
                    type="text"
                    value={digitalSignature}
                    onChange={(e) => setDigitalSignature(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Escribe tu nombre completo como firma digital"
                  />
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting || !digitalSignature.trim()}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isSubmitting ? 'Aprobando...' : 'Aprobar Orden'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isSubmitting ? 'Rechazando...' : 'Rechazar Orden'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Interfaz de Rechazo */}
          {currentAdmin && canApprove && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Motivo de Rechazo</h3>
              </div>
              <div className="p-4">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Explica el motivo del rechazo..."
                />
              </div>
            </div>
          )}

          {/* Estado Final */}
          {(isFullyApproved || isRejected) && (
            <div className={`p-4 rounded-lg ${
              isFullyApproved ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                <svg className={`h-5 w-5 ${
                  isFullyApproved ? 'text-green-500' : 'text-red-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isFullyApproved ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <span className={`font-medium ${
                  isFullyApproved ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isFullyApproved ? 'Orden Aprobada' : 'Orden Rechazada'}
                </span>
              </div>
              <p className={`text-sm mt-1 ${
                isFullyApproved ? 'text-green-700' : 'text-red-700'
              }`}>
                {isFullyApproved 
                  ? 'La orden ha sido aprobada por ambos administradores y puede proceder.'
                  : 'La orden ha sido rechazada y no puede proceder.'
                }
              </p>
            </div>
          )}

          {/* Botón de Cerrar */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DualApprovalModal; 