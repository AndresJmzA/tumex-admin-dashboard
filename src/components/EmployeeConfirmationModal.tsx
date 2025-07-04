import { useState } from "react"
import { 
  AlertTriangle, 
  Trash2, 
  UserCheck, 
  UserX, 
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Employee, EmployeeStatus, Permission } from "@/types/personal"

export type ConfirmationType = "delete" | "status" | "role" | "permissions"

interface EmployeeConfirmationModalProps {
  employee: Employee
  type: ConfirmationType
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: any) => void
}

// Datos mock para roles
const roles = [
  { id: "admin", name: "Administrador", description: "Acceso completo al sistema" },
  { id: "supervisor", name: "Supervisor", description: "Gestión de equipo y aprobaciones" },
  { id: "technician", name: "Técnico", description: "Mantenimiento y soporte técnico" },
  { id: "warehouse", name: "Almacén", description: "Gestión de inventario" },
  { id: "customer_service", name: "Servicio al Cliente", description: "Atención y soporte" },
  { id: "sales", name: "Ventas", description: "Comercialización y negociaciones" }
]

// Permisos organizados por módulo
const permissionsByModule = {
  employees: [
    { id: Permission.EMPLOYEE_READ, label: "Ver empleados", description: "Puede ver información de empleados" },
    { id: Permission.EMPLOYEE_CREATE, label: "Crear empleados", description: "Puede crear nuevos empleados" },
    { id: Permission.EMPLOYEE_UPDATE, label: "Editar empleados", description: "Puede modificar información de empleados" },
    { id: Permission.EMPLOYEE_DELETE, label: "Eliminar empleados", description: "Puede eliminar empleados" }
  ],
  departments: [
    { id: Permission.DEPARTMENT_READ, label: "Ver departamentos", description: "Puede ver información de departamentos" },
    { id: Permission.DEPARTMENT_CREATE, label: "Crear departamentos", description: "Puede crear nuevos departamentos" },
    { id: Permission.DEPARTMENT_UPDATE, label: "Editar departamentos", description: "Puede modificar departamentos" },
    { id: Permission.DEPARTMENT_DELETE, label: "Eliminar departamentos", description: "Puede eliminar departamentos" }
  ],
  schedules: [
    { id: Permission.SCHEDULE_READ, label: "Ver horarios", description: "Puede ver horarios de empleados" },
    { id: Permission.SCHEDULE_CREATE, label: "Crear horarios", description: "Puede crear horarios" },
    { id: Permission.SCHEDULE_UPDATE, label: "Editar horarios", description: "Puede modificar horarios" },
    { id: Permission.SCHEDULE_DELETE, label: "Eliminar horarios", description: "Puede eliminar horarios" }
  ],
  reports: [
    { id: Permission.REPORT_READ, label: "Ver reportes", description: "Puede ver reportes de personal" },
    { id: Permission.REPORT_EXPORT, label: "Exportar reportes", description: "Puede exportar reportes" }
  ]
}

export function EmployeeConfirmationModal({ 
  employee, 
  type, 
  isOpen, 
  onClose, 
  onConfirm 
}: EmployeeConfirmationModalProps) {
  const [formData, setFormData] = useState<any>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE:
        return "bg-green-100 text-green-800"
      case EmployeeStatus.ON_VACATION:
        return "bg-yellow-100 text-yellow-800"
      case EmployeeStatus.INACTIVE:
        return "bg-red-100 text-red-800"
      case EmployeeStatus.ON_LEAVE:
        return "bg-blue-100 text-blue-800"
      case EmployeeStatus.TERMINATED:
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE:
        return "Activo"
      case EmployeeStatus.ON_VACATION:
        return "Vacaciones"
      case EmployeeStatus.INACTIVE:
        return "Inactivo"
      case EmployeeStatus.ON_LEAVE:
        return "Permiso"
      case EmployeeStatus.TERMINATED:
        return "Terminado"
      default:
        return "Desconocido"
    }
  }

  const getModalConfig = () => {
    switch (type) {
      case "delete":
        return {
          title: "Eliminar Empleado",
          description: `¿Estás seguro de que quieres eliminar a ${employee.name}? Esta acción no se puede deshacer.`,
          icon: <Trash2 className="h-6 w-6 text-red-500" />,
          confirmText: "Eliminar",
          confirmVariant: "destructive" as const
        }
      case "status":
        return {
          title: "Cambiar Estado",
          description: `Cambiar el estado de ${employee.name}`,
          icon: <UserCheck className="h-6 w-6 text-blue-500" />,
          confirmText: "Actualizar Estado",
          confirmVariant: "default" as const
        }
      case "role":
        return {
          title: "Asignar Rol",
          description: `Asignar un nuevo rol a ${employee.name}`,
          icon: <Shield className="h-6 w-6 text-purple-500" />,
          confirmText: "Asignar Rol",
          confirmVariant: "default" as const
        }
      case "permissions":
        return {
          title: "Configurar Permisos",
          description: `Configurar permisos para ${employee.name}`,
          icon: <Shield className="h-6 w-6 text-green-500" />,
          confirmText: "Guardar Permisos",
          confirmVariant: "default" as const
        }
      default:
        return {
          title: "Confirmar Acción",
          description: "¿Estás seguro de que quieres continuar?",
          icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
          confirmText: "Confirmar",
          confirmVariant: "default" as const
        }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (type === "status" && !formData.newStatus) {
      newErrors.newStatus = "Debes seleccionar un nuevo estado"
    }

    if (type === "role" && !formData.newRole) {
      newErrors.newRole = "Debes seleccionar un nuevo rol"
    }

    if (type === "delete" && !formData.confirmation) {
      newErrors.confirmation = "Debes confirmar que entiendes las consecuencias"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm(formData)
      onClose()
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handlePermissionToggle = (permission: Permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: (prev.permissions || employee.permissions).includes(permission)
        ? (prev.permissions || employee.permissions).filter((p: Permission) => p !== permission)
        : [...(prev.permissions || employee.permissions), permission]
    }))
  }

  const config = getModalConfig()

  // Para eliminación, usar AlertDialog
  if (type === "delete") {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              {config.icon}
              <span>{config.title}</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {config.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-tumex-primary-100 flex items-center justify-center text-tumex-primary-700 font-semibold">
                    {employee.avatar}
                  </div>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="confirmation"
                  checked={formData.confirmation || false}
                  onCheckedChange={(checked) => handleInputChange("confirmation", checked)}
                />
                <Label htmlFor="confirmation" className="text-sm">
                  Entiendo que esta acción eliminará permanentemente al empleado y todos sus datos asociados.
                </Label>
              </div>
              {errors.confirmation && (
                <p className="text-sm text-red-500">{errors.confirmation}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo de eliminación (opcional)</Label>
              <Textarea
                id="reason"
                placeholder="Especifica el motivo de la eliminación..."
                value={formData.reason || ""}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {config.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  // Para otros tipos, usar Dialog normal
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {config.icon}
            <span>{config.title}</span>
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del empleado */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-tumex-primary-100 flex items-center justify-center text-tumex-primary-700 font-semibold">
                  {employee.avatar}
                </div>
                <div>
                  <p className="font-medium text-lg">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.role}</p>
                  <p className="text-sm text-muted-foreground">{employee.department}</p>
                </div>
                <Badge className={getStatusColor(employee.status)}>
                  {getStatusText(employee.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contenido específico según el tipo */}
          {type === "status" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="newStatus">Nuevo Estado *</Label>
                <Select
                  value={formData.newStatus || ""}
                  onValueChange={(value) => handleInputChange("newStatus", value)}
                >
                  <SelectTrigger className={errors.newStatus ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar nuevo estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EmployeeStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(status)}>
                            {getStatusText(status)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.newStatus && <p className="text-sm text-red-500">{errors.newStatus}</p>}
              </div>

              <div>
                <Label htmlFor="statusReason">Motivo del cambio (opcional)</Label>
                <Textarea
                  id="statusReason"
                  placeholder="Especifica el motivo del cambio de estado..."
                  value={formData.statusReason || ""}
                  onChange={(e) => handleInputChange("statusReason", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {type === "role" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="newRole">Nuevo Rol *</Label>
                <Select
                  value={formData.newRole || ""}
                  onValueChange={(value) => handleInputChange("newRole", value)}
                >
                  <SelectTrigger className={errors.newRole ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar nuevo rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.newRole && <p className="text-sm text-red-500">{errors.newRole}</p>}
              </div>

              <div>
                <Label htmlFor="roleReason">Motivo del cambio (opcional)</Label>
                <Textarea
                  id="roleReason"
                  placeholder="Especifica el motivo del cambio de rol..."
                  value={formData.roleReason || ""}
                  onChange={(e) => handleInputChange("roleReason", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          {type === "permissions" && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Selecciona los permisos que tendrá este empleado. Los permisos actuales están marcados.
              </div>
              
              {Object.entries(permissionsByModule).map(([module, permissions]) => (
                <Card key={module}>
                  <CardHeader>
                    <CardTitle className="text-base capitalize">
                      {module === "employees" ? "Empleados" : 
                       module === "departments" ? "Departamentos" :
                       module === "schedules" ? "Horarios" :
                       module === "reports" ? "Reportes" : module}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={permission.id}
                            checked={(formData.permissions || employee.permissions).includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <div className="space-y-1">
                            <Label htmlFor={permission.id} className="text-sm font-medium">
                              {permission.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} variant={config.confirmVariant}>
            {config.confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 