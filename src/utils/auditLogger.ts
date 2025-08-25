// Sistema de logs de auditoría para cambios de estado de órdenes
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  entityType: 'order' | 'inventory' | 'user' | 'permission';
  entityId: string;
  oldValue?: string;
  newValue?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface OrderStatusChangeLog extends AuditLogEntry {
  entityType: 'order';
  oldStatus: string;
  newStatus: string;
  orderNumber: string;
  customerName: string;
  reason?: string;
}

class AuditLogger {
  private static instance: AuditLogger;
  private logs: AuditLogEntry[] = [];

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  // Log de cambio de estado de orden
  logOrderStatusChange(
    userId: string,
    userRole: string,
    orderId: string,
    orderNumber: string,
    customerName: string,
    oldStatus: string,
    newStatus: string,
    reason?: string,
    details?: Record<string, any>
  ): OrderStatusChangeLog {
    const logEntry: OrderStatusChangeLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      action: 'status_change',
      entityType: 'order',
      entityId: orderId,
      oldValue: oldStatus,
      newValue: newStatus,
      oldStatus,
      newStatus,
      orderNumber,
      customerName,
      reason,
      details: {
        ...details,
        changeType: 'status_transition',
        timestamp: new Date().toISOString()
      }
    };

    this.logs.push(logEntry);
    this.persistLog(logEntry);
    
    console.log('📝 Audit Log - Order Status Change:', logEntry);
    
    return logEntry;
  }

  // Log de acción de usuario
  logUserAction(
    userId: string,
    userRole: string,
    action: string,
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    details?: Record<string, any>
  ): AuditLogEntry {
    const logEntry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      action,
      entityType,
      entityId,
      details: {
        ...details,
        timestamp: new Date().toISOString()
      }
    };

    this.logs.push(logEntry);
    this.persistLog(logEntry);
    
    console.log('📝 Audit Log - User Action:', logEntry);
    
    return logEntry;
  }

  // Obtener logs por entidad
  getLogsByEntity(entityType: string, entityId: string): AuditLogEntry[] {
    return this.logs.filter(log => 
      log.entityType === entityType && log.entityId === entityId
    );
  }

  // Obtener logs por usuario
  getLogsByUser(userId: string): AuditLogEntry[] {
    return this.logs.filter(log => log.userId === userId);
  }

  // Obtener logs por acción
  getLogsByAction(action: string): AuditLogEntry[] {
    return this.logs.filter(log => log.action === action);
  }

  // Obtener logs por rango de fechas
  getLogsByDateRange(startDate: string, endDate: string): AuditLogEntry[] {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return logDate >= start && logDate <= end;
    });
  }

  // Exportar logs (para administradores)
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV();
    }
    return JSON.stringify(this.logs, null, 2);
  }

  // Limpiar logs antiguos (mantener solo últimos 1000)
  cleanupOldLogs(): void {
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
      console.log('🧹 Audit logs cleanup: manteniendo últimos 1000 logs');
    }
  }

  // Generar ID único para log
  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persistir log (en implementación real, esto iría a base de datos)
  private persistLog(logEntry: AuditLogEntry): void {
    // En una implementación real, esto se guardaría en Supabase
    // Por ahora, solo lo guardamos en localStorage para persistencia local
    
    try {
      const existingLogs = localStorage.getItem('audit_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.push(logEntry);
      
      // Mantener solo últimos 100 logs en localStorage
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('⚠️ No se pudo persistir log en localStorage:', error);
    }
  }

  // Exportar a CSV
  private exportToCSV(): string {
    if (this.logs.length === 0) return '';
    
    const headers = Object.keys(this.logs[0]).join(',');
    const rows = this.logs.map(log => 
      Object.values(log).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
}

// Instancia singleton
export const auditLogger = AuditLogger.getInstance();

// Funciones helper para logging común
export const logOrderStatusTransition = (
  userId: string,
  userRole: string,
  orderId: string,
  orderNumber: string,
  customerName: string,
  oldStatus: string,
  newStatus: string,
  reason?: string
) => {
  return auditLogger.logOrderStatusChange(
    userId,
    userRole,
    orderId,
    orderNumber,
    customerName,
    oldStatus,
    newStatus,
    reason
  );
};

export const logUserPermissionAction = (
  userId: string,
  userRole: string,
  action: string,
  targetUserId: string,
  details?: Record<string, any>
) => {
  return auditLogger.logUserAction(
    userId,
    userRole,
    action,
    'user',
    targetUserId,
    details
  );
};

export default auditLogger;
