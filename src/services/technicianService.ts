import { supabase } from '@/supabaseClient';

export interface TechnicianSummary {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAvailableNow: boolean;
  currentOrderId?: string | null;
  currentSince?: string | null;
}

export interface GetTechniciansParams {
  search?: string;
  onlyAvailable?: boolean;
  limit?: number;
}

export const technicianService = {
  async getTechnicians(params: GetTechniciansParams = {}): Promise<TechnicianSummary[]> {
    const { search = '', onlyAvailable = false, limit = 100 } = params;

    // 1) Obtener técnicos (Users)
    let usersQuery = supabase
      .from('Users')
      .select('id, display_name, last_name, email, phone_number, role')
      .eq('role', 'Técnico')
      .order('display_name', { ascending: true })
      .limit(limit);

    if (search) {
      usersQuery = usersQuery.or(
        `display_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data: users, error: usersError } = await usersQuery;
    if (usersError) {
      console.error('Error fetching technicians (Users):', usersError);
      return [];
    }

    const technicianIds = (users || []).map((u: any) => u.id);
    if (technicianIds.length === 0) return [];

    // 2) Estado actual (vista Technician_Current_Status)
    const { data: statuses, error: statusError } = await supabase
      .from('Technician_Current_Status')
      .select('*')
      .in('technician_id', technicianIds);

    if (statusError) {
      console.error('Error fetching Technician_Current_Status:', statusError);
      return [];
    }

    const idToStatus = new Map<string, any>();
    (statuses || []).forEach((s: any) => idToStatus.set(s.technician_id, s));

    // 3) Armar respuesta
    let results: TechnicianSummary[] = (users || []).map((u: any) => {
      const st = idToStatus.get(u.id);
      const name = `${u.display_name || ''} ${u.last_name || ''}`.trim() || 'Sin nombre';
      return {
        id: u.id,
        name,
        email: u.email || '',
        phone: u.phone_number || '',
        isAvailableNow: st ? Boolean(st.is_available_now) : true,
        currentOrderId: st?.current_order_id ?? null,
        currentSince: st?.current_since ?? null,
      };
    });

    if (onlyAvailable) {
      results = results.filter(t => t.isAvailableNow);
    }

    return results;
  },

  async getTechnicianCurrentOrder(technicianId: string): Promise<any | null> {
    // Primero obtener la orden actual desde la vista
    const { data: st, error: stError } = await supabase
      .from('Technician_Current_Status')
      .select('*')
      .eq('technician_id', technicianId)
      .maybeSingle();

    if (stError) {
      console.error('Error fetching current status for technician:', stError);
      return null;
    }

    const currentOrderId = st?.current_order_id;
    if (!currentOrderId) return null;

    // Cargar detalles mínimos de la orden
    const { data: order, error } = await supabase
      .from('Orders')
      .select(`
        id,
        patient_name,
        surgery_date,
        surgery_time,
        surgery_at,
        procedure_id,
        user_id,
        Procedures:Procedures!Orders_procedure_id_fkey(id, name),
        Users:Users!Orders_user_id_fkey(id, display_name, last_name)
      `)
      .eq('id', currentOrderId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching current order for technician:', error);
      return null;
    }

    return order;
  },

  async checkConflict(technicianId: string, surgeryAt: string, windowMinutes: number = 120): Promise<boolean> {
    if (!surgeryAt) return false;
    const { data, error } = await supabase.rpc('check_technician_conflict', {
      p_technician_id: technicianId,
      p_at: surgeryAt,
      p_window_minutes: windowMinutes,
    });
    if (error) {
      console.error('Error checking technician conflict:', error);
      return false;
    }
    return Boolean(data);
  },

  async getOrderSurgeryAt(orderId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('Orders')
      .select('surgery_date, surgery_time')
      .eq('id', orderId)
      .maybeSingle();
    if (error) {
      console.error('Error fetching surgery date/time:', error);
      return null;
    }
    
    // Combinar surgery_date y surgery_time en formato ISO
    if (data?.surgery_date && data?.surgery_time) {
      try {
        const combinedDateTime = `${data.surgery_date}T${data.surgery_time}`;
        // Validar que sea una fecha válida
        const date = new Date(combinedDateTime);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date/time combination:', combinedDateTime);
          return null;
        }
        return combinedDateTime;
      } catch (error) {
        console.error('Error combining date/time:', error);
        return null;
      }
    }
    
    console.warn('Order missing surgery_date or surgery_time:', data);
    return null;
  },

  async assignTechnicians(orderId: string, selections: Array<{ technicianId: string; role: 'principal' | 'asistente' }>, surgeryAt?: string | null): Promise<{ success: boolean; count: number }> {
    try {
      const finalSurgeryAt = surgeryAt ?? (await this.getOrderSurgeryAt(orderId));
      if (!finalSurgeryAt) {
        throw new Error('Fecha y hora de cirugía no disponible para la orden');
      }

      if (!selections || selections.length === 0) {
        return { success: true, count: 0 };
      }

      const rows = selections.map((s) => ({
        order_id: orderId,
        technician_id: s.technicianId,
        role: s.role,
        status: 'assigned',
        scheduled_at: finalSurgeryAt,
        started_at: null,
        finished_at: null,
      }));

      const { data, error } = await supabase
        .from('Technician_Assignments')
        .upsert(rows, { onConflict: 'order_id,technician_id' })
        .select('*');

      if (error) throw error;
      return { success: true, count: data?.length || 0 };
    } catch (e) {
      console.error('Error assigning technicians:', e);
      return { success: false, count: 0 };
    }
  },

  // Obtener asignaciones del técnico con datos de la orden
  async getTechnicianAssignments(technicianId: string): Promise<Array<{
    assignmentId: string;
    assignmentStatus: string;
    role: string;
    scheduledAt: string | null;
    order: {
      id: string;
      patient_name: string;
      surgery_date: string;
      surgery_time: string;
      surgery_location: string | null;
      status: string;
      created_at: string;
      assigned_technicians?: Array<{ id: string; name: string; role: string }>;
    };
  }>> {
    // Intento 1: JOIN directo para evitar problemas con in()
    const { data, error } = await supabase
      .from('Technician_Assignments')
      .select(`
        id,
        status,
        role,
        scheduled_at,
        Orders:order_id (
          id,
          patient_name,
          surgery_date,
          surgery_time,
          surgery_location,
          status,
          created_at,
          insurance_name,
          Users:Users!Orders_user_id_fkey (
            id,
            display_name,
            last_name,
            phone_number
          )
        )
      `)
      .eq('technician_id', technicianId)
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching technician assignments (join):', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      assignmentId: row.id,
      assignmentStatus: row.status,
      role: row.role,
      scheduledAt: row.scheduled_at,
      order: row.Orders,
    })).filter(item => Boolean(item.order));
  },

  // Transicionar estado de una asignación del técnico
  async transitionAssignment(
    assignmentId: string,
    newStatus: 'assigned' | 'in_transit' | 'on_site' | 'completed' | 'cancelled'
  ): Promise<boolean> {
    try {
      const update: Record<string, any> = { status: newStatus };
      const now = new Date().toISOString();
      if (newStatus === 'in_transit') {
        update.started_at = now;
      }
      if (newStatus === 'completed') { 
        update.finished_at = now;
      }

      const { error } = await supabase
        .from('Technician_Assignments')
        .update(update)
        .eq('id', assignmentId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error transitioning assignment status:', e);
      return false;
    }
  },
};


