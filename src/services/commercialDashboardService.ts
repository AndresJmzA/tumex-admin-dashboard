import { supabase } from '@/supabaseClient';

// Tipos para el dashboard comercial
export interface CommercialStats {
  totalOrders: number;
  pendingConfirmation: number;
  confirmedOrders: number;
  monthlyRevenue: number;
  monthlyGrowth: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface RecentOrder {
  id: string;
  patientName: string;
  surgeryDate: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  totalAmount: number;
  createdAt: string;
  requiresConfirmation: boolean;
  doctorName?: string;
  procedureName?: string;
  surgeryType?: string;
}

export interface Notification {
  id: string;
  type: 'confirmation_pending' | 'order_confirmed' | 'order_rejected' | 'payment_received';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
}

export interface CallHistory {
  id: string;
  orderId: string;
  doctorName: string;
  hospital: string;
  callDate: string;
  callTime: string;
  duration: string;
  status: 'answered' | 'no_answer' | 'busy' | 'voicemail' | 'scheduled';
  notes: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface ConfirmationMetrics {
  totalCalls: number;
  answeredCalls: number;
  confirmationRate: number;
  averageResponseTime: number;
  pendingConfirmations: number;
  confirmedToday: number;
  rejectedToday: number;
  callsByDoctor: Record<string, number>;
  callsByHospital: Record<string, number>;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  phone: string;
  email: string;
  preferredContact: 'phone' | 'email' | 'whatsapp';
  lastContact: string;
  responseRate: number;
}

class CommercialDashboardService {
  // Obtener estadísticas comerciales
  async getCommercialStats(): Promise<CommercialStats> {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Obtener órdenes del mes actual
      const { data: currentMonthOrders, error: currentError } = await supabase
        .from('Orders')
        .select('*')
        .gte('created_at', firstDayOfMonth.toISOString())
        .lte('created_at', lastDayOfMonth.toISOString());

      if (currentError) throw currentError;

      // Obtener órdenes del mes anterior para calcular crecimiento
      const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      
      const { data: lastMonthOrders, error: lastError } = await supabase
        .from('Orders')
        .select('*')
        .gte('created_at', firstDayOfLastMonth.toISOString())
        .lte('created_at', lastDayOfLastMonth.toISOString());

      if (lastError) throw lastError;

      // Calcular estadísticas
      const totalOrders = currentMonthOrders?.length || 0;
      const pendingConfirmation = currentMonthOrders?.filter(order => order.status === 'pending').length || 0;
      const confirmedOrders = currentMonthOrders?.filter(order => order.status === 'confirmed').length || 0;
      
      // Calcular ingresos mensuales (simulado - en producción se calcularía desde la tabla de pagos)
      const monthlyRevenue = totalOrders * 2659.57; // Valor promedio simulado
      
      // Calcular crecimiento mensual
      const lastMonthTotal = lastMonthOrders?.length || 0;
      const monthlyGrowth = lastMonthTotal > 0 
        ? ((totalOrders - lastMonthTotal) / lastMonthTotal) * 100 
        : 0;
      
      // Calcular tasa de conversión
      const conversionRate = totalOrders > 0 ? (confirmedOrders / totalOrders) * 100 : 0;
      
      // Calcular valor promedio por orden
      const averageOrderValue = totalOrders > 0 ? monthlyRevenue / totalOrders : 0;

      return {
        totalOrders,
        pendingConfirmation,
        confirmedOrders,
        monthlyRevenue,
        monthlyGrowth,
        conversionRate,
        averageOrderValue
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas comerciales:', error);
      // Retornar datos por defecto en caso de error
      return {
        totalOrders: 0,
        pendingConfirmation: 0,
        confirmedOrders: 0,
        monthlyRevenue: 0,
        monthlyGrowth: 0,
        conversionRate: 0,
        averageOrderValue: 0
      };
    }
  }

  // Obtener las últimas 3 órdenes recientes en orden cronológico (más reciente primero)
  async getRecentOrders(): Promise<RecentOrder[]> {
    try {
      const { data: orders, error } = await supabase
        .from('Orders')
        .select(`
          id,
          patient_name,
          surgery_date,
          status,
          created_at,
          Users!Orders_user_id_fkey ( id, display_name, last_name ),
          Procedures!Orders_procedure_id_fkey ( name, SurgeryTypes!Procedures_surgery_type_id_fkey ( name ) )
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      const mapToCommercialStatus = (status: string): RecentOrder['status'] => {
        const s = (status || '').toLowerCase();
        if (['approved', 'doctor_approved', 'templates_ready', 'technicians_assigned'].includes(s)) return 'confirmed';
        if (['closed', 'completed', 'surgery_completed'].includes(s)) return 'completed';
        if (['rejected', 'doctor_rejected', 'cancelled'].includes(s)) return 'rejected';
        return 'pending';
      };

      return orders?.map((order: any) => ({
        id: order.id,
        patientName: order.patient_name || 'Sin nombre',
        surgeryDate: order.surgery_date,
        status: mapToCommercialStatus(order.status),
        totalAmount: 0,
        createdAt: order.created_at,
        requiresConfirmation: false,
        doctorName: order.Users ? `${order.Users.display_name || ''} ${order.Users.last_name || ''}`.trim() : undefined,
        procedureName: order.Procedures?.name,
        surgeryType: order.Procedures?.SurgeryTypes?.name
      })) || [];
    } catch (error) {
      console.error('Error obteniendo órdenes recientes:', error);
      return [];
    }
  }

  // Obtener notificaciones comerciales
  async getNotifications(): Promise<Notification[]> {
    try {
      const { data: notifications, error } = await supabase
        .from('Notifications')
        .select('*')
        .eq('type', 'commercial')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return notifications?.map(notification => ({
        id: notification.id,
        type: notification.notification_type || 'confirmation_pending',
        title: notification.title,
        message: notification.message,
        timestamp: notification.created_at,
        read: notification.read || false,
        orderId: notification.order_id
      })) || [];
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      return [];
    }
  }

  // Obtener historial de llamadas
  async getCallHistory(): Promise<CallHistory[]> {
    try {
      // Nota: Esta tabla puede no existir, por lo que usamos datos simulados
      // En producción, se crearía la tabla CallHistory en Supabase
      const { data: callHistory, error } = await supabase
        .from('CallHistory')
        .select('*')
        .order('call_date', { ascending: false })
        .limit(20);

      if (error) {
        // Si la tabla no existe, retornar datos simulados
        console.warn('Tabla CallHistory no encontrada, usando datos simulados');
        return this.getMockCallHistory();
      }

      return callHistory?.map(call => ({
        id: call.id,
        orderId: call.order_id,
        doctorName: call.doctor_name,
        hospital: call.hospital,
        callDate: call.call_date,
        callTime: call.call_time,
        duration: call.duration,
        status: call.status,
        notes: call.notes,
        followUpRequired: call.follow_up_required,
        followUpDate: call.follow_up_date
      })) || [];
    } catch (error) {
      console.error('Error obteniendo historial de llamadas:', error);
      return this.getMockCallHistory();
    }
  }

  // Obtener métricas de confirmación
  async getConfirmationMetrics(): Promise<ConfirmationMetrics> {
    try {
      const callHistory = await this.getCallHistory();
      
      const totalCalls = callHistory.length;
      const answeredCalls = callHistory.filter(call => call.status === 'answered').length;
      const confirmationRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;
      
      // Calcular tiempo promedio de respuesta (simulado)
      const averageResponseTime = 2.5;
      
      // Obtener órdenes pendientes de confirmación
      const { data: pendingOrders, error } = await supabase
        .from('Orders')
        .select('*')
        .eq('status', 'pending')
        .eq('requires_confirmation', true);

      if (error) throw error;

      const pendingConfirmations = pendingOrders?.length || 0;
      
      // Calcular confirmaciones y rechazos de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: todayOrders, error: todayError } = await supabase
        .from('Orders')
        .select('*')
        .gte('updated_at', today.toISOString())
        .lt('updated_at', tomorrow.toISOString());

      if (todayError) throw todayError;

      const confirmedToday = todayOrders?.filter(order => order.status === 'confirmed').length || 0;
      const rejectedToday = todayOrders?.filter(order => order.status === 'rejected').length || 0;

      // Calcular llamadas por doctor y hospital
      const callsByDoctor: Record<string, number> = {};
      const callsByHospital: Record<string, number> = {};

      callHistory.forEach(call => {
        callsByDoctor[call.doctorName] = (callsByDoctor[call.doctorName] || 0) + 1;
        callsByHospital[call.hospital] = (callsByHospital[call.hospital] || 0) + 1;
      });

      return {
        totalCalls,
        answeredCalls,
        confirmationRate,
        averageResponseTime,
        pendingConfirmations,
        confirmedToday,
        rejectedToday,
        callsByDoctor,
        callsByHospital
      };
    } catch (error) {
      console.error('Error obteniendo métricas de confirmación:', error);
      return {
        totalCalls: 0,
        answeredCalls: 0,
        confirmationRate: 0,
        averageResponseTime: 0,
        pendingConfirmations: 0,
        confirmedToday: 0,
        rejectedToday: 0,
        callsByDoctor: {},
        callsByHospital: {}
      };
    }
  }

  // Obtener lista de doctores
  async getDoctors(): Promise<Doctor[]> {
    try {
      const { data: users, error } = await supabase
        .from('Users')
        .select('*')
        .eq('role', 'Médico')
        .order('display_name');

      if (error) throw error;

      return users?.map(user => ({
        id: user.id,
        name: `${user.display_name} ${user.last_name}`,
        specialty: 'Cirugía General', // Campo simulado
        hospital: 'Hospital General', // Campo simulado
        phone: user.phone_number || '',
        email: user.email,
        preferredContact: 'phone' as const, // Campo simulado
        lastContact: user.updated_at || user.created_at,
        responseRate: 85 // Campo simulado
      })) || [];
    } catch (error) {
      console.error('Error obteniendo doctores:', error);
      return [];
    }
  }

  // Datos simulados para historial de llamadas (fallback)
  private getMockCallHistory(): CallHistory[] {
    return [
      {
        id: '1',
        orderId: 'ORD-2024-001',
        doctorName: 'Dr. García',
        hospital: 'Hospital General',
        callDate: '2024-01-14',
        callTime: '10:30',
        duration: '5:23',
        status: 'answered',
        notes: 'Confirmó equipos necesarios. Paciente diabético.',
        followUpRequired: false
      },
      {
        id: '2',
        orderId: 'ORD-2024-002',
        doctorName: 'Dr. Martínez',
        hospital: 'Clínica Santa María',
        callDate: '2024-01-14',
        callTime: '14:15',
        duration: '3:45',
        status: 'answered',
        notes: 'Aprobó lista de equipos. Requiere anestesia local.',
        followUpRequired: false
      },
      {
        id: '3',
        orderId: 'ORD-2024-003',
        doctorName: 'Dr. López',
        hospital: 'Centro Médico ABC',
        callDate: '2024-01-14',
        callTime: '16:20',
        duration: '0:00',
        status: 'no_answer',
        notes: 'No contestó. Dejar mensaje.',
        followUpRequired: true,
        followUpDate: '2024-01-15'
      }
    ];
  }
}

export const commercialDashboardService = new CommercialDashboardService(); 