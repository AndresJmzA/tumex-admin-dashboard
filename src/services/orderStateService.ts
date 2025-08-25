import { supabase } from '@/supabaseClient';
import { orderService, ExtendedOrder } from './orderService';

// Estados de orden según el flujo de TUMex
export type OrderStatus = 
  | 'created'                    // Orden creada
  | 'pending_approval'           // Pendiente de aprobación (Gerente Operativo)
  | 'approved'                   // Aprobada por Gerente Operativo
  | 'doctor_confirmation'        // Confirmación con médico (Gerente Comercial)
  | 'doctor_approved'            // Aprobada por médico
  | 'doctor_rejected'            // Rechazada por médico
  | 'templates_ready'            // Plantillas de almacén listas (Jefe de Almacén)
  | 'technicians_assigned'       // Técnicos asignados (Gerente Operativo)
  | 'equipment_transported'      // Equipos trasladados (Técnicos)
  | 'remission_created'          // Remisión creada (Gerente Administrativo)
  | 'surgery_prepared'           // Quirófano preparado (Técnicos)
  | 'surgery_completed'          // Cirugía completada (Técnicos)
  | 'ready_for_billing'          // Lista para facturar
  | 'billed'                     // Facturada
  | 'cancelled'                  // Cancelada
  | 'rejected';                  // Rechazada

// Roles que pueden realizar transiciones
export type UserRole = 
  | 'admin'
  | 'gerente_operativo'
  | 'gerente_comercial'
  | 'jefe_almacen'
  | 'tecnico'
  | 'gerente_administrativo'
  | 'medico';

// Información de transición de estado
export interface StateTransition {
  from: OrderStatus;
  to: OrderStatus;
  allowedRoles: UserRole[];
  requiredConditions?: string[];
  automatic?: boolean;
  description: string;
  estimatedDuration?: number; // en minutos
}

// Historial de cambios de estado
export interface StatusHistoryEntry {
  id: string;
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedBy: string;
  changedAt: string;
  notes?: string;
  metadata?: {
    role: UserRole;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

// Validación de transición
export interface TransitionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredActions?: string[];
}

// Configuración del workflow
export interface WorkflowConfig {
  autoAdvance: boolean;
  requireApproval: boolean;
  notifyOnTransition: boolean;
  logAllChanges: boolean;
}

class OrderStateService {
  private workflowConfig: WorkflowConfig = {
    autoAdvance: false,
    requireApproval: true,
    notifyOnTransition: true,
    logAllChanges: true
  };

  // Definición del flujo de estados según flujo-tumex.md
  private readonly stateTransitions: StateTransition[] = [
    // 1. Recepción de la Orden
    {
      from: 'created',
      to: 'pending_approval',
      allowedRoles: ['admin', 'gerente_operativo'],
      description: 'Orden creada, pendiente de revisión',
      estimatedDuration: 30
    },

    // 2. Revisión y Aceptación de la Orden
    {
      from: 'pending_approval',
      to: 'approved',
      allowedRoles: ['gerente_operativo'],
      requiredConditions: ['viability_check', 'resource_availability'],
      description: 'Orden aprobada por Gerente Operativo',
      estimatedDuration: 60
    },
    {
      from: 'pending_approval',
      to: 'rejected',
      allowedRoles: ['gerente_operativo'],
      description: 'Orden rechazada por Gerente Operativo',
      estimatedDuration: 15
    },

    // 3. Confirmación de Equipos con el Médico
    {
      from: 'approved',
      to: 'doctor_confirmation',
      allowedRoles: ['gerente_comercial'],
      description: 'Enviada para confirmación médica',
      estimatedDuration: 120
    },
    {
      from: 'doctor_confirmation',
      to: 'doctor_approved',
      allowedRoles: ['medico', 'gerente_comercial'],
      description: 'Aprobada por médico',
      estimatedDuration: 30
    },
    {
      from: 'doctor_confirmation',
      to: 'doctor_rejected',
      allowedRoles: ['medico', 'gerente_comercial'],
      description: 'Rechazada por médico',
      estimatedDuration: 15
    },

    // 4. Generación de Plantillas de Almacén
    {
      from: 'doctor_approved',
      to: 'templates_ready',
      allowedRoles: ['jefe_almacen'],
      requiredConditions: ['templates_generated'],
      description: 'Plantillas de almacén generadas',
      estimatedDuration: 45
    },

    // 5. Coordinación de Cirugía y Equipos
    {
      from: 'templates_ready',
      to: 'technicians_assigned',
      allowedRoles: ['gerente_operativo'],
      requiredConditions: ['technicians_available'],
      description: 'Técnicos asignados',
      estimatedDuration: 30
    },

    // 6. Traslado de Equipos e Insumos
    {
      from: 'technicians_assigned',
      to: 'equipment_transported',
      allowedRoles: ['tecnico'],
      requiredConditions: ['evidence_uploaded'],
      description: 'Equipos trasladados al sitio',
      estimatedDuration: 90
    },

    // 7. Nota de Remisión
    {
      from: 'equipment_transported',
      to: 'remission_created',
      allowedRoles: ['gerente_administrativo'],
      requiredConditions: ['remission_generated'],
      description: 'Remisión creada',
      estimatedDuration: 30
    },

    // 8. Preparación de Quirófano
    {
      from: 'remission_created',
      to: 'surgery_prepared',
      allowedRoles: ['tecnico'],
      requiredConditions: ['evidence_uploaded'],
      description: 'Quirófano preparado',
      estimatedDuration: 60
    },

    // 9. Finalización de Cirugía
    {
      from: 'surgery_prepared',
      to: 'surgery_completed',
      allowedRoles: ['tecnico'],
      requiredConditions: ['evidence_uploaded'],
      description: 'Cirugía completada',
      estimatedDuration: 0 // Variable según cirugía
    },

    // 10. Facturación
    {
      from: 'surgery_completed',
      to: 'ready_for_billing',
      allowedRoles: ['gerente_administrativo'],
      description: 'Lista para facturar',
      estimatedDuration: 60
    },
    {
      from: 'ready_for_billing',
      to: 'billed',
      allowedRoles: ['gerente_administrativo'],
      requiredConditions: ['billing_completed'],
      description: 'Facturación completada',
      estimatedDuration: 30
    },

    // Cancelaciones (desde cualquier estado)
    {
      from: 'created',
      to: 'cancelled',
      allowedRoles: ['admin', 'gerente_operativo'],
      description: 'Orden cancelada',
      estimatedDuration: 5
    },
    {
      from: 'pending_approval',
      to: 'cancelled',
      allowedRoles: ['admin', 'gerente_operativo'],
      description: 'Orden cancelada',
      estimatedDuration: 5
    },
    {
      from: 'approved',
      to: 'cancelled',
      allowedRoles: ['admin', 'gerente_operativo'],
      description: 'Orden cancelada',
      estimatedDuration: 5
    }
  ];

  // Obtener transiciones válidas para un estado
  getValidTransitions(currentStatus: OrderStatus, userRole: UserRole): StateTransition[] {
    return this.stateTransitions.filter(transition => 
      transition.from === currentStatus && 
      transition.allowedRoles.includes(userRole)
    );
  }

  // Validar si una transición es válida
  validateTransition(
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    userRole: UserRole,
    order?: ExtendedOrder
  ): TransitionValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requiredActions: string[] = [];

    // Buscar la transición
    const transition = this.stateTransitions.find(t => 
      t.from === fromStatus && t.to === toStatus
    );

    if (!transition) {
      errors.push(`Transición no válida: ${fromStatus} → ${toStatus}`);
      return { isValid: false, errors, warnings, requiredActions };
    }

    // Verificar permisos de rol
    if (!transition.allowedRoles.includes(userRole)) {
      errors.push(`El rol ${userRole} no tiene permisos para realizar esta transición`);
    }

    // Verificar condiciones requeridas
    if (transition.requiredConditions) {
      for (const condition of transition.requiredConditions) {
        if (!this.checkCondition(condition, order)) {
          requiredActions.push(this.getConditionDescription(condition));
        }
      }
    }

    // Validaciones específicas por transición
    switch (toStatus) {
      case 'approved':
        if (!this.validateApprovalConditions(order)) {
          errors.push('No se cumplen las condiciones para aprobar la orden');
        }
        break;
      
      case 'doctor_approved':
        if (!this.validateDoctorApprovalConditions(order)) {
          errors.push('No se cumplen las condiciones para la aprobación médica');
        }
        break;
      
      case 'equipment_transported':
      case 'surgery_prepared':
      case 'surgery_completed':
        if (!this.validateEvidenceConditions(order)) {
          warnings.push('Se requiere evidencia fotográfica para esta transición');
        }
        break;
      
      case 'templates_ready':
        if (!this.validateTemplateConditions(order)) {
          warnings.push('Se requiere generar plantillas de almacén');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiredActions
    };
  }

  // Realizar transición de estado
  async transitionOrder(
    orderId: string,
    toStatus: OrderStatus,
    userRole: UserRole,
    userId: string,
    notes?: string
  ): Promise<ExtendedOrder> {
    try {
      // Obtener orden actual
      const currentOrder = await orderService.getOrderById(orderId);
      if (!currentOrder) {
        throw new Error('Orden no encontrada');
      }

      // Validar transición
      const validation = this.validateTransition(
        currentOrder.status as OrderStatus,
        toStatus,
        userRole,
        currentOrder
      );

      if (!validation.isValid) {
        throw new Error(`Transición no válida: ${validation.errors.join(', ')}`);
      }

      // Actualizar estado en la base de datos
      const updatedOrder = await orderService.updateOrderStatus(orderId, toStatus as any, notes);

      // Registrar en historial
      await this.logStatusChange({
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId,
        fromStatus: currentOrder.status as OrderStatus,
        toStatus,
        changedBy: userId,
        changedAt: new Date().toISOString(),
        notes,
        metadata: {
          role: userRole,
          ipAddress: 'N/A', // En producción se obtendría del contexto
          userAgent: 'N/A',
          location: 'N/A'
        }
      });

      // Notificar transición si está habilitado
      if (this.workflowConfig.notifyOnTransition) {
        await this.notifyTransition(updatedOrder, toStatus, userRole);
      }

      // Auto-avanzar si está habilitado
      if (this.workflowConfig.autoAdvance) {
        await this.autoAdvanceIfPossible(updatedOrder);
      }

      return updatedOrder;
    } catch (error) {
      console.error('Error en transitionOrder:', error);
      throw error;
    }
  }

  // Obtener historial de cambios de estado
  async getStatusHistory(orderId: string): Promise<StatusHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('OrderStatusHistory')
        .select('*')
        .eq('order_id', orderId)
        .order('changed_at', { ascending: false });

      if (error) {
        console.error('Error fetching status history:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getStatusHistory:', error);
      throw error;
    }
  }

  // Rollback de estado (solo para casos especiales)
  async rollbackStatus(
    orderId: string,
    targetStatus: OrderStatus,
    userRole: UserRole,
    userId: string,
    reason: string
  ): Promise<ExtendedOrder> {
    // Solo admin y gerente operativo pueden hacer rollback
    if (!['admin', 'gerente_operativo'].includes(userRole)) {
      throw new Error('No tienes permisos para realizar rollback');
    }

    const currentOrder = await orderService.getOrderById(orderId);
    if (!currentOrder) {
      throw new Error('Orden no encontrada');
    }

    // Validar que el rollback sea a un estado anterior
    const currentIndex = this.getStatusIndex(currentOrder.status as OrderStatus);
    const targetIndex = this.getStatusIndex(targetStatus);

    if (targetIndex >= currentIndex) {
      throw new Error('Solo se puede hacer rollback a estados anteriores');
    }

    return await this.transitionOrder(orderId, targetStatus, userRole, userId, `Rollback: ${reason}`);
  }

  // Obtener estadísticas de transiciones
  async getTransitionStats(): Promise<{
    totalTransitions: number;
    averageTimePerTransition: number;
    transitionsByRole: Partial<Record<UserRole, number>>;
    mostCommonTransitions: Array<{ from: string; to: string; count: number }>;
  }> {
    try {
      const { data, error } = await supabase
        .from('OrderStatusHistory')
        .select('*');

      if (error) {
        console.error('Error fetching transition stats:', error);
        throw error;
      }

      const transitions = data || [];
      const totalTransitions = transitions.length;

      // Calcular tiempo promedio por transición
      let totalTime = 0;
      const transitionsByRole: Partial<Record<UserRole, number>> = {};
      const transitionCounts: Record<string, number> = {};

      transitions.forEach(transition => {
        const role = transition.metadata?.role as UserRole;
        if (role) {
          transitionsByRole[role] = (transitionsByRole[role] || 0) + 1;
        }

        const transitionKey = `${transition.from_status}→${transition.to_status}`;
        transitionCounts[transitionKey] = (transitionCounts[transitionKey] || 0) + 1;
      });

      const mostCommonTransitions = Object.entries(transitionCounts)
        .map(([key, count]) => {
          const [from, to] = key.split('→');
          return { from, to, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalTransitions,
        averageTimePerTransition: totalTransitions > 0 ? totalTime / totalTransitions : 0,
        transitionsByRole,
        mostCommonTransitions
      };
    } catch (error) {
      console.error('Error en getTransitionStats:', error);
      throw error;
    }
  }

  // Configurar workflow
  setWorkflowConfig(config: Partial<WorkflowConfig>): void {
    this.workflowConfig = { ...this.workflowConfig, ...config };
  }

  // Métodos privados de validación
  private checkCondition(condition: string, order?: ExtendedOrder): boolean {
    switch (condition) {
      case 'viability_check':
        return this.checkViabilityConditions(order);
      case 'resource_availability':
        return this.checkResourceAvailability(order);
      case 'templates_generated':
        return this.checkTemplatesGenerated(order);
      case 'technicians_available':
        return this.checkTechniciansAvailable(order);
      case 'evidence_uploaded':
        return this.checkEvidenceUploaded(order);
      case 'remission_generated':
        return this.checkRemissionGenerated(order);
      case 'billing_completed':
        return this.checkBillingCompleted(order);
      default:
        return true;
    }
  }

  private getConditionDescription(condition: string): string {
    const descriptions: Record<string, string> = {
      'viability_check': 'Verificar viabilidad de la orden',
      'resource_availability': 'Verificar disponibilidad de recursos',
      'templates_generated': 'Generar plantillas de almacén',
      'technicians_available': 'Asignar técnicos disponibles',
      'evidence_uploaded': 'Subir evidencia fotográfica',
      'remission_generated': 'Generar nota de remisión',
      'billing_completed': 'Completar facturación'
    };
    return descriptions[condition] || `Completar: ${condition}`;
  }

  private checkViabilityConditions(order?: ExtendedOrder): boolean {
    // Mock validation - en producción se validaría contra reglas de negocio
    return true;
  }

  private checkResourceAvailability(order?: ExtendedOrder): boolean {
    // Mock validation - en producción se validaría disponibilidad de equipos
    return true;
  }

  private checkTemplatesGenerated(order?: ExtendedOrder): boolean {
    // Mock validation - en producción se validaría que existan plantillas
    return true;
  }

  private checkTechniciansAvailable(order?: ExtendedOrder): boolean {
    // Mock validation - en producción se validaría disponibilidad de técnicos
    return true;
  }

  private checkEvidenceUploaded(order?: ExtendedOrder): boolean {
    // Mock validation - en producción se validaría evidencia fotográfica
    return true;
  }

  private checkRemissionGenerated(order?: ExtendedOrder): boolean {
    // Mock validation - en producción se validaría remisión
    return true;
  }

  private checkBillingCompleted(order?: ExtendedOrder): boolean {
    // Mock validation - en producción se validaría facturación
    return true;
  }

  private validateApprovalConditions(order?: ExtendedOrder): boolean {
    // Validaciones específicas para aprobación
    return order?.status === 'pending_approval' as any;
  }

  private validateDoctorApprovalConditions(order?: ExtendedOrder): boolean {
    // Validaciones específicas para aprobación médica
    return order?.status === 'doctor_confirmation';
  }

  private validateEvidenceConditions(order?: ExtendedOrder): boolean {
    // Validaciones para estados que requieren evidencia
    return true; // Mock
  }

  private validateTemplateConditions(order?: ExtendedOrder): boolean {
    // Validaciones para plantillas
    return true; // Mock
  }

  private getStatusIndex(status: OrderStatus): number {
    const statusOrder: OrderStatus[] = [
      'created',
      'pending_approval',
      'approved',
      'doctor_confirmation',
      'doctor_approved',
      'templates_ready',
      'technicians_assigned',
      'equipment_transported',
      'remission_created',
      'surgery_prepared',
      'surgery_completed',
      'ready_for_billing',
      'billed'
    ];
    return statusOrder.indexOf(status);
  }

  private async logStatusChange(entry: StatusHistoryEntry): Promise<void> {
    try {
      const { error } = await supabase
        .from('OrderStatusHistory')
        .insert({
          id: entry.id,
          order_id: entry.orderId,
          from_status: entry.fromStatus,
          to_status: entry.toStatus,
          changed_by: entry.changedBy,
          changed_at: entry.changedAt,
          notes: entry.notes,
          metadata: entry.metadata
        });

      if (error) {
        console.error('Error logging status change:', error);
      }
    } catch (error) {
      console.error('Error en logStatusChange:', error);
    }
  }

  private async notifyTransition(
    order: ExtendedOrder,
    newStatus: OrderStatus,
    userRole: UserRole
  ): Promise<void> {
    // Mock notification - en producción se enviarían notificaciones reales
    console.log(`Notificación: Orden ${order.orderId} cambió a ${newStatus} por ${userRole}`);
  }

  private async autoAdvanceIfPossible(order: ExtendedOrder): Promise<void> {
    // Lógica para auto-avanzar estados cuando sea apropiado
    // Por ejemplo, si todos los técnicos están listos, auto-avanzar a siguiente estado
    console.log('Auto-advance check for order:', order.orderId);
  }

  // Obtener información del workflow
  getWorkflowInfo(): {
    totalStates: number;
    totalTransitions: number;
    autoAdvanceEnabled: boolean;
    requireApproval: boolean;
  } {
    return {
      totalStates: 14, // Estados principales
      totalTransitions: this.stateTransitions.length,
      autoAdvanceEnabled: this.workflowConfig.autoAdvance,
      requireApproval: this.workflowConfig.requireApproval
    };
  }
}

export const orderStateService = new OrderStateService(); 