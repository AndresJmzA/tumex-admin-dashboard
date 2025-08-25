import { supabase } from '@/supabaseClient';
import { CreateOrderRejectionData, OrderRejection } from '@/types/orderRejection';

export const orderRejectionService = {
  /**
   * Rechazar una orden
   */
  async rejectOrder(rejectionData: CreateOrderRejectionData): Promise<OrderRejection> {
    try {
      // 1. Crear registro en Order_Rejections
      const { data: rejectionRecord, error: rejectionError } = await supabase
        .from('Order_Rejections')
        .insert([rejectionData])
        .select()
        .single();

      if (rejectionError) {
        console.error('Error creando registro de rechazo:', rejectionError);
        throw new Error('No se pudo crear el registro de rechazo');
      }

      // 2. Crear registro en OrderStatusHistory
      const statusHistoryData = {
        order_id: rejectionData.order_id,
        from_status: 'pending', // Estado anterior (asumiendo que viene de 'pending')
        to_status: rejectionData.status === 'Rescheduled' ? 'rescheduled' : 'rejected',
        changed_by: rejectionData.rejected_by,
        notes: rejectionData.notes || `Orden rechazada: ${rejectionData.rejection_reason}`,
        metadata: {
          rejection_reason: rejectionData.rejection_reason,
          custom_reason: rejectionData.custom_reason,
          reschedule_date: rejectionData.reschedule_date
        }
      };

      const { error: historyError } = await supabase
        .from('OrderStatusHistory')
        .insert([statusHistoryData]);

      if (historyError) {
        console.error('Error creando historial de estado:', historyError);
        // No lanzar error aquí, solo log
      }

      // 3. Actualizar estado de la orden
      const orderUpdateData: any = {
        status: rejectionData.status === 'Rescheduled' ? 'rescheduled' : 'rejected',
        updated_at: new Date().toISOString()
      };

      // Si se reagenda, actualizar la fecha
      if (rejectionData.reschedule_date) {
        orderUpdateData.surgery_date = rejectionData.reschedule_date;
      }

      const { error: orderUpdateError } = await supabase
        .from('Orders')
        .update(orderUpdateData)
        .eq('id', rejectionData.order_id);

      if (orderUpdateError) {
        console.error('Error actualizando estado de orden:', orderUpdateError);
        throw new Error('No se pudo actualizar el estado de la orden');
      }

      return rejectionRecord;
    } catch (error) {
      console.error('Error en rejectOrder:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de rechazos de una orden
   */
  async getOrderRejections(orderId: string): Promise<OrderRejection[]> {
    try {
      const { data, error } = await supabase
        .from('Order_Rejections')
        .select('*')
        .eq('order_id', orderId)
        .order('rejected_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo rechazos de orden:', error);
        throw new Error('No se pudieron obtener los rechazos de la orden');
      }

      return data || [];
    } catch (error) {
      console.error('Error en getOrderRejections:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de rechazos
   */
  async getRejectionStats(filters?: {
    startDate?: string;
    endDate?: string;
    reason?: string;
  }) {
    try {
      let query = supabase
        .from('Order_Rejections')
        .select('*');

      if (filters?.startDate) {
        query = query.gte('rejected_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('rejected_at', filters.endDate);
      }

      if (filters?.reason) {
        query = query.eq('rejection_reason', filters.reason);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error obteniendo estadísticas de rechazos:', error);
        throw new Error('No se pudieron obtener las estadísticas de rechazos');
      }

      // Procesar estadísticas
      const stats = {
        total: data?.length || 0,
        byReason: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        rescheduledCount: 0
      };

      data?.forEach(rejection => {
        // Contar por motivo
        stats.byReason[rejection.rejection_reason] = (stats.byReason[rejection.rejection_reason] || 0) + 1;
        
        // Contar por estado
        stats.byStatus[rejection.status] = (stats.byStatus[rejection.status] || 0) + 1;
        
        // Contar reagendos
        if (rejection.status === 'Rescheduled') {
          stats.rescheduledCount++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error en getRejectionStats:', error);
      throw error;
    }
  },

  /**
   * Verificar si una orden puede ser rechazada
   */
  async canRejectOrder(orderId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('Orders')
        .select('status')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error verificando si se puede rechazar la orden:', error);
        return false;
      }

      // Solo se pueden rechazar órdenes en estado 'pending' o 'confirmed'
      const allowedStatuses = ['pending', 'confirmed'];
      return allowedStatuses.includes(data.status);
    } catch (error) {
      console.error('Error en canRejectOrder:', error);
      return false;
    }
  }
};
