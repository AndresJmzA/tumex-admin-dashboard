import { supabase } from '@/supabaseClient';

// Tipos para las órdenes
export interface Order {
  id: string;
  user_id: string;
  procedure_id: string;
  status: 'created' | 'pending_objects' | 'objects_confirmed' | 'doctor_confirmation' | 'approved' | 'rejected' | 'doctor_approved' | 'doctor_rejected' | 'in_preparation' | 'ready_for_technicians' | 'assigned' | 'in_transit' | 'in_process' | 'back' | 'closed' | 'cancelled' | 'templates_ready' | 'technicians_assigned';
  patient_name: string;
  surgery_date: string;
  surgery_time: string;
  surgery_location: string;
  coverage_type?: 'Privado' | 'Seguro' | 'none';
  insurance_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  assigned_technicians?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

// Tipo para productos de orden
export interface OrderProduct {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price?: number;
}

// Tipo extendido para compatibilidad con la interfaz existente
export interface ExtendedOrder extends Order {
  orderId: string;
  patientId?: string;
  typeOfCoverage: 'Privado' | 'Seguro' | 'none';
  itemsCount: number;
  requiresApproval?: boolean;
  totalAmount?: number;
  doctorInfo?: {
    doctorId: string;
    doctorName: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  };
  procedureInfo?: {
    procedureId: string;
    procedureName: string;
    surgeryType: string;
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
}

export interface OrderFilters {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  coverageType?: 'Privado' | 'Seguro' | 'none';
  doctorId?: string;
  page?: number;
  limit?: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingApproval: number;
  approved: number;
  completed: number;
  cancelled: number;
  byStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

export interface PaginatedOrdersResponse {
  data: ExtendedOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Sistema de caché para optimizar consultas
class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

class OrderService {
  private cache = new CacheManager();

  // Obtener todas las órdenes con información relacionada (OPTIMIZADO)
  async getOrders(filters?: OrderFilters): Promise<PaginatedOrdersResponse> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const offset = (page - 1) * limit;

      // Crear clave de caché basada en filtros
      const cacheKey = `orders_${JSON.stringify(filters)}_${page}_${limit}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Consulta optimizada con JOIN para evitar N+1
      let query = supabase
        .from('Orders')
        .select(`
          *,
          Users!Orders_user_id_fkey (
            id,
            display_name,
            last_name,
            email,
            phone_number,
            role
          ),
          Procedures!Orders_procedure_id_fkey (
            id,
            name,
            SurgeryTypes!Procedures_surgery_type_id_fkey (
              id,
              name
            )
          ),
          Order_Products (
            quantity,
            Products (
              id,
              name,
              category,
              price
            )
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Aplicar filtros
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`patient_name.ilike.%${filters.search}%,id.ilike.%${filters.search}%`);
      }

      if (filters?.dateFrom) {
        query = query.gte('surgery_date', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('surgery_date', filters.dateTo);
      }

      if (filters?.coverageType && filters.coverageType !== 'none') {
        query = query.eq('coverage_type', filters.coverageType);
      }

      if (filters?.doctorId) {
        query = query.eq('user_id', filters.doctorId);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      // Transformar datos para compatibilidad con la interfaz existente
      const extendedOrders: ExtendedOrder[] = data?.map(order => {
        const products = order.Order_Products?.map(op => ({
          id: op.Products?.id || 'unknown',
          name: op.Products?.name || 'Producto desconocido',
          category: op.Products?.category || 'Sin categoría',
          quantity: op.quantity || 0,
          price: op.Products?.price || 0
        })) || [];

        const totalAmount = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

        return {
          ...order,
          orderId: order.id,
          patientId: `PAT${order.id}`,
          typeOfCoverage: order.coverage_type || 'none',
          itemsCount: products.length,
          requiresApproval: order.status === 'created' || order.status === 'pending_objects',
          totalAmount,
          doctorInfo: order.Users ? {
            doctorId: order.Users.id,
            doctorName: `${order.Users.display_name} ${order.Users.last_name}`,
            contactPerson: `${order.Users.display_name} ${order.Users.last_name}`,
            phone: order.Users.phone_number,
            email: order.Users.email
          } : undefined,
          procedureInfo: order.Procedures ? {
            procedureId: order.Procedures.id,
            procedureName: order.Procedures.name,
            surgeryType: order.Procedures.SurgeryTypes?.name || 'Sin tipo'
          } : undefined,
          products,
          statusHistory: [
            {
              status: order.status,
              timestamp: order.created_at,
              changedBy: 'Sistema',
              notes: 'Orden creada'
            }
          ],
          approvals: []
        };
      }) || [];

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const result: PaginatedOrdersResponse = {
        data: extendedOrders,
        total,
        page,
        limit,
        totalPages
      };

      // Guardar en caché por 2 minutos
      this.cache.set(cacheKey, result, 2 * 60 * 1000);

      return result;
    } catch (error) {
      console.error('Error in getOrders:', error);
      throw error;
    }
  }

  // Obtener una orden por ID con información completa (OPTIMIZADO)
  async getOrderById(id: string): Promise<ExtendedOrder | null> {
    try {
      const cacheKey = `order_${id}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('Orders')
        .select(`
          *,
          Users!Orders_user_id_fkey (
            id,
            display_name,
            last_name,
            email,
            phone_number,
            role
          ),
          Procedures!Orders_procedure_id_fkey (
            id,
            name,
            SurgeryTypes!Procedures_surgery_type_id_fkey (
              id,
              name
            )
          ),
          Order_Products (
            quantity,
            Products (
              id,
              name,
              category,
              price
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        throw error;
      }

      if (!data) return null;

      const products = data.Order_Products?.map(op => ({
        id: op.Products?.id || 'unknown',
        name: op.Products?.name || 'Producto desconocido',
        category: op.Products?.category || 'Sin categoría',
        quantity: op.quantity || 0,
        price: op.Products?.price || 0
      })) || [];

      const totalAmount = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

      const result = {
        ...data,
        orderId: data.id,
        patientId: `PAT${data.id}`,
        typeOfCoverage: data.coverage_type || 'none',
        itemsCount: products.length,
        requiresApproval: data.status === 'created' || data.status === 'pending_objects',
        totalAmount,
        doctorInfo: data.Users ? {
          doctorId: data.Users.id,
          doctorName: `${data.Users.display_name} ${data.Users.last_name}`,
          contactPerson: `${data.Users.display_name} ${data.Users.last_name}`,
          phone: data.Users.phone_number,
          email: data.Users.email
        } : undefined,
        procedureInfo: data.Procedures ? {
          procedureId: data.Procedures.id,
          procedureName: data.Procedures.name,
          surgeryType: data.Procedures.SurgeryTypes?.name || 'Sin tipo'
        } : undefined,
        products,
        statusHistory: [
          {
            status: data.status,
            timestamp: data.created_at,
            changedBy: 'Sistema',
            notes: 'Orden creada'
          }
        ],
        approvals: []
      };

      // Guardar en caché por 5 minutos
      this.cache.set(cacheKey, result, 5 * 60 * 1000);

      return result;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw error;
    }
  }

  // Crear una nueva orden
  async createOrder(orderData: {
    user_id: string;
    procedure_id: string;
    patient_name: string;
    surgery_date: string;
    surgery_time: string;
    surgery_location: string;
    coverage_type?: 'Privado' | 'Seguro' | 'none';
    insurance_name?: string;
    notes?: string;
  }): Promise<ExtendedOrder> {
    try {
      // Generar un ID único para la orden con mejor aleatoriedad
      const timestamp = Date.now();
      const randomPart = Math.random().toString(36).substr(2, 12); // Más caracteres aleatorios
      const orderId = `order_${timestamp}_${randomPart}`;
      
      console.log('🔄 Creando orden con ID:', orderId);
      
      const { data, error } = await supabase
        .from('Orders')
        .insert({
          id: orderId,
          user_id: orderData.user_id,
          procedure_id: orderData.procedure_id,
          status: 'created',
          patient_name: orderData.patient_name,
          surgery_date: orderData.surgery_date,
          surgery_time: orderData.surgery_time,
          surgery_location: orderData.surgery_location,
          coverage_type: orderData.coverage_type || 'none',
          insurance_name: orderData.insurance_name,
          notes: orderData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating order:', error);
        
        // Manejo específico de errores 409
        if (error.code === '23505') { // Código PostgreSQL para unique_violation
          console.error('🔄 ID duplicado detectado, intentando con nuevo ID...');
          // Reintentar con un nuevo ID
          return this.createOrder(orderData);
        }
        
        // Otros errores de constraint
        if (error.code === '23503') { // foreign_key_violation
          throw new Error(`Error de referencia: ${error.message}`);
        }
        
        // Error de validación
        if (error.code === '23514') { // check_violation
          throw new Error(`Error de validación: ${error.message}`);
        }
        
        throw error;
      }

      console.log('✅ Orden creada exitosamente:', data.id);

      // Invalidar caché relacionado
      this.cache.invalidate('orders');
      this.cache.invalidate('stats');

      return await this.getOrderById(data.id) as ExtendedOrder;
    } catch (error) {
      console.error('❌ Error in createOrder:', error);
      throw error;
    }
  }

  // Actualizar el estado de una orden
  async updateOrderStatus(id: string, status: Order['status'], notes?: string): Promise<ExtendedOrder> {
    try {
      const { data, error } = await supabase
        .from('Orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      // Invalidar caché relacionado
      this.cache.invalidate('orders');
      this.cache.invalidate(`order_${id}`);
      this.cache.invalidate('stats');

      return await this.getOrderById(id) as ExtendedOrder;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  }

  // Agregar productos a una orden
  async addProductsToOrder(orderId: string, products: Array<{ product_id: string; quantity: number }>): Promise<void> {
    try {
      const { error } = await supabase
        .from('Order_Products')
        .insert(products.map(p => ({
          order_id: orderId,
          product_id: p.product_id,
          quantity: p.quantity
        })));

      if (error) {
        console.error('Error adding products to order:', error);
        throw error;
      }

      // Invalidar caché relacionado
      this.cache.invalidate(`order_${orderId}`);
    } catch (error) {
      console.error('Error in addProductsToOrder:', error);
      throw error;
    }
  }

  // Remover productos de una orden
  async removeProductsFromOrder(orderId: string, productIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('Order_Products')
        .delete()
        .eq('order_id', orderId)
        .in('product_id', productIds);

      if (error) {
        console.error('Error removing products from order:', error);
        throw error;
      }

      // Invalidar caché relacionado
      this.cache.invalidate(`order_${orderId}`);
    } catch (error) {
      console.error('Error in removeProductsFromOrder:', error);
      throw error;
    }
  }

  // Obtener estadísticas de órdenes (OPTIMIZADO CON CACHÉ)
  async getOrderStats(): Promise<OrderStats> {
    try {
      const cacheKey = 'order_stats';
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('Orders')
        .select('status');

      if (error) {
        console.error('Error fetching order stats:', error);
        throw error;
      }

      const totalOrders: number = (data?.length as number) || 0;
      const statusCounts: Record<string, number> = (data?.reduce((acc: Record<string, number>, order: any) => {
        const key = String(order.status);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)) || {};

      const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count: Number(count),
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
      }));

      const result = {
        totalOrders,
        pendingApproval: statusCounts['created'] || statusCounts['pending_objects'] || 0,
        approved: statusCounts['approved'] || statusCounts['doctor_approved'] || 0,
        completed: statusCounts['closed'] || 0,
        cancelled: statusCounts['cancelled'] || 0,
        byStatus
      };

      // Guardar en caché por 1 minuto
      this.cache.set(cacheKey, result, 60 * 1000);

      return result;
    } catch (error) {
      console.error('Error in getOrderStats:', error);
      throw error;
    }
  }

  // Buscar órdenes (OPTIMIZADO)
  async searchOrders(query: string, limit: number = 20): Promise<ExtendedOrder[]> {
    try {
      const cacheKey = `search_orders_${query}_${limit}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('Orders')
        .select(`
          *,
          Users!Orders_user_id_fkey (
            id,
            display_name,
            last_name,
            email,
            phone_number,
            role
          )
        `)
        .or(`patient_name.ilike.%${query}%,id.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error searching orders:', error);
        throw error;
      }

      const result = data?.map(order => ({
        ...order,
        orderId: order.id,
        patientId: `PAT${order.id}`,
        typeOfCoverage: order.coverage_type || 'none',
        itemsCount: 0,
        requiresApproval: order.status === 'created' || order.status === 'pending_objects',
        totalAmount: 0,
        doctorInfo: order.Users ? {
          doctorId: order.Users.id,
          doctorName: `${order.Users.display_name} ${order.Users.last_name}`,
          contactPerson: `${order.Users.display_name} ${order.Users.last_name}`,
          phone: order.Users.phone_number,
          email: order.Users.email
        } : undefined,
        products: [],
        statusHistory: [
          {
            status: order.status,
            timestamp: order.created_at,
            changedBy: 'Sistema',
            notes: 'Orden creada'
          }
        ],
        approvals: []
      })) || [];

      // Guardar en caché por 2 minutos
      this.cache.set(cacheKey, result, 2 * 60 * 1000);

      return result;
    } catch (error) {
      console.error('Error in searchOrders:', error);
      throw error;
    }
  }

  // Obtener órdenes asignadas a técnicos
  async getTechnicianAssignedOrders(): Promise<Order[]> {
    try {
      console.log('🔍 Obteniendo órdenes asignadas a técnicos...');
      
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
          notes,
          assigned_technicians
        `)
        .eq('status', 'technicians_assigned')
        .order('surgery_date', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo órdenes asignadas a técnicos:', error);
        throw error;
      }

      console.log('✅ Órdenes asignadas a técnicos obtenidas:', orders?.length || 0);
      
      // Mapear los datos de la base de datos a la interfaz Order
      const mappedOrders: Order[] = (orders || []).map(order => ({
        id: order.id,
        user_id: '', // Campo no incluido en el select
        procedure_id: '', // Campo no incluido en el select
        status: order.status,
        patient_name: order.patient_name || '',
        surgery_date: order.surgery_date,
        surgery_time: order.surgery_time,
        surgery_location: order.surgery_location || '',
        coverage_type: order.coverage_type,
        insurance_name: order.insurance_name,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.created_at, // Usar created_at como fallback
        assigned_technicians: order.assigned_technicians || []
      }));

      return mappedOrders;
    } catch (error) {
      console.error('❌ Error obteniendo órdenes asignadas a técnicos:', error);
      return [];
    }
  }

  // Obtener órdenes específicas de un técnico
  async getTechnicianOrders(technicianId: string): Promise<Order[]> {
    try {
      console.log('🔍 Obteniendo órdenes del técnico:', technicianId);
      
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
          notes,
          assigned_technicians
        `)
        .eq('status', 'technicians_assigned')
        .contains('assigned_technicians', [{ id: technicianId }])
        .order('surgery_date', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo órdenes del técnico:', error);
        throw error;
      }

      console.log('✅ Órdenes del técnico obtenidas:', orders?.length || 0);
      
      // Mapear los datos de la base de datos a la interfaz Order
      const mappedOrders: Order[] = (orders || []).map(order => ({
        id: order.id,
        user_id: '', // Campo no incluido en el select
        procedure_id: '', // Campo no incluido en el select
        status: order.status,
        patient_name: order.patient_name || '',
        surgery_date: order.surgery_date,
        surgery_time: order.surgery_time,
        surgery_location: order.surgery_location || '',
        coverage_type: order.coverage_type,
        insurance_name: order.insurance_name,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.created_at, // Usar created_at como fallback
        assigned_technicians: order.assigned_technicians || []
      }));

      return mappedOrders;
    } catch (error) {
      console.error('❌ Error obteniendo órdenes del técnico:', error);
      return [];
    }
  }

  // Actualizar el arreglo JSON de técnicos asignados en la orden
  async updateAssignedTechnicians(
    orderId: string,
    technicians: Array<{ id: string; name: string; role: 'principal' | 'asistente' | 'primary' | 'secondary' | 'backup' }>
  ): Promise<void> {
    try {
      const normalized = technicians.map((t) => ({
        id: t.id,
        name: t.name,
        role: t.role === 'principal' ? 'primary' : t.role === 'asistente' ? 'secondary' : t.role,
      }));

      const { error } = await supabase
        .from('Orders')
        .update({ assigned_technicians: normalized, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating assigned_technicians:', error);
        throw error;
      }

      // Invalidar caché relacionada
      this.cache.invalidate(`order_${orderId}`);
      this.cache.invalidate('orders');
    } catch (error) {
      console.error('Error in updateAssignedTechnicians:', error);
      throw error;
    }
  }

  // Obtener técnicos reales desde la base de datos
  async getTechnicians(): Promise<Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    specialties?: string[];
    availability: 'available' | 'busy' | 'off' | 'on_call';
    currentLocation?: string;
    rating?: number;
    experience?: string;
    assignedOrders?: number;
    lastActive?: string;
    notifications?: boolean;
    preferredContact?: 'email' | 'phone' | 'sms';
  }>> {
    try {
      console.log('🔍 Obteniendo técnicos desde la base de datos...');
      
      const { data: technicians, error } = await supabase
        .from('Users')
        .select(`
          id,
          name,
          email,
          phone,
          role,
          created_at,
          last_login
        `)
        .eq('role', 'Técnico')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo técnicos:', error);
        throw error;
      }

      console.log('✅ Técnicos obtenidos:', technicians?.length || 0);
      
      // Mapear los datos de la base de datos a la interfaz de técnicos
      const mappedTechnicians = (technicians || []).map(tech => ({
        id: tech.id,
        name: tech.name || 'Sin nombre',
        email: tech.email || '',
        phone: tech.phone || '',
        specialties: ['Técnico General'], // Por defecto, se puede expandir después
        availability: 'available' as const, // Por defecto disponible
        currentLocation: 'Hospital General', // Por defecto
        rating: 4.5, // Por defecto
        experience: '2 años', // Por defecto
        assignedOrders: 0, // Se puede calcular después
        lastActive: tech.last_login || tech.created_at,
        notifications: true, // Por defecto
        preferredContact: 'email' as const // Por defecto
      }));

      return mappedTechnicians;
    } catch (error) {
      console.error('❌ Error obteniendo técnicos:', error);
      return [];
    }
  }

  // Método para limpiar caché (útil para testing)
  clearCache(): void {
    this.cache.clear();
  }

  // Obtener información de un procedimiento por ID
  async getProcedureById(procedureId: string): Promise<{ id: string; name: string } | null> {
    try {
      const { data, error } = await supabase
        .from('Procedures')
        .select('id, name')
        .eq('id', procedureId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo procedimiento por ID:', error);
      return null;
    }
  }
}

export const orderService = new OrderService(); 