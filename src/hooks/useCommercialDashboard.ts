import { useState, useEffect } from 'react';
import { commercialDashboardService, 
  CommercialStats, 
  RecentOrder, 
  Notification, 
  CallHistory, 
  ConfirmationMetrics, 
  Doctor 
} from '@/services/commercialDashboardService';

interface UseCommercialDashboardReturn {
  // Estados de datos
  stats: CommercialStats;
  recentOrders: RecentOrder[];
  notifications: Notification[];
  callHistory: CallHistory[];
  confirmationMetrics: ConfirmationMetrics;
  doctors: Doctor[];
  
  // Estados de carga
  isLoading: boolean;
  error: string | null;
  
  // Funciones
  refreshData: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshCallHistory: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
  refreshDoctors: () => Promise<void>;
}

export function useCommercialDashboard(): UseCommercialDashboardReturn {
  // Estados de datos
  const [stats, setStats] = useState<CommercialStats>({
    totalOrders: 0,
    pendingConfirmation: 0,
    confirmedOrders: 0,
    monthlyRevenue: 0,
    monthlyGrowth: 0,
    conversionRate: 0,
    averageOrderValue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const [confirmationMetrics, setConfirmationMetrics] = useState<ConfirmationMetrics>({
    totalCalls: 0,
    answeredCalls: 0,
    confirmationRate: 0,
    averageResponseTime: 0,
    pendingConfirmations: 0,
    confirmedToday: 0,
    rejectedToday: 0,
    callsByDoctor: {},
    callsByHospital: {}
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar todos los datos
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Cargar todos los datos en paralelo
      const [
        statsData,
        ordersData,
        notificationsData,
        callHistoryData,
        metricsData,
        doctorsData
      ] = await Promise.all([
        commercialDashboardService.getCommercialStats(),
        commercialDashboardService.getRecentOrders(),
        commercialDashboardService.getNotifications(),
        commercialDashboardService.getCallHistory(),
        commercialDashboardService.getConfirmationMetrics(),
        commercialDashboardService.getDoctors()
      ]);
      
      setStats(statsData);
      setRecentOrders(ordersData);
      setNotifications(notificationsData);
      setCallHistory(callHistoryData);
      setConfirmationMetrics(metricsData);
      setDoctors(doctorsData);
      
    } catch (err) {
      console.error('Error cargando datos del dashboard comercial:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones de refresh individuales
  const refreshStats = async () => {
    try {
      const statsData = await commercialDashboardService.getCommercialStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error refrescando estadísticas:', err);
    }
  };

  const refreshOrders = async () => {
    try {
      const ordersData = await commercialDashboardService.getRecentOrders();
      setRecentOrders(ordersData);
    } catch (err) {
      console.error('Error refrescando órdenes:', err);
    }
  };

  const refreshNotifications = async () => {
    try {
      const notificationsData = await commercialDashboardService.getNotifications();
      setNotifications(notificationsData);
    } catch (err) {
      console.error('Error refrescando notificaciones:', err);
    }
  };

  const refreshCallHistory = async () => {
    try {
      const callHistoryData = await commercialDashboardService.getCallHistory();
      setCallHistory(callHistoryData);
    } catch (err) {
      console.error('Error refrescando historial de llamadas:', err);
    }
  };

  const refreshMetrics = async () => {
    try {
      const metricsData = await commercialDashboardService.getConfirmationMetrics();
      setConfirmationMetrics(metricsData);
    } catch (err) {
      console.error('Error refrescando métricas:', err);
    }
  };

  const refreshDoctors = async () => {
    try {
      const doctorsData = await commercialDashboardService.getDoctors();
      setDoctors(doctorsData);
    } catch (err) {
      console.error('Error refrescando doctores:', err);
    }
  };

  const refreshData = async () => {
    await loadAllData();
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData();
  }, []);

  return {
    // Estados de datos
    stats,
    recentOrders,
    notifications,
    callHistory,
    confirmationMetrics,
    doctors,
    
    // Estados de carga
    isLoading,
    error,
    
    // Funciones
    refreshData,
    refreshStats,
    refreshOrders,
    refreshNotifications,
    refreshCallHistory,
    refreshMetrics,
    refreshDoctors
  };
} 