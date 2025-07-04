import { useState } from "react"
import { 
  Edit, 
  Download, 
  Eye, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Building2,
  Shield,
  FileText,
  Activity,
  Star,
  Clock,
  Award,
  AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Employee, EmployeeStatus, Permission } from "@/types/personal"

interface EmployeeProfileProps {
  employee: Employee
  isOpen: boolean
  onClose: () => void
  onEdit?: (employee: Employee) => void
}

// Datos mock para evaluaciones
const mockEvaluations = [
  {
    id: "eval001",
    date: "2024-01-15",
    evaluator: "María González",
    score: 4.5,
    comments: "Excelente desempeño en el manejo de equipos médicos. Muy responsable y puntual."
  },
  {
    id: "eval002",
    date: "2023-07-20",
    evaluator: "Ana Martínez",
    score: 4.2,
    comments: "Buen trabajo técnico. Necesita mejorar en documentación."
  },
  {
    id: "eval003",
    date: "2023-01-10",
    evaluator: "Roberto Silva",
    score: 4.8,
    comments: "Destacado en resolución de problemas. Líder natural del equipo."
  }
]

// Datos mock para documentos
const mockDocuments = [
  {
    id: "doc001",
    name: "CV_Carlos_Rodriguez.pdf",
    type: "CV",
    url: "#",
    uploadDate: "2022-08-20"
  },
  {
    id: "doc002",
    name: "INE_Frontal.jpg",
    type: "Identificación",
    url: "#",
    uploadDate: "2022-08-20"
  },
  {
    id: "doc003",
    name: "Certificado_Tecnico.pdf",
    type: "Certificación",
    url: "#",
    uploadDate: "2022-09-15"
  }
]

// Datos mock para actividad reciente
const mockActivity = [
  {
    id: "act001",
    action: "Actualizó información de contacto",
    module: "Perfil",
    timestamp: "2024-01-20T10:30:00Z",
    details: "Cambió número de teléfono"
  },
  {
    id: "act002",
    action: "Completó mantenimiento preventivo",
    module: "Equipos",
    timestamp: "2024-01-19T15:45:00Z",
    details: "Equipo: Monitor Cardíaco XYZ-2000"
  },
  {
    id: "act003",
    action: "Solicitó vacaciones",
    module: "Horarios",
    timestamp: "2024-01-18T09:15:00Z",
    details: "Del 15 al 20 de febrero"
  },
  {
    id: "act004",
    action: "Actualizó documentación técnica",
    module: "Documentos",
    timestamp: "2024-01-17T14:20:00Z",
    details: "Manual de procedimientos actualizado"
  }
]

// Permisos organizados por módulo
const permissionsByModule = {
  employees: [
    { id: Permission.EMPLOYEE_READ, label: "Ver empleados" },
    { id: Permission.EMPLOYEE_CREATE, label: "Crear empleados" },
    { id: Permission.EMPLOYEE_UPDATE, label: "Editar empleados" },
    { id: Permission.EMPLOYEE_DELETE, label: "Eliminar empleados" }
  ],
  departments: [
    { id: Permission.DEPARTMENT_READ, label: "Ver departamentos" },
    { id: Permission.DEPARTMENT_CREATE, label: "Crear departamentos" },
    { id: Permission.DEPARTMENT_UPDATE, label: "Editar departamentos" },
    { id: Permission.DEPARTMENT_DELETE, label: "Eliminar departamentos" }
  ],
  schedules: [
    { id: Permission.SCHEDULE_READ, label: "Ver horarios" },
    { id: Permission.SCHEDULE_CREATE, label: "Crear horarios" },
    { id: Permission.SCHEDULE_UPDATE, label: "Editar horarios" },
    { id: Permission.SCHEDULE_DELETE, label: "Eliminar horarios" }
  ],
  reports: [
    { id: Permission.REPORT_READ, label: "Ver reportes" },
    { id: Permission.REPORT_EXPORT, label: "Exportar reportes" }
  ]
}

export function EmployeeProfile({ employee, isOpen, onClose, onEdit }: EmployeeProfileProps) {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)

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
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateTenure = () => {
    const hireDate = new Date(employee.hireDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - hireDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    return { years, months, days: diffDays }
  }

  const tenure = calculateTenure()

  const averageScore = mockEvaluations.reduce((acc, evaluation) => acc + evaluation.score, 0) / mockEvaluations.length

  const handleEdit = () => {
    onEdit?.(employee)
  }

  const handleDownloadDocument = (documentId: string) => {
    console.log("Descargando documento:", documentId)
    // TODO: Implementar descarga real
  }

  const handleViewDocument = (documentId: string) => {
    setSelectedDocument(documentId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Perfil del Empleado</DialogTitle>
              <DialogDescription>
                Información detallada de {employee.name}
              </DialogDescription>
            </div>
            <Button onClick={handleEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        {/* Header con información básica */}
        <div className="flex items-start space-x-6 p-6 bg-gray-50 rounded-lg">
          <div className="h-24 w-24 rounded-full bg-tumex-primary-100 flex items-center justify-center text-tumex-primary-700 font-semibold text-2xl">
            {employee.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-bold">{employee.name}</h2>
              <Badge className={getStatusColor(employee.status)}>
                {getStatusText(employee.status)}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground mb-2">{employee.role}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{employee.department}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Supervisor: {employee.supervisor}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Ingreso: {formatDate(employee.hireDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de información */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="work">Laboral</TabsTrigger>
            <TabsTrigger value="evaluations">Evaluaciones</TabsTrigger>
            <TabsTrigger value="permissions">Permisos</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          {/* Información Personal */}
          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-sm text-muted-foreground">{employee.phone}</p>
                    </div>
                  </div>
                  {employee.emergencyContact && (
                    <>
                      <Separator />
                      <div>
                        <p className="font-medium mb-2">Contacto de Emergencia</p>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Nombre:</span> {employee.emergencyContact.name}</p>
                          <p><span className="font-medium">Teléfono:</span> {employee.emergencyContact.phone}</p>
                          <p><span className="font-medium">Relación:</span> {employee.emergencyContact.relationship}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Antigüedad y Métricas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Tiempo en la empresa</p>
                    <div className="text-2xl font-bold text-tumex-primary-600">
                      {tenure.years} años, {tenure.months} meses
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tenure.days} días totales
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium mb-2">Promedio de evaluaciones</p>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold text-yellow-600">
                        {averageScore.toFixed(1)}
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(averageScore) 
                                ? "text-yellow-400 fill-current" 
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Basado en {mockEvaluations.length} evaluaciones
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Información Laboral */}
          <TabsContent value="work" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Información Laboral
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">Rol</p>
                    <p className="text-muted-foreground">{employee.role}</p>
                  </div>
                  <div>
                    <p className="font-medium">Departamento</p>
                    <p className="text-muted-foreground">{employee.department}</p>
                  </div>
                  <div>
                    <p className="font-medium">Supervisor</p>
                    <p className="text-muted-foreground">{employee.supervisor}</p>
                  </div>
                  {employee.position && (
                    <div>
                      <p className="font-medium">Posición</p>
                      <p className="text-muted-foreground">{employee.position}</p>
                    </div>
                  )}
                  {employee.salary && (
                    <div>
                      <p className="font-medium">Salario</p>
                      <p className="text-muted-foreground">
                        ${employee.salary.toLocaleString('es-MX')} MXN/mes
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Fecha de ingreso</p>
                    <p className="text-muted-foreground">{formatDate(employee.hireDate)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="h-2 w-2 bg-tumex-primary-500 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(activity.timestamp)} • {activity.module}
                          </p>
                          {activity.details && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {activity.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Evaluaciones */}
          <TabsContent value="evaluations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Historial de Evaluaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEvaluations.map((evaluation) => (
                    <div key={evaluation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="text-lg font-bold text-yellow-600">
                            {evaluation.score}
                          </div>
                          <div className="flex">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < evaluation.score 
                                    ? "text-yellow-400 fill-current" 
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(evaluation.date)}
                        </div>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm font-medium">Evaluador</p>
                        <p className="text-sm text-muted-foreground">{evaluation.evaluator}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Comentarios</p>
                        <p className="text-sm text-muted-foreground">{evaluation.comments}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permisos */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Permisos y Accesos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(permissionsByModule).map(([module, permissions]) => (
                    <div key={module}>
                      <h4 className="font-medium mb-3 capitalize">
                        {module === "employees" ? "Empleados" : 
                         module === "departments" ? "Departamentos" :
                         module === "schedules" ? "Horarios" :
                         module === "reports" ? "Reportes" : module}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className={`flex items-center space-x-2 p-2 rounded ${
                              employee.permissions.includes(permission.id)
                                ? "bg-green-50 border border-green-200"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <div className={`h-2 w-2 rounded-full ${
                              employee.permissions.includes(permission.id)
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`} />
                            <span className={`text-sm ${
                              employee.permissions.includes(permission.id)
                                ? "text-green-800"
                                : "text-gray-600"
                            }`}>
                              {permission.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentos */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDocuments.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{document.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {document.type} • Subido el {formatDate(document.uploadDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(document.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadDocument(document.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 