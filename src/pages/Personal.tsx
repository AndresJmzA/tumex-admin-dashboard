import { useState } from "react"
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Plus,
  Users,
  Building2,
  UserCheck,
  UserX,
  Calendar,
  Clock,
  MoreHorizontal
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmployeeCard } from "@/components/EmployeeCard"
import { EmployeeForm } from "@/components/EmployeeForm"
import { EmployeeProfile } from "@/components/EmployeeProfile"
import { EmployeeConfirmationModal, ConfirmationType } from "@/components/EmployeeConfirmationModal"
import { Employee, EmployeeStatus, EmployeeFormData } from "@/types/personal"

// Datos mock de empleados
const mockEmployees: Employee[] = [
  {
    id: "EMP001",
    name: "María González",
    email: "maria.gonzalez@tumex.com",
    role: "Administradora",
    department: "Administración",
    status: EmployeeStatus.ACTIVE,
    avatar: "MG",
    phone: "+52 55 1234 5678",
    hireDate: "2023-01-15",
    supervisor: "Juan Pérez",
    permissions: []
  },
  {
    id: "EMP002",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@tumex.com",
    role: "Técnico Senior",
    department: "Técnico",
    status: EmployeeStatus.ACTIVE,
    avatar: "CR",
    phone: "+52 55 2345 6789",
    hireDate: "2022-08-20",
    supervisor: "Ana Martínez",
    permissions: []
  },
  {
    id: "EMP003",
    name: "Ana Martínez",
    email: "ana.martinez@tumex.com",
    role: "Supervisora Técnica",
    department: "Técnico",
    status: EmployeeStatus.ACTIVE,
    avatar: "AM",
    phone: "+52 55 3456 7890",
    hireDate: "2021-11-10",
    supervisor: "María González",
    permissions: []
  },
  {
    id: "EMP004",
    name: "Luis Hernández",
    email: "luis.hernandez@tumex.com",
    role: "Almacén",
    department: "Almacén",
    status: EmployeeStatus.ON_VACATION,
    avatar: "LH",
    phone: "+52 55 4567 8901",
    hireDate: "2023-03-05",
    supervisor: "Roberto Silva",
    permissions: []
  },
  {
    id: "EMP005",
    name: "Roberto Silva",
    email: "roberto.silva@tumex.com",
    role: "Supervisor Almacén",
    department: "Almacén",
    status: EmployeeStatus.ACTIVE,
    avatar: "RS",
    phone: "+52 55 5678 9012",
    hireDate: "2022-05-12",
    supervisor: "María González",
    permissions: []
  },
  {
    id: "EMP006",
    name: "Patricia López",
    email: "patricia.lopez@tumex.com",
    role: "Servicio al Cliente",
    department: "Servicio al Cliente",
    status: EmployeeStatus.ACTIVE,
    avatar: "PL",
    phone: "+52 55 6789 0123",
    hireDate: "2023-06-18",
    supervisor: "Carmen Ruiz",
    permissions: []
  },
  {
    id: "EMP007",
    name: "Carmen Ruiz",
    email: "carmen.ruiz@tumex.com",
    role: "Supervisora Servicio",
    department: "Servicio al Cliente",
    status: EmployeeStatus.ACTIVE,
    avatar: "CR",
    phone: "+52 55 7890 1234",
    hireDate: "2022-02-28",
    supervisor: "María González",
    permissions: []
  },
  {
    id: "EMP008",
    name: "Diego Morales",
    email: "diego.morales@tumex.com",
    role: "Técnico",
    department: "Técnico",
    status: EmployeeStatus.INACTIVE,
    avatar: "DM",
    phone: "+52 55 8901 2345",
    hireDate: "2023-09-14",
    supervisor: "Ana Martínez",
    permissions: []
  }
]

// Datos mock de departamentos
const departments = [
  { id: "admin", name: "Administración", count: 1, color: "bg-blue-100 text-blue-800" },
  { id: "technical", name: "Técnico", count: 3, color: "bg-green-100 text-green-800" },
  { id: "warehouse", name: "Almacén", count: 2, color: "bg-orange-100 text-orange-800" },
  { id: "service", name: "Servicio al Cliente", count: 2, color: "bg-purple-100 text-purple-800" }
]

// Estados de empleado
const employeeStatuses = [
  { id: "active", name: "Activo", count: 6, color: "bg-green-100 text-green-800" },
  { id: "vacation", name: "Vacaciones", count: 1, color: "bg-yellow-100 text-yellow-800" },
  { id: "inactive", name: "Inactivo", count: 1, color: "bg-red-100 text-red-800" }
]

export default function Personal() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedRole, setSelectedRole] = useState<string>("all")
  
  // Estados para modales
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false)
  const [isEmployeeProfileOpen, setIsEmployeeProfileOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>("delete")
  const [confirmationData, setConfirmationData] = useState<any>({})

  // Filtrar empleados
  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = selectedDepartment === "all" || employee.department.toLowerCase() === selectedDepartment
    const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus
    const matchesRole = selectedRole === "all" || employee.role.toLowerCase().includes(selectedRole.toLowerCase())

    return matchesSearch && matchesDepartment && matchesStatus && matchesRole
  })

  const handleNewEmployee = () => {
    setSelectedEmployee(null)
    setIsEmployeeFormOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEmployeeFormOpen(true)
  }

  const handleViewEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEmployeeProfileOpen(true)
  }

  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setConfirmationType("delete")
    setIsConfirmationModalOpen(true)
  }

  const handleStatusChange = (employee: Employee) => {
    setSelectedEmployee(employee)
    setConfirmationType("status")
    setIsConfirmationModalOpen(true)
  }

  const handleRoleChange = (employee: Employee) => {
    setSelectedEmployee(employee)
    setConfirmationType("role")
    setIsConfirmationModalOpen(true)
  }

  const handlePermissionsChange = (employee: Employee) => {
    setSelectedEmployee(employee)
    setConfirmationType("permissions")
    setIsConfirmationModalOpen(true)
  }

  const handleSaveEmployee = (formData: EmployeeFormData) => {
    console.log("Guardando empleado:", formData)
    // TODO: Implementar guardado real cuando esté conectado a base de datos
    setIsEmployeeFormOpen(false)
  }

  const handleConfirmAction = (data: any) => {
    console.log("Confirmando acción:", { type: confirmationType, employee: selectedEmployee, data })
    // TODO: Implementar acciones reales cuando esté conectado a base de datos
    setIsConfirmationModalOpen(false)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Personal</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gestiona tu equipo y recursos humanos
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={handleNewEmployee}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Empleado
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEmployees.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 este mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEmployees.filter(e => e.status === EmployeeStatus.ACTIVE).length}</div>
            <p className="text-xs text-muted-foreground">
              85% del total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Organizados por área
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacaciones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEmployees.filter(e => e.status === EmployeeStatus.ON_VACATION).length}</div>
            <p className="text-xs text-muted-foreground">
              En este momento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los departamentos</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name.toLowerCase()}>
                    {dept.name} ({dept.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {employeeStatuses.map(status => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name} ({status.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="técnico">Técnico</SelectItem>
                <SelectItem value="almacén">Almacén</SelectItem>
                <SelectItem value="servicio">Servicio al Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({filteredEmployees.length})</TabsTrigger>
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="status">Estados</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredEmployees.length} de {mockEmployees.length} empleados
            </p>
          </div>

          {/* Employee Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  viewMode="grid"
                  onEdit={handleEditEmployee}
                  onDelete={handleDeleteEmployee}
                  onView={handleViewEmployee}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  viewMode="list"
                  onEdit={handleEditEmployee}
                  onDelete={handleDeleteEmployee}
                  onView={handleViewEmployee}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept) => (
              <Card key={dept.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dept.count}</div>
                  <p className="text-xs text-muted-foreground">empleados</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {employeeStatuses.map((status) => (
              <Card key={status.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{status.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{status.count}</div>
                  <p className="text-xs text-muted-foreground">empleados</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes de Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Los reportes detallados estarán disponibles en la siguiente fase.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modales */}
      {selectedEmployee && (
        <>
          <EmployeeForm
            employee={selectedEmployee}
            isOpen={isEmployeeFormOpen}
            onClose={() => setIsEmployeeFormOpen(false)}
            onSave={handleSaveEmployee}
          />
          
          <EmployeeProfile
            employee={selectedEmployee}
            isOpen={isEmployeeProfileOpen}
            onClose={() => setIsEmployeeProfileOpen(false)}
            onEdit={handleEditEmployee}
          />
          
          <EmployeeConfirmationModal
            employee={selectedEmployee}
            type={confirmationType}
            isOpen={isConfirmationModalOpen}
            onClose={() => setIsConfirmationModalOpen(false)}
            onConfirm={handleConfirmAction}
          />
        </>
      )}

      {/* Modal para nuevo empleado */}
      <EmployeeForm
        employee={undefined}
        isOpen={isEmployeeFormOpen && !selectedEmployee}
        onClose={() => setIsEmployeeFormOpen(false)}
        onSave={handleSaveEmployee}
      />
    </div>
  )
} 