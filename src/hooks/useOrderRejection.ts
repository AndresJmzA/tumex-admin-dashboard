import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { orderRejectionService } from '@/services/orderRejectionService';
import { OrderRejectionFormData, CreateOrderRejectionData } from '@/types/orderRejection';

export const useOrderRejection = () => {
  const { user } = useAuth();
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Rechazar una orden
   */
  const rejectOrder = useCallback(async (
    orderId: string, 
    formData: OrderRejectionFormData
  ): Promise<void> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    setIsRejecting(true);
    setError(null);

    try {
      // Preparar datos para el servicio
      const rejectionData: CreateOrderRejectionData = {
        order_id: orderId,
        rejection_reason: formData.rejection_reason,
        custom_reason: formData.rejection_reason === 'Otro' ? formData.custom_reason : undefined,
        notes: formData.notes.trim() || undefined,
        reschedule_date: formData.should_reschedule ? formData.reschedule_date : undefined,
        rejected_by: user.id,
        status: formData.should_reschedule ? 'Rescheduled' : 'Rejected'
      };

      // Llamar al servicio
      await orderRejectionService.rejectOrder(rejectionData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al rechazar la orden';
      setError(errorMessage);
      throw err;
    } finally {
      setIsRejecting(false);
    }
  }, [user]);

  /**
   * Verificar si una orden puede ser rechazada
   */
  const canRejectOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      return await orderRejectionService.canRejectOrder(orderId);
    } catch (err) {
      console.error('Error verificando si se puede rechazar la orden:', err);
      return false;
    }
  }, []);

  /**
   * Obtener historial de rechazos de una orden
   */
  const getOrderRejections = useCallback(async (orderId: string) => {
    try {
      return await orderRejectionService.getOrderRejections(orderId);
    } catch (err) {
      console.error('Error obteniendo historial de rechazos:', err);
      return [];
    }
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    rejectOrder,
    canRejectOrder,
    getOrderRejections,
    isRejecting,
    error,
    clearError
  };
};
