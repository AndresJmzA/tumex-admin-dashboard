import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { TimePicker } from '@/components/ui/TimePicker';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/supabaseClient';

// Tipos para el formulario de creación de órdenes
interface OrderCreationFormData {
  // Paso 1: Cliente
  clientId: string;
  clientName: string;
  contactPerson: string;
  phone: string;
  email: string;
  
  // Paso 2: Paciente
  patientName: string;
  patientAge: string;
  patientGender: 'Masculino' | 'Femenino';
  
  // Paso 3: Cirugía y Procedimiento
  surgeryTypeId: string;
  procedureId: string;
  templateId: string;
  
  // Paso 4: Fecha, Hora y Ubicación
  surgeryDate: string;
  surgeryTime: string;
  hospitalName: string;
  hospitalAddress: string;
  doctorName: string;
  doctorPhone: string;
  
  // Paso 5: Equipo y Técnicos
  selectedEquipment: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  selectedTechnicians: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  
  // Paso 6: Información Adicional
  notes: string;
  urgency: 'normal' | 'urgent' | 'emergency';
  estimatedDuration: string;
}

interface OrderCreationFormProps {
  onSubmit: (orderData: OrderCreationFormData) => void;
  onCancel: () => void;
}

const OrderCreationForm: React.FC<OrderCreationFormProps> = ({ onSubmit, onCancel }) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OrderCreationFormData>({
    clientId: '',
    clientName: '',
    contactPerson: '',
    phone: '',
    email: '',
    patientName: '',
    patientAge: '',
    patientGender: 'Masculino',
    surgeryTypeId: '',
    procedureId: '',
    templateId: '',
    surgeryDate: '',
    surgeryTime: '',
    hospitalName: '',
    hospitalAddress: '',
    doctorName: '',
    doctorPhone: '',
    selectedEquipment: [],
    selectedTechnicians: [],
    notes: '',
    urgency: 'normal',
    estimatedDuration: ''
  });

  // Estados para datos de Supabase
  const [surgeryTypes, setSurgeryTypes] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para validaciones
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [isValidating, setIsValidating] = useState(false);

  const totalSteps = 6;

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [surgeryTypesData, clientsData, equipmentData, techniciansData] = await Promise.all([
        loadSurgeryTypes(),
        loadClients(),
        loadEquipment(),
        loadTechnicians()
      ]);

      setSurgeryTypes(surgeryTypesData);
      setClients(clientsData);
      setEquipment(equipmentData);
      setTechnicians(techniciansData);
    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
      setError('Error cargando datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const loadSurgeryTypes = async () => {
    const { data, error } = await supabase
      .from('SurgeryTypes')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  };

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('role', 'client')
      .eq('active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  };

  const loadEquipment = async () => {
    const { data, error } = await supabase
      .from('Products')
      .select('*')
      .eq('active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  };

  const loadTechnicians = async () => {
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('role', 'technician')
      .eq('active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  };

  const loadProcedures = async (surgeryTypeId: string) => {
    const { data, error } = await supabase
      .from('Procedures')
      .select('*')
      .eq('surgery_type_id', surgeryTypeId)
      .order('name');
    
    if (error) throw error;
    setProcedures(data || []);
  };

  const loadTemplates = async (procedureId: string) => {
    const { data, error } = await supabase
      .from('Templates')
      .select('*')
      .eq('procedure_id', procedureId)
      .order('name');
    
    if (error) throw error;
    setTemplates(data || []);
  };

  // Función para actualizar el formulario
  const updateFormData = (field: keyof OrderCreationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores de validación cuando se actualiza el campo
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validaciones por paso
  const validateStep = (step: number): boolean => {
    const errors: {[key: string]: string} = {};

    switch (step) {
      case 1: // Cliente
        if (!formData.clientId) errors.clientId = 'Selecciona un cliente';
        break;
      
      case 2: // Paciente
        if (!formData.patientName) errors.patientName = 'Nombre del paciente es requerido';
        if (!formData.patientAge) errors.patientAge = 'Edad del paciente es requerida';
        if (!formData.patientGender) errors.patientGender = 'Género del paciente es requerido';
        break;
      
      case 3: // Cirugía y Procedimiento
        if (!formData.surgeryTypeId) errors.surgeryTypeId = 'Selecciona un tipo de cirugía';
        if (!formData.procedureId) errors.procedureId = 'Selecciona un procedimiento';
        if (!formData.templateId) errors.templateId = 'Selecciona una plantilla';
        break;
      
      case 4: // Fecha, Hora y Ubicación
        if (!formData.surgeryDate) errors.surgeryDate = 'Fecha de cirugía es requerida';
        if (!formData.surgeryTime) errors.surgeryTime = 'Hora de cirugía es requerida';
        if (!formData.hospitalName) errors.hospitalName = 'Nombre del hospital es requerido';
        if (!formData.doctorName) errors.doctorName = 'Nombre del doctor es requerido';
        break;
      
      case 5: // Equipo y Técnicos
        if (formData.selectedEquipment.length === 0) errors.selectedEquipment = 'Selecciona al menos un equipo';
        if (formData.selectedTechnicians.length === 0) errors.selectedTechnicians = 'Selecciona al menos un técnico';
        break;
      
      case 6: // Información Adicional
        // No hay validaciones obligatorias para este paso
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Función para ir al siguiente paso
  const nextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Función para ir al paso anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función para manejar la selección de cliente
  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
      updateFormData('clientId', clientId);
      updateFormData('clientName', selectedClient.name);
      updateFormData('contactPerson', selectedClient.contact_person || '');
      updateFormData('phone', selectedClient.phone || '');
      updateFormData('email', selectedClient.email || '');
    }
  };

  // Función para manejar la selección de cirugía
  const handleSurgeryTypeSelect = (surgeryTypeId: string) => {
    updateFormData('surgeryTypeId', surgeryTypeId);
    updateFormData('procedureId', '');
    updateFormData('templateId', '');
    setProcedures([]);
    setTemplates([]);
    if (surgeryTypeId) {
      loadProcedures(surgeryTypeId);
    }
  };

  // Función para manejar la selección de procedimiento
  const handleProcedureSelect = (procedureId: string) => {
    updateFormData('procedureId', procedureId);
    updateFormData('templateId', '');
    setTemplates([]);
    if (procedureId) {
      loadTemplates(procedureId);
    }
  };

  // Función para manejar la selección de equipo
  const handleEquipmentToggle = (equipmentId: string) => {
    const equipment = equipment.find(e => e.id === equipmentId);
    if (!equipment) return;

    const isSelected = formData.selectedEquipment.some(e => e.id === equipmentId);
    
    if (isSelected) {
      updateFormData('selectedEquipment', formData.selectedEquipment.filter(e => e.id !== equipmentId));
    } else {
      updateFormData('selectedEquipment', [
        ...formData.selectedEquipment,
        {
          id: equipmentId,
          name: equipment.name,
          quantity: 1,
          price: equipment.price || 0
        }
      ]);
    }
  };

  // Función para manejar la selección de técnicos
  const handleTechnicianToggle = (technicianId: string) => {
    const technician = technicians.find(t => t.id === technicianId);
    if (!technician) return;

    const isSelected = formData.selectedTechnicians.some(t => t.id === technicianId);
    
    if (isSelected) {
      updateFormData('selectedTechnicians', formData.selectedTechnicians.filter(t => t.id !== technicianId));
    } else {
      updateFormData('selectedTechnicians', [
        ...formData.selectedTechnicians,
        {
          id: technicianId,
          name: technician.name,
          role: technician.role
        }
      ]);
    }
  };

  // Función para enviar el formulario
  const handleSubmit = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    onSubmit(formData);
    toast({
      title: 'Orden creada exitosamente',
      description: 'La orden ha sido registrada en el sistema.',
    });
  };

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="text-gray-600">Cargando datos...</div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Paso 1: Selección de Cliente</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={handleClientSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.clientId && (
                  <div className="text-red-600 text-sm mt-1">{validationErrors.clientId}</div>
                )}
              </div>

              {formData.clientId && (
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="font-semibold">{formData.clientName}</div>
                    <div className="text-sm text-gray-600">
                      Contacto: {formData.contactPerson}
                    </div>
                    <div className="text-sm text-gray-600">
                      Teléfono: {formData.phone}
                    </div>
                    <div className="text-sm text-gray-600">
                      Email: {formData.email}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Paso 2: Información del Paciente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientName">Nombre del Paciente *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => updateFormData('patientName', e.target.value)}
                  placeholder="Nombre completo"
                />
                {validationErrors.patientName && (
                  <div className="text-red-600 text-sm mt-1">{validationErrors.patientName}</div>
                )}
              </div>

              <div>
                <Label htmlFor="patientAge">Edad *</Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={formData.patientAge}
                  onChange={(e) => updateFormData('patientAge', e.target.value)}
                  placeholder="Edad"
                />
                {validationErrors.patientAge && (
                  <div className="text-red-600 text-sm mt-1">{validationErrors.patientAge}</div>
                )}
              </div>

              <div>
                <Label htmlFor="patientGender">Género *</Label>
                <Select
                  value={formData.patientGender}
                  onValueChange={(value) => updateFormData('patientGender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.patientGender && (
                  <div className="text-red-600 text-sm mt-1">{validationErrors.patientGender}</div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Paso 3: Tipo de Cirugía y Procedimiento</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="surgeryType">Tipo de Cirugía *</Label>
                <Select
                  value={formData.surgeryTypeId}
                  onValueChange={handleSurgeryTypeSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo de cirugía..." />
                  </SelectTrigger>
                  <SelectContent>
                    {surgeryTypes.map(surgery => (
                      <SelectItem key={surgery.id} value={surgery.id}>
                        {surgery.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.surgeryTypeId && (
                  <div className="text-red-600 text-sm mt-1">{validationErrors.surgeryTypeId}</div>
                )}
              </div>

              {formData.surgeryTypeId && procedures.length > 0 && (
                <div>
                  <Label htmlFor="procedure">Procedimiento *</Label>
                  <Select
                    value={formData.procedureId}
                    onValueChange={handleProcedureSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona procedimiento..." />
                    </SelectTrigger>
                    <SelectContent>
                      {procedures.map(procedure => (
                        <SelectItem key={procedure.id} value={procedure.id}>
                          {procedure.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.procedureId && (
                    <div className="text-red-600 text-sm mt-1">{validationErrors.procedureId}</div>
                  )}
                </div>
              )}

              {formData.procedureId && templates.length > 0 && (
                <div>
                  <Label htmlFor="template">Plantilla *</Label>
                  <Select
                    value={formData.templateId}
                    onValueChange={(value) => updateFormData('templateId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona plantilla..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.templateId && (
                    <div className="text-red-600 text-sm mt-1">{validationErrors.templateId}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Paso 4: Fecha, Hora y Ubicación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="surgeryDate">Fecha de Cirugía *</Label>
                <Input
                  id="surgeryDate"
                  type="date"
                  value={formData.surgeryDate}
                  onChange={(e) => updateFormData('surgeryDate', e.target.value)}
                />
                {validationErrors.surgeryDate && (
                  <div className="text-red-600 text-sm mt-1">{validationErrors.surgeryDate}</div>
                )}
              </div>

              <div>
                <Label htmlFor="surgeryTime">Hora de Cirugía *</Label>
                <TimePicker
                  value={formData.surgeryTime}
                  onChange={(time) => updateFormData('surgeryTime', time)}
                />
                {validationErrors.surgeryTime && (
                  <div className="text-red-600 text-sm mt-1">{validationErrors.surgeryTime}</div>
                )}
              </div>

              <div>
                <Label htmlFor="hospitalName">Hospital *</Label>
                <Input
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={(e) => updateFormData('hospitalName', e.target.value)}
                  placeholder="Nombre del hospital"
                />
                {validationErrors.hospitalName && (
                  <div className="text-red-600 text-sm mt-1">{validationErrors.hospitalName}</div>
                )}
              </div>

              <div>
                <Label htmlFor="doctorName">Doctor *</Label>
                <Input
                  id="doctorName"
                  value={formData.doctorName}
                  onChange={(e) => updateFormData('doctorName', e.target.value)}
                  placeholder="Nombre del doctor"
                />
                {validationErrors.doctorName && (
                  <div className="text-red-600 text-sm mt-1">{validationErrors.doctorName}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="hospitalAddress">Dirección del Hospital</Label>
                <Input
                  id="hospitalAddress"
                  value={formData.hospitalAddress}
                  onChange={(e) => updateFormData('hospitalAddress', e.target.value)}
                  placeholder="Dirección completa del hospital"
                />
              </div>

              <div>
                <Label htmlFor="doctorPhone">Teléfono del Doctor</Label>
                <Input
                  id="doctorPhone"
                  value={formData.doctorPhone}
                  onChange={(e) => updateFormData('doctorPhone', e.target.value)}
                  placeholder="Teléfono del doctor"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Paso 5: Equipo y Técnicos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Equipos */}
              <div>
                <Label>Equipos Disponibles *</Label>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                  {equipment.map(item => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`equipment-${item.id}`}
                        checked={formData.selectedEquipment.some(e => e.id === item.id)}
                        onCheckedChange={() => handleEquipmentToggle(item.id)}
                      />
                      <Label htmlFor={`equipment-${item.id}`} className="text-sm">
                        {item.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {validationErrors.selectedEquipment && (
                  <div className="text-red-600 text-sm mt-1">{validationErrors.selectedEquipment}</div>
                )}
              </div>

              {/* Técnicos */}
              <div>
                <Label>Técnicos Disponibles *</Label>
                <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                  {technicians.map(technician => (
                    <div key={technician.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`technician-${technician.id}`}
                        checked={formData.selectedTechnicians.some(t => t.id === technician.id)}
                        onCheckedChange={() => handleTechnicianToggle(technician.id)}
                      />
                      <Label htmlFor={`technician-${technician.id}`} className="text-sm">
                        {technician.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {validationErrors.selectedTechnicians && (
                  <div className="text-red-600 text-sm mt-1">{validationErrors.selectedTechnicians}</div>
                )}
              </div>
            </div>

            {/* Resumen de selecciones */}
            {(formData.selectedEquipment.length > 0 || formData.selectedTechnicians.length > 0) && (
              <Card className="p-4">
                <CardTitle className="text-base mb-3">Resumen de Selecciones</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium text-sm mb-2">Equipos Seleccionados:</div>
                    <div className="space-y-1">
                      {formData.selectedEquipment.map(equipment => (
                        <div key={equipment.id} className="text-sm text-gray-600">
                          • {equipment.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-sm mb-2">Técnicos Seleccionados:</div>
                    <div className="space-y-1">
                      {formData.selectedTechnicians.map(technician => (
                        <div key={technician.id} className="text-sm text-gray-600">
                          • {technician.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Paso 6: Información Adicional</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="urgency">Nivel de Urgencia</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => updateFormData('urgency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona nivel de urgencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="emergency">Emergencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimatedDuration">Duración Estimada</Label>
                <Select
                  value={formData.estimatedDuration}
                  onValueChange={(value) => updateFormData('estimatedDuration', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona duración estimada" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1-2 horas</SelectItem>
                    <SelectItem value="2-4">2-4 horas</SelectItem>
                    <SelectItem value="4-6">4-6 horas</SelectItem>
                    <SelectItem value="6+">Más de 6 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  placeholder="Información adicional relevante..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Crear Nueva Orden</h2>
        <p className="text-gray-600">Completa todos los pasos para crear una nueva orden</p>
      </div>

      {/* Indicador de progreso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Paso {currentStep} de {totalSteps}</span>
          <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Contenido del paso actual */}
      <div className="mb-6">
        {renderCurrentStep()}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Anterior
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          
          {currentStep === totalSteps ? (
            <Button
              onClick={handleSubmit}
              disabled={!validateStep(currentStep)}
            >
              Crear Orden
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>

      {/* Mostrar errores de validación */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-800 font-medium mb-2">Errores de validación:</div>
          <ul className="text-red-700 text-sm space-y-1">
            {Object.values(validationErrors).map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderCreationForm; 