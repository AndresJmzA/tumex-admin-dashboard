// Tipos para el sistema de equipos de orden
// Permite editar equipos de una orden específica sin afectar el inventario maestro

// ============================================================================
// TIPOS PRINCIPALES
// ============================================================================

/**
 * Equipo específico de una orden
 * Representa un equipo que ha sido agregado a una orden específica
 */
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

/**
 * Paquete predefinido de equipos
 * Conjunto de equipos que se pueden aplicar como un paquete completo
 */
export interface EquipmentPackage {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  equipment: PackageEquipment[];
  created_at: string;
  updated_at: string;
}

/**
 * Equipo dentro de un paquete
 * Representa un equipo individual dentro de un paquete predefinido
 */
export interface PackageEquipment {
  product_id: string;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
}

/**
 * Producto disponible en el inventario
 * Información de productos que se pueden agregar a órdenes
 */
export interface AvailableProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_available: number;
  stock_warning: boolean;
  description?: string;
}

// ============================================================================
// TIPOS PARA FILTROS Y CONSULTAS
// ============================================================================

/**
 * Filtros para consultar equipos de orden
 */
export interface EquipmentFilters {
  order_id?: string;
  category?: string;
  confirmed?: boolean;
  is_from_package?: boolean;
  package_id?: string;
  search?: string;
  price_min?: number;
  price_max?: number;
}

/**
 * Filtros para consultar paquetes
 */
export interface PackageFilters {
  category?: string;
  price_min?: number;
  price_max?: number;
  search?: string;
}

/**
 * Filtros para consultar productos disponibles
 */
export interface ProductFilters {
  category?: string;
  in_stock?: boolean;
  price_min?: number;
  price_max?: number;
  search?: string;
}

// ============================================================================
// TIPOS PARA RESPUESTAS
// ============================================================================

/**
 * Respuesta paginada de equipos de orden
 */
export interface EquipmentResponse {
  data: OrderEquipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Respuesta de paquetes disponibles
 */
export interface PackageResponse {
  data: EquipmentPackage[];
  total: number;
}

/**
 * Respuesta de productos disponibles
 */
export interface ProductResponse {
  data: AvailableProduct[];
  total: number;
}

// ============================================================================
// TIPOS PARA ESTADÍSTICAS
// ============================================================================

/**
 * Estadísticas de equipos de una orden
 */
export interface OrderEquipmentStats {
  totalEquipment: number;
  confirmedEquipment: number;
  pendingEquipment: number;
  totalValue: number;
  confirmedValue: number;
  pendingValue: number;
  packagesApplied: number;
  categories: {
    [category: string]: {
      count: number;
      value: number;
    };
  };
}

/**
 * Estadísticas de paquetes
 */
export interface PackageStats {
  totalPackages: number;
  packagesByCategory: {
    [category: string]: number;
  };
  averagePackagePrice: number;
  mostUsedPackages: Array<{
    package_id: string;
    package_name: string;
    usage_count: number;
  }>;
}

// ============================================================================
// TIPOS PARA VALIDACIÓN
// ============================================================================

/**
 * Resultado de validación de stock
 */
export interface StockValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  unavailableProducts: Array<{
    product_id: string;
    product_name: string;
    requested_quantity: number;
    available_quantity: number;
  }>;
}

/**
 * Resultado de validación de paquete
 */
export interface PackageValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  missingProducts: Array<{
    product_id: string;
    product_name: string;
    required_quantity: number;
    available_quantity: number;
  }>;
}

// ============================================================================
// TIPOS PARA OPERACIONES
// ============================================================================

/**
 * Datos para agregar equipo a una orden
 */
export interface AddEquipmentData {
  product_id: string;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
  notes?: string;
  is_from_package?: boolean;
  package_id?: string;
}

/**
 * Datos para actualizar equipo de una orden
 */
export interface UpdateEquipmentData {
  quantity?: number;
  price?: number;
  notes?: string;
  confirmed?: boolean;
}

/**
 * Datos para aplicar paquete a una orden
 */
export interface ApplyPackageData {
  package_id: string;
  replace_existing?: boolean;
  confirm_equipment?: boolean;
}

// ============================================================================
// TIPOS PARA EVENTOS Y NOTIFICACIONES
// ============================================================================

/**
 * Eventos de equipos de orden
 */
export type EquipmentEventType = 
  | 'equipment_added'
  | 'equipment_updated'
  | 'equipment_removed'
  | 'package_applied'
  | 'equipment_confirmed'
  | 'stock_warning'
  | 'stock_error';

/**
 * Evento de equipo de orden
 */
export interface EquipmentEvent {
  id: string;
  order_id: string;
  event_type: EquipmentEventType;
  equipment_id?: string;
  package_id?: string;
  user_id: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Notificación de equipos de orden
 */
export interface EquipmentNotification {
  id: string;
  order_id: string;
  type: 'stock_warning' | 'equipment_confirmed' | 'package_applied' | 'validation_error';
  title: string;
  message: string;
  recipient_id: string;
  recipient_role: string;
  read: boolean;
  created_at: string;
  action_required?: boolean;
  action_url?: string;
}

// ============================================================================
// TIPOS PARA CONFIGURACIÓN
// ============================================================================

/**
 * Configuración de categorías de equipos
 */
export interface EquipmentCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  sort_order: number;
}

/**
 * Configuración de precios
 */
export interface PriceConfiguration {
  type: 'PMG' | 'Seguro' | 'Manual';
  manual_price?: number;
  discount_percentage?: number;
  markup_percentage?: number;
}

/**
 * Configuración de validaciones
 */
export interface ValidationConfiguration {
  check_stock: boolean;
  allow_overstock: boolean;
  max_overstock_percentage: number;
  require_confirmation: boolean;
  auto_confirm_packages: boolean;
}

// ============================================================================
// TIPOS PARA HISTORIAL Y AUDITORÍA
// ============================================================================

/**
 * Historial de cambios de equipos de orden
 */
export interface EquipmentChangeHistory {
  id: string;
  order_id: string;
  equipment_id: string;
  action: 'added' | 'updated' | 'removed' | 'confirmed' | 'unconfirmed';
  changed_by: string;
  changed_at: string;
  previous_value?: any;
  new_value?: any;
  notes?: string;
}

/**
 * Auditoría de equipos de orden
 */
export interface EquipmentAuditLog {
  id: string;
  order_id: string;
  action: 'view' | 'edit' | 'add' | 'remove' | 'confirm' | 'apply_package';
  performed_by: string;
  performed_at: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// ============================================================================
// TIPOS PARA EXPORTACIÓN E IMPORTACIÓN
// ============================================================================

/**
 * Datos para exportar equipos de orden
 */
export interface EquipmentExportData {
  order_id: string;
  order_number: string;
  doctor_name: string;
  surgery_date: string;
  equipment: OrderEquipment[];
  total_value: number;
  confirmed_value: number;
  export_date: string;
  exported_by: string;
}

/**
 * Datos para importar equipos de orden
 */
export interface EquipmentImportData {
  order_id: string;
  equipment: AddEquipmentData[];
  import_source: string;
  imported_by: string;
  import_date: string;
  validation_results?: StockValidationResult;
}

// ============================================================================
// TIPOS PARA REPORTES
// ============================================================================

/**
 * Reporte de equipos por período
 */
export interface EquipmentReport {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_orders: number;
    total_equipment: number;
    total_value: number;
    average_order_value: number;
    most_used_equipment: Array<{
      product_name: string;
      usage_count: number;
      total_value: number;
    }>;
    most_used_packages: Array<{
      package_name: string;
      usage_count: number;
      total_value: number;
    }>;
  };
  details: {
    orders: Array<{
      order_id: string;
      order_number: string;
      doctor_name: string;
      surgery_date: string;
      equipment_count: number;
      total_value: number;
      confirmed_value: number;
    }>;
  };
}

// ============================================================================
// TIPOS PARA HOOKS Y ESTADOS
// ============================================================================

/**
 * Estado de carga de equipos
 */
export interface EquipmentLoadingState {
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

/**
 * Estado de equipos de orden para hooks
 */
export interface EquipmentState {
  equipment: OrderEquipment[];
  loading: EquipmentLoadingState;
  stats: OrderEquipmentStats | null;
  validation: StockValidationResult | null;
}

/**
 * Acciones para el reducer de equipos
 */
export type EquipmentAction = 
  | { type: 'SET_EQUIPMENT'; payload: OrderEquipment[] }
  | { type: 'ADD_EQUIPMENT'; payload: OrderEquipment }
  | { type: 'UPDATE_EQUIPMENT'; payload: { id: string; updates: Partial<OrderEquipment> } }
  | { type: 'REMOVE_EQUIPMENT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STATS'; payload: OrderEquipmentStats }
  | { type: 'SET_VALIDATION'; payload: StockValidationResult }
  | { type: 'CLEAR_EQUIPMENT' };

// ============================================================================
// TIPOS PARA UTILIDADES
// ============================================================================

/**
 * Opciones de ordenamiento para equipos
 */
export type EquipmentSortOption = 
  | 'name_asc'
  | 'name_desc'
  | 'category_asc'
  | 'category_desc'
  | 'price_asc'
  | 'price_desc'
  | 'quantity_asc'
  | 'quantity_desc'
  | 'confirmed_asc'
  | 'confirmed_desc'
  | 'created_at_asc'
  | 'created_at_desc';

/**
 * Opciones de agrupación para equipos
 */
export type EquipmentGroupOption = 
  | 'none'
  | 'category'
  | 'confirmed'
  | 'package'
  | 'price_range';

/**
 * Configuración de vista de equipos
 */
export interface EquipmentViewConfig {
  showPrices: boolean;
  showStockInfo: boolean;
  showPackageInfo: boolean;
  showConfirmationStatus: boolean;
  sortBy: EquipmentSortOption;
  groupBy: EquipmentGroupOption;
  compactView: boolean;
}

// ============================================================================
// EXPORTACIONES PRINCIPALES
// ============================================================================

// Todos los tipos están exportados individualmente arriba
// No es necesario re-exportarlos aquí para evitar conflictos 