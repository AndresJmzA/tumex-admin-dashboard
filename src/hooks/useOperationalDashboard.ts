import { useState, useEffect } from 'react';
import { operationalDashboardService, 
  OperationalStats, 
  PendingOrder, 
  OperationalMetrics 
} from '@/services/operationalDashboardService';

interface UseOperationalDashboardReturn {
  // Estados de datos
  stats: OperationalStats;
  pendingOrders: PendingOrder[];
  metrics: OperationalMetrics;
  
  // Estados de carga
  isLoading: boolean;
  error: string | null;
  
  // Funciones
  refreshData: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshPendingOrders: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  
  // Funciones de aprobación
  approveOrder: (orderId: string, reason?: string) => Promise<boolean>;
  rejectOrder: (orderId: string, reason: string) => Promise<boolean>;
  getOrderById: (orderId: string) => Promise<PendingOrder | null>;
}

export function useOperationalDashboard(): UseOperationalDashboardReturn {
  // Estados de datos
  const [stats, setStats] = useState<OperationalStats>({
    totalOrders: 0,
    pendingApproval: 0,
    approvedOrders: 0,
    rejectedOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    averageProcessingTime: 0,
    ordersByStatus: {}
  });
  
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [metrics, setMetrics] = useState<OperationalMetrics>({
    approvalRate: 0,
    averageResponseTime: 0,
    ordersProcessedToday: 0,
    pendingConfirmations: 0,
    urgentOrders: 0,
    ordersByHospital: {},
    ordersByDoctor: {}
  });
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar todos los datos
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Cargar todos los datos en paralelo
      const [statsData, pendingOrdersData, metricsData] = await Promise.all([
        operationalDashboardService.getOperationalStats(),
        operationalDashboardService.getPendingOrders(),
        operationalDashboardService.getOperationalMetrics()
      ]);
      
      setStats(statsData);
      setPendingOrders(pendingOrdersData);
      setMetrics(metricsData);
      
    } catch (err) {
      console.error('Error cargando datos del dashboard operativo:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones de refresh individuales
  const refreshStats = async () => {
    try {
      const statsData = await operationalDashboardService.getOperationalStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error refrescando estadísticas:', err);
    }
  };

  const refreshPendingOrders = async () => {
    try {
      const pendingOrdersData = await operationalDashboardService.getPendingOrders();
      setPendingOrders(pendingOrdersData);
    } catch (err) {
      console.error('Error refrescando órdenes pendientes:', err);
    }
  };

  const refreshMetrics = async () => {
    try {
      const metricsData = await operationalDashboardService.getOperationalMetrics();
      setMetrics(metricsData);
    } catch (err) {
      console.error('Error refrescando métricas:', err);
    }
  };

  const refreshData = async () => {
    await loadAllData();
  };

  // Funciones de aprobación
  const approveOrder = async (orderId: string, reason?: string): Promise<boolean> => {
    try {
      const success = await operationalDashboardService.approveOrder(orderId, reason);
      if (success) {
        // Refrescar datos después de aprobar
        await refreshData();
      }
      return success;
    } catch (err) {
      console.error('Error aprobando orden:', err);
      return false;
    }
  };

  const rejectOrder = async (orderId: string, reason: string): Promise<boolean> => {
    try {
      const success = await operationalDashboardService.rejectOrder(orderId, reason);
      if (success) {
        // Refrescar datos después de rechazar
        await refreshData();
      }
      return success;
    } catch (err) {
      console.error('Error rechazando orden:', err);
      return false;
    }
  };

  const getOrderById = async (orderId: string): Promise<PendingOrder | null> => {
    try {
      return await operationalDashboardService.getOrderById(orderId);
    } catch (err) {
      console.error('Error obteniendo orden por ID:', err);
      return null;
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData();
  }, []);

  return {
    // Estados de datos
    stats,
    pendingOrders,
    metrics,
    
    // Estados de carga
    isLoading,
    error,
    
    // Funciones
    refreshData,
    refreshStats,
    refreshPendingOrders,
    refreshMetrics,
    
    // Funciones de aprobación
    approveOrder,
    rejectOrder,
    getOrderById
  };
} 