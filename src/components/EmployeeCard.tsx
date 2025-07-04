import { useState } from "react"
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  User,
  Building2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import { Employee, EmployeeStatus } from "@/types/personal"

interface EmployeeCardProps {
  employee: Employee
  onEdit?: (employee: Employee) => void
  onDelete?: (employee: Employee) => void
  onView?: (employee: Employee) => void
  viewMode?: "grid" | "list"
}

export function EmployeeCard({ 
  employee, 
  onEdit, 
  onDelete, 
  onView,
  viewMode = "grid" 
}: EmployeeCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE:
        return "bg-green-100 text-green-800 border-green-200"
      case EmployeeStatus.ON_VACATION:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case EmployeeStatus.INACTIVE:
        return "bg-red-100 text-red-800 border-red-200"
      case EmployeeStatus.ON_LEAVE:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case EmployeeStatus.TERMINATED:
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleEdit = () => {
    onEdit?.(employee)
  }

  const handleDelete = () => {
    onDelete?.(employee)
  }

  const handleView = () => {
    onView?.(employee)
  }

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-tumex-primary-100 flex items-center justify-center text-tumex-primary-700 font-semibold">
                {employee.avatar}
              </div>
              <div>
                <h3 className="font-semibold">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">{employee.role}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-right">
                <p className="font-medium">{employee.department}</p>
                <p className="text-muted-foreground">{employee.email}</p>
              </div>
              <Badge className={getStatusColor(employee.status)}>
                {getStatusText(employee.status)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleView}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-tumex-primary-100 flex items-center justify-center text-tumex-primary-700 font-semibold">
                {employee.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{employee.name}</h3>
                <p className="text-xs text-muted-foreground">{employee.role}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(employee.status)}>
                {getStatusText(employee.status)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleView}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center">
                <Building2 className="h-3 w-3 mr-1" />
                Departamento:
              </span>
              <span className="font-medium">{employee.department}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                Email:
              </span>
              <span className="font-medium truncate max-w-[120px]">{employee.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center">
                <User className="h-3 w-3 mr-1" />
                Supervisor:
              </span>
              <span className="font-medium">{employee.supervisor}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Fecha de ingreso:
              </span>
              <span className="font-medium">{formatDate(employee.hireDate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para detalles rápidos */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Información del Empleado</DialogTitle>
            <DialogDescription>
              Detalles completos de {employee.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-tumex-primary-100 flex items-center justify-center text-tumex-primary-700 font-semibold text-lg">
                {employee.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">{employee.role}</p>
                <Badge className={getStatusColor(employee.status)}>
                  {getStatusText(employee.status)}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Departamento</p>
                <p className="text-muted-foreground">{employee.department}</p>
              </div>
              <div>
                <p className="font-medium">Supervisor</p>
                <p className="text-muted-foreground">{employee.supervisor}</p>
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-muted-foreground">{employee.email}</p>
              </div>
              <div>
                <p className="font-medium">Teléfono</p>
                <p className="text-muted-foreground">{employee.phone}</p>
              </div>
              <div>
                <p className="font-medium">Fecha de ingreso</p>
                <p className="text-muted-foreground">{formatDate(employee.hireDate)}</p>
              </div>
              <div>
                <p className="font-medium">ID de empleado</p>
                <p className="text-muted-foreground">{employee.id}</p>
              </div>
            </div>

            {employee.position && (
              <>
                <Separator />
                <div>
                  <p className="font-medium text-sm">Posición</p>
                  <p className="text-muted-foreground text-sm">{employee.position}</p>
                </div>
              </>
            )}

            {employee.emergencyContact && (
              <>
                <Separator />
                <div>
                  <p className="font-medium text-sm mb-2">Contacto de emergencia</p>
                  <div className="text-sm text-muted-foreground">
                    <p>{employee.emergencyContact.name}</p>
                    <p>{employee.emergencyContact.phone}</p>
                    <p>{employee.emergencyContact.relationship}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 