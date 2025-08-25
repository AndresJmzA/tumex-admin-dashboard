import { useState, useEffect, useCallback } from 'react';
import { orderEquipmentService } from '@/services/orderEquipmentService';
import type { 
  OptimizedPackage, 
  PackageCategory, 
  PackageProduct,
  OrderEquipment 
} from '@/services/orderEquipmentService';

// Estados de carga
interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Estado del hook
interface UseOptimizedPackagesState {
  // Paquete optimizado actual
  optimizedPackage: OptimizedPackage | null;
  
  // Estados de carga
  packageLoading: LoadingState;
  productsLoading: LoadingState;
  applicationLoading: LoadingState;
  
  // Funciones
  loadPackage: (procedureId: string) => Promise<void>;
  loadProductsByCategory: (procedureId: string, category: string) => Promise<void>;
  applyPackageToOrder: (orderId: string, procedureId: string, options?: ApplyPackageOptions) => Promise<OrderEquipment[]>;
  
  // Datos adicionales
  productsByCategory: PackageProduct[];
  packageStats: PackageStats | null;
}

// Opciones para aplicar paquete
interface ApplyPackageOptions {
  replace_existing?: boolean;
  confirm_equipment?: boolean;
  user_id?: string;
}

// Estadísticas del paquete
interface PackageStats {
  totalCategories: number;
  totalProducts: number;
  totalValue: number;
  categoriesBreakdown: Array<{
    category: string;
    category_display: string;
    product_count: number;
    total_value: number;
    color: string;
    icon: string;
  }>;
}

/**
 * Hook personalizado para usar paquetes optimizados de la FASE 2
 * Proporciona funcionalidades para cargar, visualizar y aplicar paquetes
 * con el nuevo sistema de base de datos optimizado
 */
export function useOptimizedPackages(): UseOptimizedPackagesState {
  // Estados principales
  const [optimizedPackage, setOptimizedPackage] = useState<OptimizedPackage | null>(null);
  const [productsByCategory, setProductsByCategory] = useState<PackageProduct[]>([]);
  const [packageStats, setPackageStats] = useState<PackageStats | null>(null);

  // Estados de carga
  const [packageLoading, setPackageLoading] = useState<LoadingState>({
    loading: false,
    error: null
  });

  const [productsLoading, setProductsLoading] = useState<LoadingState>({
    loading: false,
    error: null
  });

  const [applicationLoading, setApplicationLoading] = useState<LoadingState>({
    loading: false,
    error: null
  });

  /**
   * Cargar paquete optimizado por procedimiento
   */
  const loadPackage = useCallback(async (procedureId: string): Promise<void> => {
    if (!procedureId) return;

    setPackageLoading({ loading: true, error: null });

    try {
      const packageData = await orderEquipmentService.getOptimizedPackagesByProcedure(procedureId);
      
      if (packageData) {
        setOptimizedPackage(packageData);
        
        // Calcular estadísticas del paquete
        const stats: PackageStats = {
          totalCategories: packageData.categories.length,
          totalProducts: packageData.total_products,
          totalValue: packageData.total_value,
          categoriesBreakdown: packageData.categories.map(cat => ({
            category: cat.category,
            category_display: cat.category_display,
            product_count: cat.product_count,
            total_value: cat.total_value,
            color: cat.category_color,
            icon: cat.category_icon
          }))
        };
        
        setPackageStats(stats);
      } else {
        setOptimizedPackage(null);
        setPackageStats(null);
      }
      
      setPackageLoading({ loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar el paquete';
      setPackageLoading({ loading: false, error: errorMessage });
      console.error('Error loading optimized package:', error);
    }
  }, []);

  /**
   * Cargar productos de una categoría específica
   */
  const loadProductsByCategory = useCallback(async (procedureId: string, category: string): Promise<void> => {
    if (!procedureId || !category) return;

    setProductsLoading({ loading: true, error: null });

    try {
      const products = await orderEquipmentService.getOptimizedPackageProductsByCategory(procedureId, category);
      setProductsByCategory(products);
      setProductsLoading({ loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar productos';
      setProductsLoading({ loading: false, error: errorMessage });
      console.error('Error loading products by category:', error);
    }
  }, []);

  /**
   * Aplicar paquete optimizado a una orden
   */
  const applyPackageToOrder = useCallback(async (
    orderId: string, 
    procedureId: string, 
    options?: ApplyPackageOptions
  ): Promise<OrderEquipment[]> => {
    if (!orderId || !procedureId) {
      throw new Error('Se requiere orderId y procedureId');
    }

    setApplicationLoading({ loading: true, error: null });

    try {
      const appliedEquipment = await orderEquipmentService.applyOptimizedPackageToOrder(
        orderId, 
        procedureId, 
        options
      );

      setApplicationLoading({ loading: false, error: null });
      return appliedEquipment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al aplicar el paquete';
      setApplicationLoading({ loading: false, error: errorMessage });
      console.error('Error applying package to order:', error);
      throw error;
    }
  }, []);

  /**
   * Limpiar estados al desmontar
   */
  useEffect(() => {
    return () => {
      setOptimizedPackage(null);
      setProductsByCategory([]);
      setPackageStats(null);
    };
  }, []);

  return {
    // Estados
    optimizedPackage,
    packageLoading,
    productsLoading,
    applicationLoading,
    
    // Funciones
    loadPackage,
    loadProductsByCategory,
    applyPackageToOrder,
    
    // Datos adicionales
    productsByCategory,
    packageStats
  };
}

/**
 * Hook especializado para cargar paquetes por procedimiento
 */
export function usePackageByProcedure(procedureId?: string) {
  const [packageData, setPackageData] = useState<OptimizedPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPackage = useCallback(async () => {
    if (!procedureId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await orderEquipmentService.getOptimizedPackagesByProcedure(procedureId);
      setPackageData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar el paquete';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [procedureId]);

  useEffect(() => {
    if (procedureId) {
      loadPackage();
    }
  }, [procedureId, loadPackage]);

  return {
    packageData,
    loading,
    error,
    reload: loadPackage
  };
}

/**
 * Hook para estadísticas de paquetes
 */
export function usePackageStats(daysBack: number = 30) {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await orderEquipmentService.getPackageUsageStats(daysBack);
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [daysBack]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    reload: loadStats
  };
}

/**
 * Hook para productos más utilizados en paquetes
 */
export function useMostUsedProducts(limitCount: number = 20) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await orderEquipmentService.getMostUsedProductsInPackages(limitCount);
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar productos más utilizados';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [limitCount]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    reload: loadProducts
  };
}

/**
 * Hook para configuración de paquetes
 */
export function usePackageConfiguration(procedureId?: string) {
  const [configuration, setConfiguration] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfiguration = useCallback(async () => {
    if (!procedureId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await orderEquipmentService.getPackageConfiguration(procedureId);
      setConfiguration(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar configuración';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [procedureId]);

  useEffect(() => {
    if (procedureId) {
      loadConfiguration();
    }
  }, [procedureId, loadConfiguration]);

  return {
    configuration,
    loading,
    error,
    reload: loadConfiguration
  };
}
