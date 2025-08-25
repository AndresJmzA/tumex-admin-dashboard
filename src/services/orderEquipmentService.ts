import { supabase } from '@/supabaseClient';

// Tipos para equipos de orden
export interface OrderEquipment {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
  notes: string;
  confirmed: boolean;
  is_from_package: boolean;
  package_id?: string;
  created_at: string;
  updated_at: string;
}

// Tipos para paquetes predefinidos optimizados
export interface EquipmentPackage {
  id: string;
  name: string;
  description: string;
  procedure_type: string;      // Nombre del procedimiento
  surgery_type: string;        // Nombre del tipo de cirugía
  total_products: number;      // Total de productos en el paquete
  total_value: number;         // Valor total del paquete
  categories: EquipmentPackageCategory[]; // Array de categorías con productos
  created_at: string;
  updated_at: string;
}

// Nueva interfaz para categorías dentro de un paquete
export interface EquipmentPackageCategory {
  name: string;                // Nombre de la categoría (ej: "EQUIPOS", "INSTRUMENTAL")
  display_name: string;        // Nombre para mostrar (ej: "Equipos", "Instrumental")
  products: EquipmentPackageProduct[];  // Productos de esta categoría
  total_quantity: number;      // Cantidad total de productos en esta categoría
  total_value: number;         // Valor total de esta categoría
}

// Interfaz para productos dentro de una categoría
export interface EquipmentPackageProduct {
  product_id: string;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
}

// Nuevos tipos para paquetes optimizados de la FASE 2
export interface OptimizedPackage {
  procedure_id: string;
  procedure_name: string;
  surgery_type_id: string;
  surgery_type_name: string;
  categories: PackageCategory[];
  total_value: number;
  total_products: number;
}

export interface PackageCategory {
  category: string;
  category_display: string;
  category_sort_order: number;
  category_color: string;
  category_icon: string;
  product_count: number;
  total_quantity: number;
  total_value: number;
  products: PackageProduct[];
}

export interface PackageProduct {
  product_id: string;
  product_name: string;
  product_description: string;
  product_brand: string;
  quantity: number;
  price: number;
  stock: number;
  available: boolean;
  category: string;
  category_display: string;
  category_sort_order: number;
  category_color: string;
  category_icon: string;
}

// Tipos para productos disponibles
export interface AvailableProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_available: number;
  stock_warning: boolean;
  description?: string;
}

// Tipos para filtros
export interface EquipmentFilters {
  order_id?: string;
  category?: string;
  confirmed?: boolean;
  is_from_package?: boolean;
  package_id?: string;
}

// Tipos para respuestas
export interface EquipmentResponse {
  data: OrderEquipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PackageResponse {
  data: EquipmentPackage[];
  total: number;
}

// Nuevos tipos para respuestas optimizadas
export interface OptimizedPackageResponse {
  data: OptimizedPackage[];
  total: number;
}

export interface PackageCategoryResponse {
  data: PackageCategory[];
  total: number;
}

// Cache manager para optimizar consultas
class EquipmentCacheManager {
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

class OrderEquipmentService {
  private cache = new EquipmentCacheManager();

  private isValidUuid(value?: string | null): boolean {
    if (!value) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  // ============================================================================
  // FUNCIONES OPTIMIZADAS DE PAQUETES (FASE 2)
  // ============================================================================

  /**
   * Obtener paquetes optimizados por procedimiento usando las nuevas vistas de la FASE 2
   */
  async getOptimizedPackagesByProcedure(procedureId: string): Promise<OptimizedPackage | null> {
    const cacheKey = `optimized_package_${procedureId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Usar la función optimizada de la FASE 2
      const { data: packages, error: packagesError } = await supabase
        .rpc('GetProcedurePackagesOptimized', { procedure_id_param: procedureId });

      if (packagesError) throw packagesError;

      if (!packages || packages.length === 0) {
        return null;
      }

      // Obtener productos del paquete
      const { data: products, error: productsError } = await supabase
        .rpc('GetPackageProductsOptimized', { 
          procedure_id_param: procedureId,
          category_param: null 
        });

      if (productsError) throw productsError;

      // Obtener información del procedimiento
      const { data: procedure, error: procedureError } = await supabase
        .from('Procedures')
        .select(`
          id,
          name,
          surgery_type_id,
          SurgeryTypes!inner(name)
        `)
        .eq('id', procedureId)
        .single();

      if (procedureError) throw procedureError;

      // Agrupar productos por categoría
      const categoryMap = new Map<string, PackageCategory>();
      
      packages.forEach(pkg => {
        const categoryProducts = products?.filter(p => p.category === pkg.category) || [];
        
        categoryMap.set(pkg.category, {
          category: pkg.category,
          category_display: pkg.category_display,
          category_sort_order: pkg.category_sort_order,
          category_color: pkg.category_color,
          category_icon: pkg.category_icon,
          product_count: pkg.product_count,
          total_quantity: pkg.total_quantity,
          total_value: pkg.total_value,
          products: categoryProducts.map(p => ({
            product_id: p.product_id,
            product_name: p.product_name,
            product_description: p.product_description || '',
            product_brand: p.product_brand || '',
            quantity: p.quantity,
            price: p.price,
            stock: p.stock,
            available: p.available,
            category: p.category,
            category_display: p.category_display,
            category_sort_order: p.category_sort_order,
            category_color: p.category_color,
            category_icon: p.category_icon
          }))
        });
      });

      // Crear el paquete optimizado
      const optimizedPackage: OptimizedPackage = {
        procedure_id: procedureId,
        procedure_name: procedure.name,
        surgery_type_id: procedure.surgery_type_id,
        surgery_type_name: (procedure.SurgeryTypes as any)?.name || '',
        categories: Array.from(categoryMap.values()).sort((a, b) => a.category_sort_order - b.category_sort_order),
        total_value: packages.reduce((sum, pkg) => sum + Number(pkg.total_value), 0),
        total_products: packages.reduce((sum, pkg) => sum + Number(pkg.product_count), 0)
      };

      this.cache.set(cacheKey, optimizedPackage);
      return optimizedPackage;

    } catch (error) {
      console.error('Error fetching optimized package:', error);
      return null;
    }
  }

  /**
   * Obtener productos de una categoría específica de un paquete optimizado
   */
  async getOptimizedPackageProductsByCategory(
    procedureId: string, 
    category: string
  ): Promise<PackageProduct[]> {
    const cacheKey = `optimized_package_products_${procedureId}_${category}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data: products, error } = await supabase
        .rpc('GetPackageProductsOptimized', { 
          procedure_id_param: procedureId,
          category_param: category 
        });

      if (error) throw error;

      const packageProducts: PackageProduct[] = (products || []).map(p => ({
        product_id: p.product_id,
        product_name: p.product_name,
        product_description: p.product_description || '',
        product_brand: p.product_brand || '',
        quantity: p.quantity,
        price: p.price,
        stock: p.stock,
        available: p.available,
        category: p.category,
        category_display: p.category_display,
        category_sort_order: p.category_sort_order,
        category_color: p.category_color,
        category_icon: p.category_icon
      }));

      this.cache.set(cacheKey, packageProducts);
      return packageProducts;

    } catch (error) {
      console.error('Error fetching optimized package products by category:', error);
      return [];
    }
  }

  /**
   * Aplicar paquete optimizado a una orden
   */
  async applyOptimizedPackageToOrder(
    orderId: string, 
    procedureId: string, 
    options?: {
      replace_existing?: boolean;
      confirm_equipment?: boolean;
      user_id?: string;
    }
  ): Promise<OrderEquipment[]> {
    try {
      // Obtener el paquete optimizado
      const optimizedPackage = await this.getOptimizedPackagesByProcedure(procedureId);
      if (!optimizedPackage) {
        throw new Error('Paquete optimizado no encontrado');
      }

      // Si se debe reemplazar, eliminar equipos existentes
      if (options?.replace_existing) {
        await this.replaceOrderEquipment(orderId, []);
      }

      // Preparar equipos para agregar
      const equipmentToAdd: Array<{
        product_id: string;
        quantity: number;
        price: number;
        notes?: string;
        is_from_package: boolean;
        package_id?: string;
      }> = [];

      optimizedPackage.categories.forEach(category => {
        category.products.forEach(product => {
          equipmentToAdd.push({
            product_id: product.product_id,
            quantity: product.quantity,
            price: product.price,
            notes: `Aplicado desde paquete ${optimizedPackage.procedure_name} - ${category.category_display}`,
            is_from_package: true,
            package_id: procedureId
          });
        });
      });

      // Agregar equipos a la orden
      const addedEquipment: OrderEquipment[] = [];
      for (const eq of equipmentToAdd) {
        const added = await this.addEquipmentToOrder(orderId, eq);
        
        // Confirmar automáticamente si se solicita
        if (options?.confirm_equipment) {
          await this.updateOrderEquipment(added.id, { confirmed: true });
          added.confirmed = true;
        }
        
        addedEquipment.push(added);
      }

      // Registrar cambio en el historial si está disponible
      if (options?.user_id) {
        try {
          await supabase.rpc('LogPackageChange', {
            procedure_id_param: procedureId,
            category_param: 'all',
            action_param: 'package_applied',
            product_id_param: 'N/A',
            old_quantity_param: 0,
            new_quantity_param: equipmentToAdd.length,
            old_price_param: 0,
            new_price_param: optimizedPackage.total_value,
            changed_by_param: options.user_id,
            change_reason_param: `Paquete aplicado a orden ${orderId}`
          });
        } catch (logError) {
          console.warn('No se pudo registrar el cambio en el historial:', logError);
        }
      }

      // Invalidar cache
      this.cache.invalidate(`order_equipment_${orderId}`);
      this.cache.invalidate(`optimized_package_${procedureId}`);

      return addedEquipment;

    } catch (error) {
      console.error('Error applying optimized package to order:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración completa de paquetes por procedimiento
   */
  async getPackageConfiguration(procedureId: string): Promise<any[]> {
    const cacheKey = `package_config_${procedureId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .rpc('GetPackageConfiguration', { procedure_id_param: procedureId });

      if (error) throw error;

      this.cache.set(cacheKey, data || []);
      return data || [];

    } catch (error) {
      console.error('Error fetching package configuration:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas de uso de paquetes
   */
  async getPackageUsageStats(daysBack: number = 30): Promise<any[]> {
    const cacheKey = `package_usage_stats_${daysBack}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .rpc('GetPackageUsageStats', { days_back: daysBack });

      if (error) throw error;

      this.cache.set(cacheKey, data || []);
      return data || [];

    } catch (error) {
      console.error('Error fetching package usage stats:', error);
      return [];
    }
  }

  /**
   * Obtener productos más utilizados en paquetes
   */
  async getMostUsedProductsInPackages(limitCount: number = 20): Promise<any[]> {
    const cacheKey = `most_used_products_${limitCount}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .rpc('GetMostUsedProductsInPackages', { limit_count: limitCount });

      if (error) throw error;

      this.cache.set(cacheKey, data || []);
      return data || [];

    } catch (error) {
      console.error('Error fetching most used products in packages:', error);
      return [];
    }
  }

  // ============================================================================
  // FUNCIONES EXISTENTES MANTENIDAS PARA COMPATIBILIDAD
  // ============================================================================

  // Obtener equipos de una orden
  async getOrderEquipment(orderId: string, filters?: EquipmentFilters): Promise<EquipmentResponse> {
    const cacheKey = `order_equipment_${orderId}_${JSON.stringify(filters)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('Order_Products')
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          price,
          notes,
          confirmed,
          is_from_package,
          package_id,
          created_at,
          updated_at,
          Products(
            name,
            category
          )
        `)
        .eq('order_id', orderId);

      // Aplicar filtros
      if (filters?.category) {
        query = query.eq('Products.category', filters.category);
      }
      if (filters?.confirmed !== undefined) {
        query = query.eq('confirmed', filters.confirmed);
      }
      if (filters?.is_from_package !== undefined) {
        query = query.eq('is_from_package', filters.is_from_package);
      }
      if (filters?.package_id) {
        query = query.eq('package_id', filters.package_id);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Transformar datos para mantener compatibilidad
      const equipment = data?.map(item => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        product_name: (item as any)?.Products?.name || '',
        category: (item as any)?.Products?.category || '',
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || '',
        confirmed: item.confirmed || false,
        is_from_package: item.is_from_package || false,
        package_id: item.package_id,
        created_at: item.created_at,
        updated_at: item.updated_at
      })) || [];

      const total = count || 0;

      const response: EquipmentResponse = {
        data: equipment,
        total,
        page: 1,
        limit: equipment.length,
        totalPages: 1
      };

      this.cache.set(cacheKey, response);
      return response;

    } catch (error) {
      console.error('Error fetching order equipment:', error);
      throw error;
    }
  }

  // Reemplazar completamente los equipos de una orden (borrar e insertar)
  async replaceOrderEquipment(orderId: string, items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    notes?: string;
    confirmed?: boolean;
    is_from_package?: boolean;
    package_id?: string | null;
  }>): Promise<void> {
    try {
      // Eliminar existentes
      const { error: delError } = await supabase
        .from('Order_Products')
        .delete()
        .eq('order_id', orderId);
      if (delError) throw delError;

      if (items.length > 0) {
        // Insertar nuevos
        const payload = items.map((it) => ({
          order_id: orderId,
          product_id: it.product_id,
          quantity: it.quantity,
          price: it.price,
          notes: it.notes || '',
          confirmed: !!it.confirmed,
          is_from_package: !!it.is_from_package,
          // Solo enviar package_id si es UUID válido; de lo contrario, null
          package_id: this.isValidUuid(it.package_id || undefined) ? it.package_id : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        const { error: insError } = await supabase
          .from('Order_Products')
          .insert(payload);
        if (insError) throw insError;
      }

      // Invalidar cache
      this.cache.invalidate(`order_equipment_${orderId}`);
    } catch (error) {
      console.error('Error replacing order equipment:', error);
      throw error;
    }
  }

  // Agregar equipo a una orden
  async addEquipmentToOrder(orderId: string, equipment: {
    product_id: string;
    quantity: number;
    price: number;
    notes?: string;
    is_from_package?: boolean;
    package_id?: string;
  }): Promise<OrderEquipment> {
    try {
      const { data, error } = await supabase
        .from('Order_Products')
        .insert({
          order_id: orderId,
          product_id: equipment.product_id,
          quantity: equipment.quantity,
          price: equipment.price,
          notes: equipment.notes || '',
          confirmed: false,
          is_from_package: equipment.is_from_package || false,
          package_id: this.isValidUuid(equipment.package_id) ? equipment.package_id : null
        })
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          price,
          notes,
          confirmed,
          is_from_package,
          package_id,
          created_at,
          updated_at,
          Products!inner(
            name,
            category
          )
        `)
        .single();

      if (error) throw error;

      // Transformar para mantener compatibilidad
      const transformedData = {
        id: data.id,
        order_id: data.order_id,
        product_id: data.product_id,
        product_name: (data.Products as any)?.name || '',
        category: (data.Products as any)?.category || '',
        quantity: data.quantity,
        price: data.price,
        notes: data.notes || '',
        confirmed: data.confirmed || false,
        is_from_package: data.is_from_package || false,
        package_id: data.package_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      // Invalidar cache
      this.cache.invalidate(`order_equipment_${orderId}`);

      return transformedData;

    } catch (error) {
      console.error('Error adding equipment to order:', error);
      throw error;
    }
  }

  // Actualizar equipo de una orden
  async updateOrderEquipment(equipmentId: string, updates: {
    quantity?: number;
    price?: number;
    notes?: string;
    confirmed?: boolean;
  }): Promise<OrderEquipment> {
    try {
      const { data, error } = await supabase
        .from('Order_Products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipmentId)
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          price,
          notes,
          confirmed,
          is_from_package,
          package_id,
          created_at,
          updated_at,
          Products!inner(
            name,
            category
          )
        `)
        .single();

      if (error) throw error;

      // Transformar para mantener compatibilidad
      const transformedData = {
        id: data.id,
        order_id: data.order_id,
        product_id: data.product_id,
        product_name: (data.Products as any)?.name || '',
        category: (data.Products as any)?.category || '',
        quantity: data.quantity,
        price: data.price,
        notes: data.notes || '',
        confirmed: data.confirmed || false,
        is_from_package: data.is_from_package || false,
        package_id: data.package_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      // Invalidar cache
      this.cache.invalidate(`order_equipment_${data.order_id}`);

      return transformedData;

    } catch (error) {
      console.error('Error updating order equipment:', error);
      throw error;
    }
  }

  // Remover equipo de una orden
  async removeEquipmentFromOrder(equipmentId: string): Promise<void> {
    try {
      // Obtener el order_id antes de eliminar para invalidar cache
      const { data: equipment } = await supabase
        .from('Order_Products')
        .select('order_id')
        .eq('id', equipmentId)
        .single();

      const { error } = await supabase
        .from('Order_Products')
        .delete()
        .eq('id', equipmentId);

      if (error) throw error;

      // Invalidar cache
      if (equipment) {
        this.cache.invalidate(`order_equipment_${equipment.order_id}`);
      }

    } catch (error) {
      console.error('Error removing equipment from order:', error);
      throw error;
    }
  }

  // Obtener tipos de cirugía
  async getSurgeryTypes(): Promise<Array<{id: string, name: string}>> {
    try {
      const { data, error } = await supabase
        .from('SurgeryTypes')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching surgery types:', error);
      return [];
    }
  }

  // Obtener procedimientos por tipo de cirugía
  async getProceduresBySurgeryType(surgeryTypeId?: string): Promise<Array<{id: string, name: string, surgery_type_id: string}>> {
    try {
      let query = supabase
        .from('Procedures')
        .select('id, name, surgery_type_id')
        .order('name');
      
      if (surgeryTypeId) {
        query = query.eq('surgery_type_id', surgeryTypeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching procedures:', error);
      return [];
    }
  }

  // Obtener paquetes por procedimiento (método corregido - UN paquete por procedimiento)
  async getPackagesByProcedure(procedureId: string): Promise<EquipmentPackage[]> {
    try {
      // Obtener productos asociados al procedimiento desde Templates
      const { data: templateProducts, error: templateError } = await supabase
        .from('Templates')
        .select(`
          product_id,
          quantity,
          category,
          Products!inner(
            id,
            name,
            category,
            price
          )
        `)
        .eq('procedure_id', procedureId);

      if (templateError) throw templateError;

      if (!templateProducts || templateProducts.length === 0) {
        return [];
      }

      // Obtener información del procedimiento y tipo de cirugía
      const { data: procedure, error: procedureError } = await supabase
        .from('Procedures')
        .select(`
          id,
          name,
          surgery_type_id,
          SurgeryTypes!inner(
            id,
            name
          )
        `)
        .eq('id', procedureId)
        .single();

      if (procedureError) {
        console.warn(`No se pudo obtener información del procedimiento ${procedureId}:`, procedureError);
        // Usar valores por defecto si no se puede obtener la información del procedimiento
        const defaultProcedure = {
          name: `Procedimiento ${procedureId}`,
          SurgeryTypes: { name: 'Tipo no especificado' }
        };
        return this.createDefaultPackage(templateProducts, defaultProcedure);
      }

      // Crear UN SOLO paquete para el procedimiento completo
      const packageCategories = new Map<string, EquipmentPackageCategory>();
      let totalProducts = 0;
      let totalValue = 0;
      
      // Agrupar productos por categoría
      templateProducts.forEach(template => {
        const product = (template as any).Products;
        const category = template.category || product.category || 'General';
        
        if (!packageCategories.has(category)) {
          packageCategories.set(category, {
            name: category,
            display_name: this.capitalizeFirstLetter(category),
            products: [],
            total_quantity: 0,
            total_value: 0
          });
        }
        
        const categoryData = packageCategories.get(category)!;
        categoryData.products.push({
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          quantity: template.quantity || 1,
          price: product.price || 0
        });
        
        categoryData.total_quantity += template.quantity || 1;
        categoryData.total_value += (product.price || 0) * (template.quantity || 1);
        
        totalProducts += template.quantity || 1;
        totalValue += (product.price || 0) * (template.quantity || 1);
      });

      // Crear el paquete único
      const singlePackage: EquipmentPackage = {
        id: `package_${procedureId}`,
        name: `${procedure.name}`,
        description: `Paquete completo para el procedimiento ${procedure.name}`,
        procedure_type: procedure.name,
        surgery_type: (procedure.SurgeryTypes as any)?.name || 'Tipo no especificado',
        total_products: totalProducts,
        total_value: totalValue,
        categories: Array.from(packageCategories.values()),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return [singlePackage]; // Retornar array con UN solo paquete

    } catch (error) {
      console.error('Error fetching packages by procedure:', error);
      return [];
    }
  }

  // Método auxiliar para crear paquetes con información por defecto
  private createDefaultPackage(templateProducts: any[], defaultProcedure: any): EquipmentPackage[] {
    const packageCategories = new Map<string, EquipmentPackageCategory>();
    let totalProducts = 0;
    let totalValue = 0;
    
    templateProducts.forEach(template => {
      const product = (template as any).Products;
      const category = template.category || product.category || 'General';
      
      if (!packageCategories.has(category)) {
        packageCategories.set(category, {
          name: category,
          display_name: this.capitalizeFirstLetter(category),
          products: [],
          total_quantity: 0,
          total_value: 0
        });
      }
      
      const categoryData = packageCategories.get(category)!;
      categoryData.products.push({
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        quantity: template.quantity || 1,
        price: product.price || 0
      });
      
      categoryData.total_quantity += template.quantity || 1;
      categoryData.total_value += (product.price || 0) * (template.quantity || 1);
      
      totalProducts += template.quantity || 1;
      totalValue += (product.price || 0) * (template.quantity || 1);
    });

    // Crear el paquete único por defecto
    const defaultPackage: EquipmentPackage = {
      id: `package_default_${defaultProcedure.name}`,
      name: `${defaultProcedure.name}`,
      description: `Paquete por defecto para ${defaultProcedure.name}`,
      procedure_type: defaultProcedure.name,
      surgery_type: defaultProcedure.SurgeryTypes.name,
      total_products: totalProducts,
      total_value: totalValue,
      categories: Array.from(packageCategories.values()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return [defaultPackage]; // Retornar array con UN solo paquete por defecto
  }

  // Obtener paquetes disponibles (método corregido)
  async getAvailablePackages(): Promise<PackageResponse> {
    try {
      // Obtener todos los procedimientos únicos que tienen templates
      const { data: procedures, error: proceduresError } = await supabase
        .from('Templates')
        .select('procedure_id')
        .order('procedure_id');

      if (proceduresError) throw proceduresError;

      if (!procedures || procedures.length === 0) {
        return { data: [], total: 0 };
      }

      // Obtener procedimientos únicos
      const uniqueProcedures = [...new Set(procedures.map(p => p.procedure_id))];
      
      // Crear paquetes para cada procedimiento
      const packagesWithEquipment: EquipmentPackage[] = [];
      
      for (const procedureId of uniqueProcedures) {
        const procedurePackages = await this.getPackagesByProcedure(procedureId);
        packagesWithEquipment.push(...procedurePackages);
      }

      return {
        data: packagesWithEquipment,
        total: packagesWithEquipment.length
      };

    } catch (error) {
      console.error('Error fetching available packages:', error);
      return { data: [], total: 0 };
    }
  }

  // Obtener productos disponibles
  async getAvailableProducts(): Promise<AvailableProduct[]> {
    const cacheKey = 'available_products';
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Verificar que las variables de entorno estén configuradas
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.error('Supabase environment variables not configured');
        return [];
      }

      const { data, error } = await supabase
        .from('Products')
        .select('id, name, category, price, stock, available, description')
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        // Si es un error de autenticación o configuración, retornar array vacío
        if (error.code === 'PGRST116' || error.code === 'PGRST301') {
          console.error('Supabase configuration error. Please check your environment variables.');
          return [];
        }
        throw error;
      }

      // Transformar datos para mantener compatibilidad con AvailableProduct
      const products = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock_available: product.stock || 0,
        stock_warning: (product.stock || 0) < 5,
        description: product.description
      }));

      this.cache.set(cacheKey, products);
      return products;

    } catch (error) {
      console.error('Error fetching available products:', error);
      // Retornar array vacío en caso de error para evitar que la aplicación se rompa
      return [];
    }
  }

  // Confirmar equipos de una orden
  async confirmOrderEquipment(orderId: string, equipmentIds: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('Order_Products')
        .update({ 
          confirmed: true,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId)
        .in('id', equipmentIds);

      if (error) throw error;

      // Invalidar cache
      this.cache.invalidate(`order_equipment_${orderId}`);

    } catch (error) {
      console.error('Error confirming order equipment:', error);
      throw error;
    }
  }

  // Obtener estadísticas de equipos de una orden
  async getOrderEquipmentStats(orderId: string): Promise<{
    totalEquipment: number;
    confirmedEquipment: number;
    pendingEquipment: number;
    totalValue: number;
    confirmedValue: number;
    pendingValue: number;
    packagesApplied: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('Order_Products')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;

      const equipment = data || [];
      
      const totalEquipment = equipment.length;
      const confirmedEquipment = equipment.filter(eq => eq.confirmed).length;
      const pendingEquipment = totalEquipment - confirmedEquipment;
      
      const totalValue = equipment.reduce((sum, eq) => sum + (eq.price * eq.quantity), 0);
      const confirmedValue = equipment
        .filter(eq => eq.confirmed)
        .reduce((sum, eq) => sum + (eq.price * eq.quantity), 0);
      const pendingValue = totalValue - confirmedValue;
      
      const packagesApplied = new Set(equipment
        .filter(eq => eq.is_from_package)
        .map(eq => eq.package_id)
      ).size;

      return {
        totalEquipment,
        confirmedEquipment,
        pendingEquipment,
        totalValue,
        confirmedValue,
        pendingValue,
        packagesApplied
      };

    } catch (error) {
      console.error('Error getting order equipment stats:', error);
      throw error;
    }
  }

  // Validar stock disponible para equipos de una orden
  async validateOrderEquipmentStock(orderId: string): Promise<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
  }> {
    try {
      // Obtener equipos de la orden
      const { data: orderEquipment, error: equipmentError } = await supabase
        .from('Order_Products')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (equipmentError) throw equipmentError;

      const warnings: string[] = [];
      const errors: string[] = [];

      for (const eq of orderEquipment || []) {
        // Obtener información del producto
        const { data: product, error: productError } = await supabase
          .from('Products')
          .select('name, stock_available')
          .eq('id', eq.product_id)
          .single();

        if (productError) {
          errors.push(`Error obteniendo información del producto ${eq.product_id}`);
          continue;
        }

        if (eq.quantity > product.stock_available) {
          if (eq.quantity > product.stock_available * 2) {
            errors.push(`${product.name}: Cantidad solicitada (${eq.quantity}) excede significativamente el stock disponible (${product.stock_available})`);
          } else {
            warnings.push(`${product.name}: Cantidad solicitada (${eq.quantity}) excede el stock disponible (${product.stock_available})`);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        warnings,
        errors
      };

    } catch (error) {
      console.error('Error validating order equipment stock:', error);
      throw error;
    }
  }

  // Limpiar cache
  clearCache(): void {
    this.cache.clear();
  }

  // Suscripción en tiempo real a cambios de equipos por orden
  subscribeToOrderEquipment(
    orderId: string,
    onChange: () => void
  ): { unsubscribe: () => void } {
    const channelName = `order_products_${orderId}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Order_Products',
          filter: `order_id=eq.${orderId}`
        },
        () => {
          // Invalidar cache y notificar
          this.cache.invalidate(`order_equipment_${orderId}`);
          try { onChange(); } catch (e) { /* noop */ }
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        try { supabase.removeChannel(channel); } catch (e) { /* noop */ }
      }
    };
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

// Exportar instancia singleton
export const orderEquipmentService = new OrderEquipmentService(); 