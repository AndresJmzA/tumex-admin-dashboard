import { supabase } from '@/supabaseClient';

// Tipos para el dashboard operativo
export interface OperationalStats {
  totalOrders: number;
  pendingApproval: number;
  approvedOrders: number;
  rejectedOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  averageProcessingTime: number;
  ordersByStatus: Record<string, number>;
}

export interface PendingOrder {
  id: string;
  patientName: string;
  surgeryDate: string;
  surgeryTime: string;
  status: 'created' | 'templates_ready' | 'technicians_assigned' | 'in_preparation' | 'ready_for_technicians' | string;
  createdAt: string;
  doctorName: string;
  doctorPhone?: string;
  doctorEmail?: string;
  surgeryLocation: string;
  coverageType: string;
  insuranceName?: string;
  notes?: string;
  requiresApproval: boolean;
  hasOverlap: boolean;
  overlapDetails?: string;
  warnings: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTechnicians?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

export interface OrderStatusChange {
  orderId: string;
  newStatus: string;
  reason?: string;
  changedBy: string;
  timestamp: string;
}

export interface OperationalMetrics {
  approvalRate: number;
  averageResponseTime: number;
  ordersProcessedToday: number;
  pendingConfirmations: number;
  urgentOrders: number;
  ordersByHospital: Record<string, number>;
  ordersByDoctor: Record<string, number>;
}

class OperationalDashboardService {
  // Obtener estadísticas operativas
  async getOperationalStats(): Promise<OperationalStats> {
    try {
      console.log('🔍 Obteniendo estadísticas operativas...');
      
      const { data: orders, error } = await supabase
        .from('Orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo órdenes:', error);
        throw error;
      }

      console.log('✅ Órdenes obtenidas:', orders?.length || 0);

      const totalOrders = orders?.length || 0;
      const pendingApproval = orders?.filter(order => order.status === 'created').length || 0;
      const approvedOrders = orders?.filter(order => order.status === 'approved').length || 0;
      const rejectedOrders = orders?.filter(order => order.status === 'rejected').length || 0;
      const inProgressOrders = orders?.filter(order => 
        ['pending_objects', 'objects_confirmed', 'doctor_confirmation', 'doctor_approved'].includes(order.status)
      ).length || 0;
      const completedOrders = orders?.filter(order => order.status === 'closed').length || 0;

      // Calcular tiempo promedio de procesamiento (simulado)
      const averageProcessingTime = 2.5;

      // Agrupar órdenes por status
      const ordersByStatus: Record<string, number> = {};
      orders?.forEach(order => {
        ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
      });

      return {
        totalOrders,
        pendingApproval,
        approvedOrders,
        rejectedOrders,
        inProgressOrders,
        completedOrders,
        averageProcessingTime,
        ordersByStatus
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas operativas:', error);
      return {
        totalOrders: 0,
        pendingApproval: 0,
        approvedOrders: 0,
        rejectedOrders: 0,
        inProgressOrders: 0,
        completedOrders: 0,
        averageProcessingTime: 0,
        ordersByStatus: {}
      };
    }
  }

  // Obtener órdenes pendientes de aprobación
  async getPendingOrders(): Promise<PendingOrder[]> {
    try {
      console.log('🔍 Obteniendo órdenes pendientes...');
      
      const { data: orders, error } = await supabase
        .from('Orders')
        .select(`
          id,
          patient_name,
          surgery_date,
          surgery_time,
          status,
          created_at,
          surgery_location,
          coverage_type,
          insurance_name,
          notes
        `)
        .in('status', ['created', 'templates_ready', 'technicians_assigned'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error obteniendo órdenes pendientes:', error);
        throw error;
      }

      console.log('✅ Órdenes pendientes obtenidas:', orders?.length || 0);

      // Traer posibles órdenes del mismo día para evaluar traslapes en memoria
      const ordersByDoctorAndDay: Record<string, any[]> = {};
      (orders || []).forEach((o: any) => {
        const key = `${o.user_id || 'doctor'}_${o.surgery_date || ''}`;
        ordersByDoctorAndDay[key] = ordersByDoctorAndDay[key] || [];
        ordersByDoctorAndDay[key].push(o);
      });

      const pendingOrders = orders?.map(order => {
        // Verificaciones reales (mismo día, 4h de ventana)
        const warnings: string[] = [];
        let hasOverlap = false;
        let overlapDetails: string | undefined = undefined;

        if (order.surgery_date && order.surgery_time) {
          const start = new Date(`${order.surgery_date}T${order.surgery_time}`);
          const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
          const key = `${order.user_id || 'doctor'}_${order.surgery_date}`;
          const sameDay = ordersByDoctorAndDay[key] || [];
          for (const o of sameDay) {
            if (o.id === order.id) continue;
            const oStart = new Date(`${o.surgery_date}T${o.surgery_time || '00:00:00'}`);
            const oEnd = new Date(oStart.getTime() + 4 * 60 * 60 * 1000);
            if (start < oEnd && oStart < end) {
              hasOverlap = true;
              overlapDetails = `Traslape con cirugía programada a las ${String(o.surgery_time).substring(0,5)}`;
              break;
            }
          }
        }

        if (order.surgery_date) {
          const surgeryDate = new Date(order.surgery_date);
          if (!isNaN(surgeryDate.getTime())) {
            const now = new Date();
            if (surgeryDate.getTime() < now.getTime()) warnings.push('Fecha de cirugía en el pasado');
          }
        }

        return {
          id: order.id,
          patientName: order.patient_name || 'Sin nombre',
          surgeryDate: order.surgery_date,
          surgeryTime: order.surgery_time,
          status: order.status,
          createdAt: order.created_at,
          doctorName: 'Dr. García', // Simulado - en producción se obtendría de la relación
          doctorPhone: '555-0401',
          doctorEmail: 'dr.garcia@hospitalgeneral.com',
          surgeryLocation: order.surgery_location || 'Sin ubicación',
          coverageType: order.coverage_type || 'none',
          insuranceName: order.insurance_name,
          notes: order.notes,
          requiresApproval: order.status === 'created',
          hasOverlap,
          overlapDetails,
          warnings,
          priority: 'medium' as const, // Simulado - en producción se obtendría de la base de datos
          assignedTechnicians: order.status === 'technicians_assigned' ? [
            {
              id: '1',
              name: 'Juan Pérez',
              role: 'Técnico Principal'
            }
          ] : undefined
        };
      }) || [];

      console.log('🎯 Órdenes pendientes mapeadas:', pendingOrders);
      return pendingOrders;
    } catch (error) {
      console.error('❌ Error obteniendo órdenes pendientes:', error);
      return [];
    }
  }

  // Aprobar orden
  async approveOrder(orderId: string, reason?: string): Promise<boolean> {
    try {
      console.log('✅ Aprobando orden:', orderId);
      
      const { error } = await supabase
        .from('Orders')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('❌ Error aprobando orden:', error);
        throw error;
      }

      console.log('✅ Orden aprobada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error aprobando orden:', error);
      return false;
    }
  }

  // Rechazar orden
  async rejectOrder(orderId: string, reason: string): Promise<boolean> {
    try {
      console.log('❌ Rechazando orden:', orderId, 'Razón:', reason);
      
      const { error } = await supabase
        .from('Orders')
        .update({ 
          status: 'rejected',
          notes: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('❌ Error rechazando orden:', error);
        throw error;
      }

      console.log('✅ Orden rechazada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error rechazando orden:', error);
      return false;
    }
  }

  // Actualizar estado de orden a templates_ready
  async updateOrderToTemplatesReady(orderId: string): Promise<boolean> {
    try {
      console.log('🔄 Actualizando orden a templates_ready:', orderId);
      
      const { error } = await supabase
        .from('Orders')
        .update({ 
          status: 'templates_ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('❌ Error actualizando orden a templates_ready:', error);
        throw error;
      }

      console.log('✅ Orden actualizada a templates_ready exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error actualizando orden a templates_ready:', error);
      return false;
    }
  }

  // Obtener métricas operativas
  async getOperationalMetrics(): Promise<OperationalMetrics> {
    try {
      const { data: orders, error } = await supabase
        .from('Orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalOrders = orders?.length || 0;
      const approvedOrders = orders?.filter(order => order.status === 'approved').length || 0;
      const approvalRate = totalOrders > 0 ? (approvedOrders / totalOrders) * 100 : 0;
      
      // Calcular métricas adicionales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ordersProcessedToday = orders?.filter(order => {
        const orderDate = new Date(order.updated_at || order.created_at);
        return orderDate >= today && ['approved', 'rejected'].includes(order.status);
      }).length || 0;

      const pendingConfirmations = orders?.filter(order => 
        ['doctor_confirmation', 'objects_confirmed'].includes(order.status)
      ).length || 0;

      const urgentOrders = orders?.filter(order => {
        const surgeryDate = new Date(order.surgery_date);
        const daysUntilSurgery = (surgeryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilSurgery <= 3 && order.status === 'created';
      }).length || 0;

      // Agrupar por hospital y doctor (simulado)
      const ordersByHospital: Record<string, number> = {
        'Hospital General': Math.floor(totalOrders * 0.4),
        'Clínica Santa María': Math.floor(totalOrders * 0.3),
        'Centro Médico ABC': Math.floor(totalOrders * 0.2),
        'Hospital San José': Math.floor(totalOrders * 0.1)
      };

      const ordersByDoctor: Record<string, number> = {
        'Dr. García': Math.floor(totalOrders * 0.3),
        'Dr. Martínez': Math.floor(totalOrders * 0.25),
        'Dr. López': Math.floor(totalOrders * 0.2),
        'Dr. Fernández': Math.floor(totalOrders * 0.15),
        'Dr. Torres': Math.floor(totalOrders * 0.1)
      };

      return {
        approvalRate,
        averageResponseTime: 2.5, // Simulado
        ordersProcessedToday,
        pendingConfirmations,
        urgentOrders,
        ordersByHospital,
        ordersByDoctor
      };
    } catch (error) {
      console.error('Error obteniendo métricas operativas:', error);
      return {
        approvalRate: 0,
        averageResponseTime: 0,
        ordersProcessedToday: 0,
        pendingConfirmations: 0,
        urgentOrders: 0,
        ordersByHospital: {},
        ordersByDoctor: {}
      };
    }
  }

  // Obtener orden por ID
  async getOrderById(orderId: string): Promise<PendingOrder | null> {
    try {
      const { data: order, error } = await supabase
        .from('Orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;

      if (!order) return null;

      // Verificaciones reales
      const warnings: string[] = [];
      let hasOverlap = false;
      let overlapDetails: string | undefined = undefined;
      if (order.surgery_date && order.surgery_time && order.user_id) {
        const start = new Date(`${order.surgery_date}T${order.surgery_time}`);
        const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

        const { data: sameDay, error: overlapErr } = await supabase
          .from('Orders')
          .select('id, surgery_date, surgery_time')
          .eq('user_id', order.user_id)
          .eq('surgery_date', order.surgery_date);

        if (!overlapErr) {
          for (const o of sameDay || []) {
            if (o.id === order.id) continue;
            const oStart = new Date(`${o.surgery_date}T${o.surgery_time || '00:00:00'}`);
            const oEnd = new Date(oStart.getTime() + 4 * 60 * 60 * 1000);
            if (start < oEnd && oStart < end) {
              hasOverlap = true;
              overlapDetails = `Traslape con cirugía programada a las ${String(o.surgery_time).substring(0,5)}`;
              break;
            }
          }
        }
      }

      if (order.surgery_date) {
        const surgeryDate = new Date(order.surgery_date);
        if (!isNaN(surgeryDate.getTime())) {
          const now = new Date();
          if (surgeryDate.getTime() < now.getTime()) warnings.push('Fecha de cirugía en el pasado');
        }
      }

      return {
        id: order.id,
        patientName: order.patient_name || 'Sin nombre',
        surgeryDate: order.surgery_date,
        surgeryTime: order.surgery_time,
        status: order.status,
        createdAt: order.created_at,
        doctorName: 'Dr. García',
        doctorPhone: '555-0401',
        doctorEmail: 'dr.garcia@hospitalgeneral.com',
        surgeryLocation: order.surgery_location || 'Sin ubicación',
        coverageType: order.coverage_type || 'none',
        insuranceName: order.insurance_name,
        notes: order.notes,
        requiresApproval: order.status === 'created',
        hasOverlap,
        overlapDetails,
        warnings,
        priority: 'medium' as const
      };
    } catch (error) {
      console.error('Error obteniendo orden por ID:', error);
      return null;
    }
  }
}

export const operationalDashboardService = new OperationalDashboardService(); 