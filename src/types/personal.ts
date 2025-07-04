// Tipos de usuario/empleado
export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor', 
  TECHNICIAN = 'technician',
  WAREHOUSE = 'warehouse',
  CUSTOMER_SERVICE = 'customer_service'
}

// Departamentos
export enum Department {
  ADMINISTRATION = 'administration',
  TECHNICAL = 'technical',
  WAREHOUSE = 'warehouse',
  CUSTOMER_SERVICE = 'customer_service',
  SALES = 'sales',
  FINANCE = 'finance'
}

// Estados de empleado
export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_VACATION = 'vacation',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated'
}

// Permisos por módulo
export enum Permission {
  // Empleados
  EMPLOYEE_READ = 'employee:read',
  EMPLOYEE_CREATE = 'employee:create',
  EMPLOYEE_UPDATE = 'employee:update',
  EMPLOYEE_DELETE = 'employee:delete',
  
  // Departamentos
  DEPARTMENT_READ = 'department:read',
  DEPARTMENT_CREATE = 'department:create',
  DEPARTMENT_UPDATE = 'department:update',
  DEPARTMENT_DELETE = 'department:delete',
  
  // Roles
  ROLE_READ = 'role:read',
  ROLE_CREATE = 'role:create',
  ROLE_UPDATE = 'role:update',
  ROLE_DELETE = 'role:delete',
  
  // Horarios
  SCHEDULE_READ = 'schedule:read',
  SCHEDULE_CREATE = 'schedule:create',
  SCHEDULE_UPDATE = 'schedule:update',
  SCHEDULE_DELETE = 'schedule:delete',
  
  // Solicitudes
  REQUEST_READ = 'request:read',
  REQUEST_CREATE = 'request:create',
  REQUEST_APPROVE = 'request:approve',
  REQUEST_REJECT = 'request:reject',
  
  // Reportes
  REPORT_READ = 'report:read',
  REPORT_EXPORT = 'report:export',
  
  // Actividad
  ACTIVITY_READ = 'activity:read',
  ACTIVITY_EXPORT = 'activity:export'
}

// Interface para empleado
export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  status: EmployeeStatus
  avatar: string
  hireDate: string
  supervisor: string
  permissions: Permission[]
  salary?: number
  position?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  documents?: {
    id: string
    name: string
    type: string
    url: string
    uploadDate: string
  }[]
  evaluations?: {
    id: string
    date: string
    evaluator: string
    score: number
    comments: string
  }[]
}

// Interface para departamento
export interface DepartmentInfo {
  id: string
  name: string
  description?: string
  manager?: string
  employeeCount: number
  color: string
  budget?: number
  location?: string
}

// Interface para rol
export interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

// Interface para solicitud de tiempo libre
export interface TimeOffRequest {
  id: string
  employeeId: string
  employeeName: string
  type: 'vacation' | 'sick_leave' | 'personal' | 'other'
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approver?: string
  approvedAt?: string
  createdAt: string
}

// Interface para horario
export interface Schedule {
  id: string
  employeeId: string
  dayOfWeek: number // 0-6 (Domingo-Sábado)
  startTime: string
  endTime: string
  isWorkingDay: boolean
  breakStart?: string
  breakEnd?: string
}

// Interface para actividad/auditoría
export interface ActivityLog {
  id: string
  employeeId: string
  employeeName: string
  action: string
  module: string
  details?: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

// Interface para métricas de empleado
export interface EmployeeMetrics {
  employeeId: string
  period: string
  productivity: number
  attendance: number
  tasksCompleted: number
  tasksAssigned: number
  averageRating: number
  overtimeHours: number
  vacationDaysUsed: number
  vacationDaysRemaining: number
}

// Interface para filtros de búsqueda
export interface EmployeeFilters {
  search?: string
  department?: string
  status?: EmployeeStatus
  role?: string
  supervisor?: string
  hireDateFrom?: string
  hireDateTo?: string
  sortBy?: 'name' | 'department' | 'hireDate' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Interface para respuesta paginada
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Interface para estadísticas de personal
export interface PersonalStats {
  totalEmployees: number
  activeEmployees: number
  onVacation: number
  inactiveEmployees: number
  departments: {
    name: string
    count: number
    percentage: number
  }[]
  recentHires: number
  turnoverRate: number
  averageTenure: number
}

// Interface para configuración de permisos
export interface PermissionConfig {
  module: string
  permissions: {
    [key in Permission]?: {
      label: string
      description: string
      roles: UserRole[]
    }
  }
}

// Interface para formulario de empleado
export interface EmployeeFormData {
  personalInfo: {
    name: string
    email: string
    phone: string
    emergencyContact?: {
      name: string
      phone: string
      relationship: string
    }
  }
  workInfo: {
    role: string
    department: string
    supervisor: string
    position?: string
    salary?: number
    hireDate: string
  }
  permissions: Permission[]
  documents?: File[]
}

// Interface para respuesta de API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
} 