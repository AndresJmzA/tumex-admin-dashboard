import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';
import { Notification, NotificationType } from '@/components/NotificationCenter';
import { UserRole } from '@/contexts/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (user) {
      const userNotifications = notificationService.getNotifications(user.id);
      setNotifications(userNotifications);
      setUnreadCount(notificationService.getUnreadCount(user.id));
    }
  }, [user]);

  // Suscribirse a nuevas notificaciones
  useEffect(() => {
    if (user) {
      const unsubscribe = notificationService.subscribe(user.id, (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      return unsubscribe;
    }
  }, [user]);

  // Crear notificación automática
  const createNotification = async (
    type: NotificationType,
    data: Record<string, any> = {}
  ): Promise<Notification | null> => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const notification = await notificationService.createNotification(
        type,
        user.id,
        user.role as UserRole,
        data
      );
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar como leída
  const markAsRead = (notificationId: string) => {
    if (!user) return;

    notificationService.markAsRead(user.id, notificationId);
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    if (!user) return;

    notificationService.markAllAsRead(user.id);
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  // Eliminar notificación
  const deleteNotification = (notificationId: string) => {
    if (!user) return;

    notificationService.deleteNotification(user.id, notificationId);
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  // Limpiar todas las notificaciones
  const clearAll = () => {
    if (!user) return;

    notificationService.clearAllNotifications(user.id);
    setNotifications([]);
    setUnreadCount(0);
  };

  // Obtener notificaciones filtradas
  const getFilteredNotifications = (filter: 'all' | 'unread' | 'high' | 'critical') => {
    return notifications.filter(notification => {
      if (notification.dismissed) return false;
      
      switch (filter) {
        case 'unread':
          return !notification.read;
        case 'high':
          return notification.priority === 'high' || notification.priority === 'critical';
        case 'critical':
          return notification.priority === 'critical';
        default:
          return true;
      }
    });
  };

  // Verificar si está en horas silenciosas
  const isQuietHours = () => {
    return notificationService.isQuietHours();
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getFilteredNotifications,
    isQuietHours
  };
};

export default useNotifications; 