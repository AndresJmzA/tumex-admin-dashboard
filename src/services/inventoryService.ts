import { supabase } from '@/supabaseClient';

// Tipos para el inventario
export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'Consumible' | 'Accesorio' | 'Instrumental' | 'Equipo' | 'Endoscopio' | 'Cable/Conector';
  price: number;
  stock: number;
  available: boolean;
  created_at?: string;
  // Campos adicionales para la interfaz
  brand?: string;
  maxStock?: number;
  status?: 'disponible' | 'en_renta' | 'mantenimiento' | 'fuera_servicio';
  image?: string;
}

export interface InventoryStats {
  totalProducts: number;
  availableProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  categories: {
    name: string;
    count: number;
    percentage: number;
  }[];
}

export interface ProductFilters {
  search?: string;
  category?: string;
  available?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedProductsResponse {
  data: Product[];
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

class InventoryService {
  private cache = new CacheManager();

  // Obtener todos los productos (OPTIMIZADO CON PAGINACIÓN)
  async getProducts(filters?: ProductFilters): Promise<PaginatedProductsResponse> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const offset = (page - 1) * limit;

      // Crear clave de caché basada en filtros
      const cacheKey = `products_${JSON.stringify(filters)}_${page}_${limit}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      let query = supabase
        .from('Products')
        .select('*', { count: 'exact' })
        .order('name')
        .range(offset, offset + limit - 1);

      // Aplicar filtros
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.available !== undefined) {
        query = query.eq('available', filters.available);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.inStock !== undefined) {
        if (filters.inStock) {
          query = query.gt('stock', 0);
        } else {
          query = query.eq('stock', 0);
        }
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      // Transformar datos para compatibilidad con la interfaz
      const transformedData = data?.map(product => ({
        ...product,
        brand: 'TUMex', // Valor por defecto ya que no existe en la BD
        maxStock: product.stock + Math.floor(Math.random() * 50), // Simulado
        status: product.available ? 'disponible' : 'fuera_servicio' as const,
        image: undefined
      })) || [];

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      const result: PaginatedProductsResponse = {
        data: transformedData,
        total,
        page,
        limit,
        totalPages
      };

      // Guardar en caché por 3 minutos
      this.cache.set(cacheKey, result, 3 * 60 * 1000);

      return result;
    } catch (error) {
      console.error('Error in getProducts:', error);
      throw error;
    }
  }

  // Obtener un producto por ID (OPTIMIZADO CON CACHÉ)
  async getProductById(id: string): Promise<Product | null> {
    try {
      const cacheKey = `product_${id}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('Products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      if (!data) return null;

      const result = {
        ...data,
        brand: 'TUMex',
        maxStock: data.stock + Math.floor(Math.random() * 50),
        status: data.available ? 'disponible' : 'fuera_servicio' as const,
        image: undefined
      };

      // Guardar en caché por 5 minutos
      this.cache.set(cacheKey, result, 5 * 60 * 1000);

      return result;
    } catch (error) {
      console.error('Error in getProductById:', error);
      throw error;
    }
  }

  // Buscar productos (OPTIMIZADO)
  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    try {
      const cacheKey = `search_products_${query}_${limit}`;
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('Products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('name')
        .limit(limit);

      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      const result = data?.map(product => ({
        ...product,
        brand: 'TUMex',
        maxStock: product.stock + Math.floor(Math.random() * 50),
        status: product.available ? 'disponible' : 'fuera_servicio' as const,
        image: undefined
      })) || [];

      // Guardar en caché por 2 minutos
      this.cache.set(cacheKey, result, 2 * 60 * 1000);

      return result;
    } catch (error) {
      console.error('Error in searchProducts:', error);
      throw error;
    }
  }

  // Obtener estadísticas del inventario (OPTIMIZADO CON CACHÉ)
  async getInventoryStats(): Promise<InventoryStats> {
    try {
      const cacheKey = 'inventory_stats';
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const { data: products, error } = await supabase
        .from('Products')
        .select('*');

      if (error) {
        console.error('Error fetching inventory stats:', error);
        throw error;
      }

      if (!products) {
        return {
          totalProducts: 0,
          availableProducts: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0,
          categories: []
        };
      }

      const totalProducts = products.length;
      const availableProducts = products.filter(p => p.available).length;
      const outOfStockProducts = products.filter(p => p.stock === 0).length;
      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length;

      // Calcular categorías
      const categoryCounts = products.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const categories = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count: count as number,
        percentage: Math.round((count as number / totalProducts) * 100)
      }));

      const result = {
        totalProducts,
        availableProducts,
        lowStockProducts,
        outOfStockProducts,
        categories
      };

      // Guardar en caché por 2 minutos
      this.cache.set(cacheKey, result, 2 * 60 * 1000);

      return result;
    } catch (error) {
      console.error('Error in getInventoryStats:', error);
      throw error;
    }
  }

  // Obtener categorías únicas (OPTIMIZADO CON CACHÉ)
  async getCategories(): Promise<string[]> {
    try {
      const cacheKey = 'categories';
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('Products')
        .select('category')
        .order('category');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      const uniqueCategories = [...new Set(data?.map(p => p.category) || [])];

      // Guardar en caché por 10 minutos
      this.cache.set(cacheKey, uniqueCategories, 10 * 60 * 1000);

      return uniqueCategories;
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  // Crear un nuevo producto
  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('Products')
        .insert([{
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          stock: product.stock,
          available: product.available
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      // Invalidar caché relacionado
      this.cache.invalidate('products');
      this.cache.invalidate('inventory_stats');
      this.cache.invalidate('categories');

      return {
        ...data,
        brand: 'TUMex',
        maxStock: data.stock + Math.floor(Math.random() * 50),
        status: data.available ? 'disponible' : 'fuera_servicio' as const,
        image: undefined
      };
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  }

  // Actualizar un producto
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('Products')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          price: updates.price,
          stock: updates.stock,
          available: updates.available
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      // Invalidar caché relacionado
      this.cache.invalidate('products');
      this.cache.invalidate(`product_${id}`);
      this.cache.invalidate('inventory_stats');

      return {
        ...data,
        brand: 'TUMex',
        maxStock: data.stock + Math.floor(Math.random() * 50),
        status: data.available ? 'disponible' : 'fuera_servicio' as const,
        image: undefined
      };
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
    }
  }

  // Eliminar un producto
  async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('Products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      // Invalidar caché relacionado
      this.cache.invalidate('products');
      this.cache.invalidate(`product_${id}`);
      this.cache.invalidate('inventory_stats');
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      throw error;
    }
  }

  // Actualizar stock de un producto
  async updateStock(id: string, newStock: number): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('Products')
        .update({ stock: newStock })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating stock:', error);
        throw error;
      }

      // Invalidar caché relacionado
      this.cache.invalidate('products');
      this.cache.invalidate(`product_${id}`);
      this.cache.invalidate('inventory_stats');

      return {
        ...data,
        brand: 'TUMex',
        maxStock: data.stock + Math.floor(Math.random() * 50),
        status: data.available ? 'disponible' : 'fuera_servicio' as const,
        image: undefined
      };
    } catch (error) {
      console.error('Error in updateStock:', error);
      throw error;
    }
  }

  // Método para limpiar caché (útil para testing)
  clearCache(): void {
    this.cache.clear();
  }
}

export const inventoryService = new InventoryService(); 