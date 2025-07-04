import { useState, useEffect } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  X,
  User,
  Building2,
  Shield,
  FileText,
  Upload,
  Trash2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Employee, EmployeeStatus, Permission, EmployeeFormData } from "@/types/personal"

interface EmployeeFormProps {
  employee?: Employee
  isOpen: boolean
  onClose: () => void
  onSave: (data: EmployeeFormData) => void
}

// Datos mock para departamentos y roles
const departments = [
  { id: "administration", name: "Administración" },
  { id: "technical", name: "Técnico" },
  { id: "warehouse", name: "Almacén" },
  { id: "customer_service", name: "Servicio al Cliente" },
  { id: "sales", name: "Ventas" },
  { id: "finance", name: "Finanzas" }
]

const roles = [
  { id: "admin", name: "Administrador", description: "Acceso completo al sistema" },
  { id: "supervisor", name: "Supervisor", description: "Gestión de equipo y aprobaciones" },
  { id: "technician", name: "Técnico", description: "Mantenimiento y soporte técnico" },
  { id: "warehouse", name: "Almacén", description: "Gestión de inventario" },
  { id: "customer_service", name: "Servicio al Cliente", description: "Atención y soporte" },
  { id: "sales", name: "Ventas", description: "Comercialización y negociaciones" }
]

const supervisors = [
  { id: "maria_gonzalez", name: "María González" },
  { id: "ana_martinez", name: "Ana Martínez" },
  { id: "roberto_silva", name: "Roberto Silva" },
  { id: "carmen_ruiz", name: "Carmen Ruiz" }
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

export function EmployeeForm({ employee, isOpen, onClose, onSave }: EmployeeFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<EmployeeFormData>({
    personalInfo: {
      name: employee?.name || "",
      email: employee?.email || "",
      phone: employee?.phone || "",
      emergencyContact: employee?.emergencyContact || undefined
    },
    workInfo: {
      role: employee?.role || "",
      department: employee?.department || "",
      supervisor: employee?.supervisor || "",
      position: employee?.position || "",
      salary: employee?.salary || undefined,
      hireDate: employee?.hireDate || new Date().toISOString().split('T')[0]
    },
    permissions: employee?.permissions || [],
    documents: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const totalSteps = 4

  useEffect(() => {
    if (isOpen && !employee) {
      setCurrentStep(1)
      setFormData({
        personalInfo: {
          name: "",
          email: "",
          phone: "",
          emergencyContact: undefined
        },
        workInfo: {
          role: "",
          department: "",
          supervisor: "",
          position: "",
          salary: undefined,
          hireDate: new Date().toISOString().split('T')[0]
        },
        permissions: [],
        documents: []
      })
      setUploadedFiles([])
      setErrors({})
    }
  }, [isOpen, employee])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.personalInfo.name.trim()) {
        newErrors.name = "El nombre es requerido"
      }
      if (!formData.personalInfo.email.trim()) {
        newErrors.email = "El email es requerido"
      } else if (!/\S+@\S+\.\S+/.test(formData.personalInfo.email)) {
        newErrors.email = "El email no es válido"
      }
      if (!formData.personalInfo.phone.trim()) {
        newErrors.phone = "El teléfono es requerido"
      }
    }

    if (step === 2) {
      if (!formData.workInfo.role) {
        newErrors.role = "El rol es requerido"
      }
      if (!formData.workInfo.department) {
        newErrors.department = "El departamento es requerido"
      }
      if (!formData.workInfo.supervisor) {
        newErrors.supervisor = "El supervisor es requerido"
      }
      if (!formData.workInfo.hireDate) {
        newErrors.hireDate = "La fecha de ingreso es requerida"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSave = () => {
    if (validateStep(currentStep)) {
      onSave(formData)
      onClose()
    }
  }

  const handleInputChange = (section: keyof EmployeeFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    
    // Clear error when user starts typing
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
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), ...files]
    }))
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      documents: prev.documents?.filter((_, i) => i !== index) || []
    }))
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Información Personal"
      case 2: return "Información Laboral"
      case 3: return "Permisos y Accesos"
      case 4: return "Documentos"
      default: return ""
    }
  }

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User className="h-4 w-4" />
      case 2: return <Building2 className="h-4 w-4" />
      case 3: return <Shield className="h-4 w-4" />
      case 4: return <FileText className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Editar Empleado" : "Nuevo Empleado"}
          </DialogTitle>
          <DialogDescription>
            {employee ? `Editando información de ${employee.name}` : "Complete la información del nuevo empleado"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                step <= currentStep 
                  ? "bg-tumex-primary-500 border-tumex-primary-500 text-white" 
                  : "border-gray-300 text-gray-500"
              }`}>
                {step < currentStep ? (
                  <span className="text-xs">✓</span>
                ) : (
                  getStepIcon(step)
                )}
              </div>
              {step < totalSteps && (
                <div className={`w-16 h-0.5 mx-2 ${
                  step < currentStep ? "bg-tumex-primary-500" : "bg-gray-300"
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold">{getStepTitle(currentStep)}</h3>
          <p className="text-sm text-muted-foreground">
            Paso {currentStep} de {totalSteps}
          </p>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={formData.personalInfo.name}
                  onChange={(e) => handleInputChange("personalInfo", "name", e.target.value)}
                  placeholder="Nombre y apellidos"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) => handleInputChange("personalInfo", "email", e.target.value)}
                  placeholder="email@tumex.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleInputChange("personalInfo", "phone", e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency-name">Contacto de emergencia</Label>
                <Input
                  id="emergency-name"
                  value={formData.personalInfo.emergencyContact?.name || ""}
                  onChange={(e) => handleInputChange("personalInfo", "emergencyContact", {
                    ...formData.personalInfo.emergencyContact,
                    name: e.target.value
                  })}
                  placeholder="Nombre del contacto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency-phone">Teléfono de emergencia</Label>
                <Input
                  id="emergency-phone"
                  value={formData.personalInfo.emergencyContact?.phone || ""}
                  onChange={(e) => handleInputChange("personalInfo", "emergencyContact", {
                    ...formData.personalInfo.emergencyContact,
                    phone: e.target.value
                  })}
                  placeholder="+52 55 1234 5678"
                />
              </div>


            </div>
          )}

          {/* Step 2: Work Information */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select
                  value={formData.workInfo.role}
                  onValueChange={(value) => handleInputChange("workInfo", "role", value)}
                >
                  <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar rol" />
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
                {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Departamento *</Label>
                <Select
                  value={formData.workInfo.department}
                  onValueChange={(value) => handleInputChange("workInfo", "department", value)}
                >
                  <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor *</Label>
                <Select
                  value={formData.workInfo.supervisor}
                  onValueChange={(value) => handleInputChange("workInfo", "supervisor", value)}
                >
                  <SelectTrigger className={errors.supervisor ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((sup) => (
                      <SelectItem key={sup.id} value={sup.name}>
                        {sup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supervisor && <p className="text-sm text-red-500">{errors.supervisor}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Posición</Label>
                <Input
                  id="position"
                  value={formData.workInfo.position || ""}
                  onChange={(e) => handleInputChange("workInfo", "position", e.target.value)}
                  placeholder="Cargo específico"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salario</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.workInfo.salary || ""}
                  onChange={(e) => handleInputChange("workInfo", "salary", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Salario mensual"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Fecha de ingreso *</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={formData.workInfo.hireDate}
                  onChange={(e) => handleInputChange("workInfo", "hireDate", e.target.value)}
                  className={errors.hireDate ? "border-red-500" : ""}
                />
                {errors.hireDate && <p className="text-sm text-red-500">{errors.hireDate}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Permissions */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground">
                Selecciona los permisos que tendrá este empleado en el sistema.
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
                            checked={formData.permissions.includes(permission.id)}
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

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Permisos seleccionados:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.permissions.length > 0 ? (
                    formData.permissions.map((permission) => {
                      const permInfo = Object.values(permissionsByModule)
                        .flat()
                        .find(p => p.id === permission)
                      return (
                        <Badge key={permission} variant="secondary">
                          {permInfo?.label || permission}
                        </Badge>
                      )
                    })
                  ) : (
                    <p className="text-sm text-blue-700">Ningún permiso seleccionado</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground">
                Sube los documentos necesarios para el empleado (CV, identificación, certificados, etc.).
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-tumex-primary-600 hover:text-tumex-primary-500">
                    Haz clic para subir archivos
                  </span>
                  <span className="text-sm text-gray-500"> o arrastra y suelta</span>
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX, JPG, PNG hasta 10MB cada uno
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Archivos subidos:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="flex items-center">
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSave} className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                {employee ? "Actualizar" : "Crear"} Empleado
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 