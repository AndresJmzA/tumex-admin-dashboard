import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { DateInput } from '@/components/ui/DateInput';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/supabaseClient';
import { orderService } from '@/services/orderService';
import { orderEquipmentService, AvailableProduct } from '@/services/orderEquipmentService';
import { AlertTriangle, Clock, Package, CheckCircle, FileText, Shield, AlertCircle, Eye, RefreshCw } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/contexts/AuthContext';

// Tipos para el formulario de nueva orden simplificado
interface NewOrderFormData {
  // Información del médico
  doctorId: string;
  doctorName: string;
  
  // Información del paciente
  patientName: string;
  surgeryDate: string;
  surgeryTime: string;
  
  // Información de la cirugía
  surgeryType: string;
  surgeryLocation: string;
  procedure: string;
  
  // Información de cobertura (opcional)
  coverageType: 'Privado' | 'Seguro' | 'none';
  insuranceName?: string;
  
  // Notas adicionales
  notes: string;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (orderData: any) => void; // Opcional ya que no lo usamos
  onOrderCreated?: () => void; // Callback para recargar órdenes después de crear
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose, onSubmit, onOrderCreated }) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { hasRole, getUserRole } = usePermissions();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NewOrderFormData>({
    doctorId: '',
    doctorName: '',
    patientName: '',
    surgeryDate: '',
    surgeryTime: '',
    surgeryType: '',
    surgeryLocation: '',
    procedure: '',
    coverageType: 'none',
    notes: ''
  });

  // Estados para datos de Supabase
  const [doctors, setDoctors] = useState<any[]>([]);
  const [surgeryTypes, setSurgeryTypes] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para validaciones
  const [validationResults, setValidationResults] = useState({
    surgeryOverlap: { hasOverlap: false, overlappingOrders: [] }
  });
  const [isValidating, setIsValidating] = useState(false);

  // Estados para validación de disponibilidad del médico
  const [doctorAvailability, setDoctorAvailability] = useState<{
    isAvailable: boolean;
    conflicts: any[];
    lastChecked: Date | null;
  }>({
    isAvailable: true,
    conflicts: [],
    lastChecked: null
  });
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Estados para validación de stock de equipos
  const [equipmentStockValidation, setEquipmentStockValidation] = useState<{
    isValid: boolean;
    warnings: string[];
    lastChecked: Date | null;
  }>({
    isValid: true,
    warnings: [],
    lastChecked: null
  });
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  // Estados para validación de solapamiento de horarios
  const [scheduleConflict, setScheduleConflict] = useState<{
    hasConflict: boolean;
    conflictingOrders: any[];
    lastChecked: Date | null;
  }>({
    hasConflict: false,
    conflictingOrders: [],
    lastChecked: null
  });
  const [isCheckingSchedule, setIsCheckingSchedule] = useState(false);

  // Estados para warning de tiempo
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [pendingDateTime, setPendingDateTime] = useState<{date: string, time: string} | null>(null);

  // Estados para equipos (reemplazando el sistema de paquetes optimizados)
  const [selectedEquipment, setSelectedEquipment] = useState<any[]>([]);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);
  
  // Estados para templates y productos disponibles
  const [templates, setTemplates] = useState<any[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  
  // TAREA 1: Estados de carga separados para evitar race conditions
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [currentProcedureId, setCurrentProcedureId] = useState<string | null>(null);
  const [templatesLoadError, setTemplatesLoadError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  // Eliminamos useOptimizedPackages que falla
  // const { 
  //   optimizedPackage, 
  //   isLoading: isLoadingPackage, 
  //   loadPackage 
  // } = useOptimizedPackages();

  // Estado para controlar el envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Función para cargar datos de Supabase
  const loadDoctors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('role', 'Médico')
        .order('display_name');
      
      if (error) throw error;
      setDoctors(data || []);
    } catch (err) {
      console.error('Error cargando médicos:', err);
      setError('Error cargando médicos');
    } finally {
      setLoading(false);
    }
  };

  const loadSurgeryTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('SurgeryTypes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setSurgeryTypes(data || []);
    } catch (err) {
      console.error('Error cargando tipos de cirugía:', err);
    }
  };

  const loadProcedures = async (surgeryTypeId?: string) => {
    try {
      console.log('🔄 Iniciando carga de procedimientos...', { surgeryTypeId });
      
      let query = supabase
        .from('Procedures')
        .select('*')
        .order('name');
      
      if (surgeryTypeId) {
        query = query.eq('surgery_type_id', surgeryTypeId);
        console.log('🔍 Filtrando por surgery_type_id:', surgeryTypeId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error cargando procedimientos:', error);
        throw error;
      }
      
      console.log('✅ Procedimientos cargados exitosamente:', {
        count: data?.length || 0,
        procedures: data?.map(p => ({ id: p.id, name: p.name, surgery_type_id: p.surgery_type_id }))
      });
      
      setProcedures(data || []);
    } catch (err) {
      console.error('❌ Error cargando procedimientos:', err);
    }
  };

  // TAREA 3: Función de fallback para cargar productos cuando no hay templates
  const loadProductsAsFallback = async () => {
    // Verificar si la carga fue cancelada antes de comenzar
    if (abortController?.signal.aborted) {
      console.log('⚠️ Fallback cancelado antes de comenzar');
      return;
    }

    try {
      console.log('🔄 Cargando productos disponibles como fallback...');
      
      // Cargar productos directamente desde el servicio (no depender del estado)
      const products = await orderEquipmentService.getAvailableProducts();
      
      // Verificar cancelación después de cargar productos
      if (abortController?.signal.aborted) {
        console.log('⚠️ Fallback cancelado después de cargar productos');
        return;
      }
      

      
      if (products.length === 0) {
        console.warn('⚠️ No se pudieron cargar productos desde el servicio');
        // Crear templates mínimos para evitar fallo total
        const minimalTemplates = [
          {
            id: 'fallback-minimal-1',
            procedure_id: 'fallback',
            product_id: 'minimal-1',
            quantity: 1,
            category: 'General',
            sort_order: 0,
            product: {
              id: 'minimal-1',
              name: 'Producto Genérico',
              description: 'Producto disponible para el procedimiento',
              brand: '',
              price: 0,
              stock: 1,
              available: true,
              category: 'General'
            },
            is_fallback: true
          }
        ];
        
        setTemplates(minimalTemplates);
        setAvailableProducts([{
          id: 'minimal-1',
          name: 'Producto Genérico',
          description: 'Producto disponible para el procedimiento',
          brand: '',
          price: 0,
          stock: 1,
          available: true,
          category: 'General'
        }]);
        
        return;
      }
      
      // Transformar productos del servicio al formato esperado
      const transformedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        brand: '', // El servicio no tiene brand
        price: product.price,
        stock: product.stock_available,
        available: product.stock_available > 0,
        category: product.category
      }));
      
      // Verificar cancelación antes de crear templates
      if (abortController?.signal.aborted) {
        console.log('⚠️ Fallback cancelado antes de crear templates');
        return;
      }
      
      // Crear templates simulados basados en productos disponibles
      const fallbackTemplates = transformedProducts.slice(0, 10).map((product, index) => ({
        id: `fallback-${index}`,
        procedure_id: 'fallback',
        product_id: product.id,
        quantity: 1,
        category: product.category || 'General',
        sort_order: index, // Mantener para compatibilidad con la interfaz
        product: product,
        is_fallback: true
      }));
      
      // Verificar cancelación antes de actualizar estado
      if (abortController?.signal.aborted) {
        console.log('⚠️ Fallback cancelado antes de actualizar estado');
        return;
      }
      
      // Actualizar ambos estados
      setTemplates(fallbackTemplates);
      setAvailableProducts(transformedProducts);
      
      
      
    } catch (err) {
      console.error('❌ Error en fallback de productos:', err);
      
      // Verificar cancelación antes de activar fallback de emergencia
      if (abortController?.signal.aborted) {
        console.log('⚠️ Fallback de emergencia cancelado');
        return;
      }
      
      // Fallback de emergencia: crear templates mínimos
      console.log('🔄 Activando fallback de emergencia...');
      const emergencyTemplates = [
        {
          id: 'emergency-1',
          procedure_id: 'emergency',
          product_id: 'emergency-1',
          quantity: 1,
          category: 'General',
          sort_order: 0,
          product: {
            id: 'emergency-1',
            name: 'Producto de Emergencia',
            description: 'Producto disponible para continuar',
            brand: '',
            price: 0,
            stock: 1,
            available: true,
            category: 'General'
          },
          is_fallback: true,
          is_emergency: true
        }
      ];
      
      // Verificar cancelación antes de actualizar estado de emergencia
      if (abortController?.signal.aborted) {
        console.log('⚠️ Fallback de emergencia cancelado antes de actualizar estado');
        return;
      }
      
      setTemplates(emergencyTemplates);
      setAvailableProducts([{
        id: 'emergency-1',
        name: 'Producto de Emergencia',
        description: 'Producto disponible para continuar',
        brand: '',
        price: 0,
        stock: 1,
        available: true,
        category: 'General'
      }]);
      
      
    }
  };

  // TAREA 3: Función refactorizada para cargar templates por procedimiento con AbortController
  const loadTemplatesByProcedure = async (procedureId: string) => {
    // Verificar si la carga fue cancelada antes de comenzar
    if (abortController?.signal.aborted) {
      console.log('⚠️ Carga cancelada antes de comenzar');
      return;
    }

    try {
      console.log(`🔄 Iniciando carga de templates para procedimiento: ${procedureId}`);
      
      // Primero, cargar templates básicos sin JOIN complejo
      const { data: templatesData, error: templatesError } = await supabase
        .from('Templates')
        .select('id, procedure_id, product_id, quantity, category')
        .eq('procedure_id', procedureId)
        .order('category', { ascending: true })
        .order('id', { ascending: true });
      
      // Verificar cancelación después de la consulta
      if (abortController?.signal.aborted) {
        console.log('⚠️ Carga cancelada después de consultar templates');
        return;
      }
      
      if (templatesError) {
        console.error('❌ Error cargando templates básicos:', templatesError);
        throw templatesError;
      }
      
      
      
      if (!templatesData || templatesData.length === 0) {
        setTemplates([]);
        setAvailableProducts([]);
        return;
      }
      
      // Luego, cargar productos por separado para evitar problemas de JOIN
      const productIds = templatesData.map(t => t.product_id).filter(id => id);
              if (productIds.length === 0) {
        setTemplates([]);
        setAvailableProducts([]);
        return;
      }
      
      // NUEVA ESTRATEGIA: Usar solo orderEquipmentService para evitar problemas con la tabla Products
              // Declarar productsMap en el scope correcto
      let productsMap = new Map();
      
      try {
        // Cargar todos los productos disponibles desde el servicio
        const allAvailableProducts = await orderEquipmentService.getAvailableProducts();
        
        // Verificar cancelación después de cargar productos
        if (abortController?.signal.aborted) {
          console.log('⚠️ Carga cancelada después de cargar productos');
          return;
        }
        

        
        // Mapear productos de templates a productos disponibles
        for (const productId of productIds) {
          // Verificar cancelación en cada iteración
          if (abortController?.signal.aborted) {
            console.log('⚠️ Carga cancelada durante mapeo de productos');
            return;
          }
          
          const foundProduct = allAvailableProducts.find(p => p.id === productId);
          
          if (foundProduct) {
            // Transformar al formato esperado
            const transformedProduct = {
              id: foundProduct.id,
              name: foundProduct.name,
              description: foundProduct.description || '',
              brand: '', // El servicio no tiene brand
              price: foundProduct.price,
              stock: foundProduct.stock_available,
              available: foundProduct.stock_available > 0,
              category: foundProduct.category
            };
            
            productsMap.set(productId, transformedProduct);
            console.log(`✅ Producto mapeado: ${foundProduct.name} (${productId})`);
          } else {
            console.warn(`⚠️ Producto ${productId} no encontrado en productos disponibles`);
          }
        }
        

        
      } catch (serviceError) {
        console.error('❌ Error cargando productos desde orderEquipmentService:', serviceError);
        
        // Fallback: crear productos simulados basados en los IDs de templates
        console.log('🔄 Creando productos simulados como fallback...');
        
        for (const productId of productIds) {
          // Verificar cancelación en cada iteración del fallback
          if (abortController?.signal.aborted) {
            console.log('⚠️ Carga cancelada durante creación de productos simulados');
            return;
          }
          
          const simulatedProduct = {
            id: productId,
            name: `Producto ${productId}`,
            description: 'Producto del template (información limitada)',
            brand: '',
            price: 0,
            stock: 1,
            available: true,
            category: 'General'
          };
          
          productsMap.set(productId, simulatedProduct);
          console.log(`⚠️ Producto simulado creado: ${productId}`);
        }
        

      }
      
      // Verificar cancelación antes de procesar templates
      if (abortController?.signal.aborted) {
        console.log('⚠️ Carga cancelada antes de procesar templates');
        return;
      }
      
      // Procesar templates combinando con productos
      const processedTemplates = templatesData.map(template => {
        const product = productsMap.get(template.product_id);
        return {
          id: template.id,
          procedure_id: template.procedure_id,
          product_id: template.product_id,
          quantity: template.quantity || 1,
          category: template.category || 'General',
          sort_order: 0, // Valor por defecto ya que la columna no existe
          product: product || null
        };
      }).filter(template => template.product); // Solo templates con productos válidos
      
      // Verificar cancelación antes de actualizar estado
      if (abortController?.signal.aborted) {
        console.log('⚠️ Carga cancelada antes de actualizar estado');
        return;
      }
      
      setTemplates(processedTemplates);
      
      // Extraer productos únicos disponibles
      const uniqueProducts = processedTemplates
        .filter(t => t.product)
        .map(t => ({
          id: t.product.id,
          name: t.product.name,
          description: t.product.description || '',
          brand: t.product.brand || '',
          price: t.product.price || 0,
          stock: t.product.stock || 0,
          available: t.product.available || false,
          category: t.product.category || 'General'
        }));
      
      setAvailableProducts(uniqueProducts);
      
      
      
    } catch (err) {
      // Solo manejar errores si no fue cancelada la carga
      if (abortController?.signal.aborted) {
        console.log('⚠️ Error ignorado debido a cancelación de carga');
        return;
      }
      
      console.error('❌ Error cargando templates:', err);
      
      // Manejo de errores más específico y robusto
      let errorMessage = "No se pudieron cargar los templates del procedimiento.";
      let shouldTryFallback = false;
      
      if (err instanceof Error) {
        if (err.message.includes('400')) {
          if (err.message.includes('Products')) {
            errorMessage = "Error cargando productos de los templates. Intentando método alternativo...";
          } else {
            errorMessage = "Error en la consulta de templates. Intentando método alternativo...";
          }
          shouldTryFallback = true;
        } else if (err.message.includes('404')) {
          errorMessage = "No se encontraron templates para este procedimiento.";
          shouldTryFallback = true;
        } else if (err.message.includes('500')) {
          errorMessage = "Error del servidor al cargar templates.";
        } else if (err.message.includes('PGRST')) {
          errorMessage = "Error de configuración de base de datos.";
        }
      }
      
      // Mostrar toast informativo solo si no fue cancelada
      if (!abortController?.signal.aborted) {
        toast({
          title: "⚠️ Advertencia",
          description: errorMessage,
          variant: shouldTryFallback ? "default" : "destructive"
        });
      }
      
      // Si es un error 400 o 404, intentar fallback
      if (shouldTryFallback && !abortController?.signal.aborted) {
        console.log('🔄 Intentando método de fallback...');
        try {
          // Intentar fallback general
          await loadProductsAsFallback();
          
          // Verificar cancelación antes de mostrar toast
          if (!abortController?.signal.aborted) {
            toast({
              title: "✅ Fallback Exitoso",
              description: "Se cargaron productos alternativos para continuar.",
              variant: "default"
            });
          }
          return; // Salir temprano si el fallback funciona
        } catch (fallbackError) {
          console.error('❌ Fallback también falló:', fallbackError);
          
          // Solo mostrar toast si no fue cancelada
          if (!abortController?.signal.aborted) {
            toast({
              title: "❌ Error Crítico",
              description: "No se pudieron cargar templates ni productos alternativos.",
              variant: "destructive"
            });
          }
        }
      }
      
      // Limpiar estados en caso de error solo si no fue cancelada
      if (!abortController?.signal.aborted) {
        setTemplates([]);
        setAvailableProducts([]);
      }
    } finally {
      // Solo actualizar estado de carga si no fue cancelada
      if (!abortController?.signal.aborted) {
        setIsLoadingTemplates(false);
      }
    }
  };

  // Función para cargar productos disponibles desde Products
  const loadAvailableProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('Products')
        .select('id, name, description, brand, price, stock, available, category')
        .eq('available', true)
        .order('category, name');
      
      if (error) throw error;
      setAvailableProducts(data || []);
    } catch (err) {
      console.error('Error cargando productos disponibles:', err);
    }
  };

  // Función para cargar productos disponibles usando el servicio existente
  const loadAvailableProductsFromService = async () => {
    try {
      console.log('🔄 Cargando productos disponibles desde orderEquipmentService...');
      const products = await orderEquipmentService.getAvailableProducts();
      
      // Transformar productos del servicio al formato esperado
      const transformedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        brand: '', // El servicio no tiene brand
        price: product.price,
        stock: product.stock_available,
        available: product.stock_available > 0,
        category: product.category,
        stock_warning: product.stock_warning
      }));
      
      setAvailableProducts(transformedProducts);
      
      
    } catch (err) {
      console.error('Error cargando productos desde servicio:', err);
      // Fallback a la función anterior si el servicio falla
      await loadAvailableProducts();
    }
  };



  // NUEVA: Función específica para fallback de productos cuando falla la consulta .in()
  const loadProductsFallbackForTemplates = async (productIds: string[]) => {
    try {
      console.log('🔄 Intentando fallback para productos específicos: ${productIds.length} IDs');
      
      // Intentar cargar productos uno por uno como último recurso
      const productsMap = new Map();
      
      for (const productId of productIds) {
        try {
          // Usar el servicio existente como fallback
          const products = await orderEquipmentService.getAvailableProducts();
          const foundProduct = products.find(p => p.id === productId);
          
          if (foundProduct) {
            // Transformar al formato esperado
            const transformedProduct = {
              id: foundProduct.id,
              name: foundProduct.name,
              description: foundProduct.description || '',
              brand: '',
              price: foundProduct.price,
              stock: foundProduct.stock_available,
              available: foundProduct.stock_available > 0,
              category: foundProduct.category
            };
            
            productsMap.set(productId, transformedProduct);
            console.log(`✅ Producto recuperado via fallback: ${foundProduct.name} (${productId})`);
          }
        } catch (productErr) {
          console.warn(`⚠️ No se pudo recuperar producto ${productId} via fallback:`, productErr);
        }
      }
      
      return productsMap;
      
    } catch (err) {
      console.error('❌ Error en fallback de productos específicos:', err);
      return new Map();
    }
  };

  // TAREA 3: Función refactorizada para cargar templates bajo demanda con nuevo sistema
  const loadTemplatesOnDemand = async (procedureId?: string) => {
    // Verificar si la carga fue cancelada antes de comenzar
    if (abortController?.signal.aborted) {
      console.log('⚠️ Carga bajo demanda cancelada');
      return false;
    }

    try {
      // Si no se proporciona procedureId, usar el del formulario
      const targetProcedureId = procedureId || procedures.find(p => p.name === formData.procedure)?.id;
      
      if (!targetProcedureId) {
        console.warn('⚠️ No hay procedimiento seleccionado para cargar templates');
        return false; // Retornar false para indicar fallo
      }

      console.log(`🔄 Cargando templates bajo demanda para procedimiento: ${targetProcedureId}`);
      
      // Verificar si ya tenemos templates cargados para este procedimiento
      if (templates.length > 0 && templates[0]?.procedure_id === targetProcedureId) {
        return true; // Retornar true para indicar éxito
      }

      // Cargar templates usando la función existente (ya refactorizada)
      await loadTemplatesByProcedure(targetProcedureId);
      
      // Verificar cancelación después de cargar templates
      if (abortController?.signal.aborted) {
        console.log('⚠️ Carga bajo demanda cancelada después de cargar templates');
        return false;
      }
      
      // Verificar el estado actualizado
      if (templates.length > 0) {
        return true;
      } else {

        
        // Verificar cancelación antes de intentar fallback
        if (abortController?.signal.aborted) {
          console.log('⚠️ Carga bajo demanda cancelada antes de fallback');
          return false;
        }
        
        // Intentar fallback
        await loadProductsAsFallback();
        
        // Verificar cancelación después del fallback
        if (abortController?.signal.aborted) {
          console.log('⚠️ Carga bajo demanda cancelada después del fallback');
          return false;
        }
        
        if (templates.length > 0) {
                  return true;
        } else {
          console.error('❌ Fallback también falló');
          return false;
        }
      }
      
    } catch (err) {
      // Solo manejar errores si no fue cancelada la carga
      if (abortController?.signal.aborted) {
        console.log('⚠️ Error ignorado debido a cancelación de carga bajo demanda');
        return false;
      }
      
      console.error('❌ Error cargando templates bajo demanda:', err);
      
      // En caso de error, intentar fallback solo si no fue cancelada
      if (!abortController?.signal.aborted) {
        try {
          await loadProductsAsFallback();
          return templates.length > 0; // Retornar true si el fallback funcionó
        } catch (fallbackErr) {
          console.error('❌ Fallback también falló:', fallbackErr);
          return false;
        }
      }
      
      return false;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadDoctors();
      loadSurgeryTypes();
      loadProcedures();
    }
  }, [isOpen]);

  // TAREA 2: useEffect para carga automática de templates
  useEffect(() => {
    // Solo ejecutar si hay un procedimiento seleccionado
    if (!currentProcedureId) {
      // Limpiar estado anterior si no hay procedimiento
      setTemplates([]);
      setAvailableProducts([]);
      setTemplatesLoadError(null);
      return;
    }

        // Cancelar carga anterior si existe
    if (abortController) {
      abortController.abort();
    }
    
    // Crear nuevo AbortController para esta carga
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    // Función para cargar templates con el nuevo sistema
    const loadTemplatesForProcedure = async () => {
      try {
        console.log(`🔄 Iniciando carga automática de templates para procedimiento: ${currentProcedureId}`);
        setIsLoadingTemplates(true);
        setTemplatesLoadError(null);
        
        // Limpiar estado anterior
        setTemplates([]);
        setAvailableProducts([]);

        // Verificar si la carga fue cancelada
        if (newAbortController.signal.aborted) {
          console.log('⚠️ Carga cancelada por cambio de procedimiento');
          return;
        }

        // Cargar templates usando la función existente pero con AbortController
        await loadTemplatesByProcedure(currentProcedureId);

        // Verificar nuevamente si fue cancelada
        if (newAbortController.signal.aborted) {
          console.log('⚠️ Carga cancelada después de completarse');
          return;
        }


      } catch (error) {
        // Solo mostrar error si no fue cancelada
        if (!newAbortController.signal.aborted) {
          console.error('❌ Error en carga automática de templates:', error);
          setTemplatesLoadError('Error cargando templates del procedimiento');
        }
      } finally {
        // Solo actualizar estado si no fue cancelada
        if (!newAbortController.signal.aborted) {
          setIsLoadingTemplates(false);
        }
      }
    };

    // Ejecutar carga automática
    loadTemplatesForProcedure();

    // Cleanup function
    return () => {
      if (newAbortController && !newAbortController.signal.aborted) {
        newAbortController.abort();
      }
    };
  }, [currentProcedureId]); // Solo se ejecuta cuando cambia currentProcedureId

  // TAREA 2: Limpiar estado cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      // Limpiar todos los estados relacionados con templates
      setCurrentProcedureId(null);
      setTemplates([]);
      setAvailableProducts([]);
      setTemplatesLoadError(null);
      setIsLoadingTemplates(false);
      
      // Cancelar cualquier carga en progreso
      if (abortController) {
        abortController.abort();
        setAbortController(null);
      }
    }
  }, [isOpen, abortController]);

  // TAREA 5: Optimizar carga de templates cuando se llega al paso 4
  useEffect(() => {
    optimizeTemplatesForStep4();
  }, [currentStep, templates.length, formData.procedure, isLoadingTemplates]);

  // Estados para gestión de médicos
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState('');
  const [showDoctorList, setShowDoctorList] = useState(false);

  const totalSteps = 4; // Aumentado a 4 pasos para incluir selección de paquete
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Función para actualizar el formulario
  const updateFormData = (field: keyof NewOrderFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para verificar si la cirugía está en menos de 3 horas
  const checkSurgeryTimeWarning = (date: string, time: string) => {
    if (!date || !time) return false;
    
    const now = new Date();
    // El date ya viene en formato ISO (yyyy-MM-dd) del DateInput
    const surgeryDateTime = new Date(`${date}T${time}`);
    const timeDifference = surgeryDateTime.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    
    return hoursDifference < 3 && hoursDifference > 0;
  };

  // Función para manejar cambios en fecha/hora con validación
  const handleDateTimeChange = (field: 'surgeryDate' | 'surgeryTime', value: string) => {
    const newDate = field === 'surgeryDate' ? value : formData.surgeryDate;
    const newTime = field === 'surgeryTime' ? value : formData.surgeryTime;
    
    // Si ambos campos están llenos, verificar el warning
    if (newDate && newTime) {
      if (checkSurgeryTimeWarning(newDate, newTime)) {
        setPendingDateTime({ date: newDate, time: newTime });
        setShowTimeWarning(true);
        return;
      }
    }
    
    updateFormData(field, value);
  };

  const confirmDateTimeWithWarning = () => {
    if (pendingDateTime) {
      updateFormData('surgeryDate', pendingDateTime.date);
      updateFormData('surgeryTime', pendingDateTime.time);
    }
    setShowTimeWarning(false);
    setPendingDateTime(null);
  };

  const cancelDateTimeWithWarning = () => {
    setShowTimeWarning(false);
    setPendingDateTime(null);
  };

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    updateFormData('doctorId', doctor.id);
    updateFormData('doctorName', `${doctor.display_name} ${doctor.last_name}`);
    setShowDoctorList(false);
    setDoctorSearchQuery('');
  };

  // TAREA 5: Función handleSurgeryTypeChange optimizada para mejor experiencia
  const handleSurgeryTypeChange = (surgeryTypeName: string) => {
    updateFormData('surgeryType', surgeryTypeName);
    updateFormData('procedure', ''); // Resetear procedimiento cuando cambia el tipo de cirugía
    // setSelectedPackage(null); // Resetear paquete seleccionado
    
    // TAREA 2: Limpiar currentProcedureId cuando cambia el tipo de cirugía
    setCurrentProcedureId(null);
    setTemplates([]);
    setAvailableProducts([]);
    setTemplatesLoadError(null);
    
    // Encontrar el ID del tipo de cirugía seleccionado
    const selectedSurgeryType = surgeryTypes.find(type => type.name === surgeryTypeName);
    if (selectedSurgeryType) {
      loadProcedures(selectedSurgeryType.id);
    }
  };

  // TAREA 5: Función handleProcedureChange optimizada para mejor experiencia de usuario
  const handleProcedureChange = (procedureName: string) => {
    updateFormData('procedure', procedureName);
    
    if (procedureName) {
      const selectedProcedure = procedures.find(p => p.name === procedureName);
      if (selectedProcedure) {
              // TAREA 2: Actualizar currentProcedureId para activar carga automática
      setCurrentProcedureId(selectedProcedure.id);
      }
    } else {
      // Limpiar estado si no hay procedimiento seleccionado
      setCurrentProcedureId(null);
      setTemplates([]);
      setAvailableProducts([]);
      setTemplatesLoadError(null);
      
      
    }
  };

  // TAREA 5: Función para manejar cambios de procedimiento de forma elegante
  const handleProcedureChangeElegant = (procedureName: string) => {
    // Si ya hay templates cargando, cancelar la carga anterior
    if (isLoadingTemplates && abortController) {
      abortController.abort();
    }
    
    // Actualizar el procedimiento
    handleProcedureChange(procedureName);
  };

  // TAREA 5: Función para optimizar la carga cuando se llega al paso 4
  const optimizeTemplatesForStep4 = () => {
    // Si llegamos al paso 4 y no hay templates cargados pero hay un procedimiento seleccionado
    if (currentStep === 4 && templates.length === 0 && formData.procedure && !isLoadingTemplates) {
      // Buscar el procedimiento seleccionado
      const selectedProcedure = procedures.find(p => p.name === formData.procedure);
      if (selectedProcedure) {
        // Reactivar la carga automática
        setCurrentProcedureId(selectedProcedure.id);
      }
    }
  };

  // Filtrar médicos según búsqueda
  const filteredDoctors = doctors.filter(doctor => 
    `${doctor.display_name} ${doctor.last_name}`.toLowerCase().includes(doctorSearchQuery.toLowerCase()) ||
    doctor.email?.toLowerCase().includes(doctorSearchQuery.toLowerCase())
  );

  // TAREA 5: Función de validación optimizada que no bloquea por carga de templates
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!selectedDoctor;
      case 2:
        return !!formData.patientName && !!formData.surgeryDate && !!formData.surgeryTime;
      case 3:
        // TAREA 5: Permitir avanzar aunque los templates estén cargando
        // Los templates se cargan en background y no bloquean la navegación
        return !!formData.surgeryType && !!formData.surgeryLocation && !!formData.procedure;
      case 4:
        // TAREA 5: El paso 4 es opcional, no bloquear por estado de templates
        // Los equipos se pueden agregar más tarde desde la vista de detalles
        return true;
      default:
        return false;
    }
  };

  const isSurgeryDateValid = () => {
    if (!formData.surgeryDate) return false;
    // El date ya viene en formato ISO (yyyy-MM-dd) del DateInput
    const selectedDate = new Date(formData.surgeryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  const checkSurgeryOverlap = async () => {
    if (!selectedDoctor || !formData.surgeryDate || !formData.surgeryTime) return;
    try {
      const start = new Date(`${formData.surgeryDate}T${formData.surgeryTime}`);
      const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // 4h estimadas

      // Traer órdenes del mismo doctor en el mismo día
      const { data, error } = await supabase
        .from('Orders')
        .select('id, surgery_date, surgery_time, status')
        .eq('user_id', selectedDoctor.id)
        .eq('surgery_date', formData.surgeryDate);

      if (error) throw error;

      const overlapping = (data || []).filter((o: any) => {
        // Ignorar la orden que aún no existe; si editáramos, excluiríamos por id
        const oStart = new Date(`${o.surgery_date}T${(o.surgery_time || '00:00:00')}`);
        const oEnd = new Date(oStart.getTime() + 4 * 60 * 60 * 1000);
        return start < oEnd && oStart < end; // condición de traslape real
      });

      const hasOverlap = overlapping.length > 0;
      setValidationResults(prev => ({
        ...prev,
        surgeryOverlap: { hasOverlap, overlappingOrders: overlapping }
      }));

      if (hasOverlap) {
        toast({
          title: '⚠️ Advertencia de Traslape',
          description: 'El médico tiene otra cirugía programada en el mismo rango horario.',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error verificando traslape:', err);
    }
  };

  const runValidations = async () => {
    setIsValidating(true);
    try {
      await checkSurgeryOverlap();
    } catch (err) {
      console.error('Error en validaciones:', err);
    } finally {
      setIsValidating(false);
    }
  };

  // TAREA 5: Función nextStep optimizada para manejo de templates
  const nextStep = async () => {
    if (!validateCurrentStep()) return;
    
    if (currentStep === 2) {
      await runValidations();
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePackageSelection = () => {
    // if (optimizedPackage) { // Eliminado
    //   setSelectedPackage(optimizedPackage);
    //   setShowPackagePreview(false);
    // }
  };

  // Función para limpiar equipos seleccionados
  const clearSelectedEquipment = () => {
    setSelectedEquipment([]);
    toast({
      title: "🗑️ Equipos Limpiados",
      description: "Se han removido todos los equipos seleccionados.",
    });
  };

  // Función para agregar equipos de ejemplo (temporal)
  const addSampleEquipment = (type: 'individual' | 'package') => {
    if (type === 'individual') {
      if (templates.length > 0) {
        // Usar templates reales si están disponibles
        const equipmentFromTemplates = templates
          .filter(t => t.product)
          .map(template => ({
            product_name: template.product.name,
            quantity: template.quantity || 1,
            price: template.product.price || 0,
            product_id: template.product.id,
            category: template.category || 'General'
          }));
        
        setSelectedEquipment(equipmentFromTemplates);
        toast({
          title: "✅ Equipos de Templates Agregados",
          description: `Se han agregado ${equipmentFromTemplates.length} equipos desde los templates del procedimiento.`,
        });
      } else {
        // Fallback a equipos de ejemplo si no hay templates
        const mockIndividualEquipment = [
          {
            product_name: 'Monitor de Signos Vitales',
            quantity: 1,
            price: 150.00,
            product_id: 'mock-1',
            category: 'Equipo'
          },
          {
            product_name: 'Bomba de Infusión',
            quantity: 1,
            price: 200.00,
            product_id: 'mock-2',
            category: 'Equipo'
          }
        ];
        setSelectedEquipment(mockIndividualEquipment);
        toast({
          title: "✅ Equipos Individuales Agregados",
          description: "Se han agregado 2 equipos individuales de ejemplo a la orden.",
        });
      }
    } else {
      if (templates.length > 0) {
        // Crear paquete basado en templates disponibles
        const totalValue = templates.reduce((sum, t) => sum + ((t.product?.price || 0) * (t.quantity || 1)), 0);
        const packageEquipment = [
          {
            product_name: `Paquete ${formData.procedure}`,
            quantity: 1,
            price: totalValue,
            product_id: 'package-template',
            category: 'Paquete',
            is_package: true,
            package_details: templates.map(t => ({
              name: t.product?.name,
              quantity: t.product?.quantity,
              price: t.product?.price
            }))
          }
        ];
        setSelectedEquipment(packageEquipment);
        toast({
          title: "✅ Paquete de Templates Creado",
          description: `Se ha creado un paquete con ${templates.length} equipos del procedimiento.`,
        });
      } else {
        // Fallback a paquete de ejemplo
        const mockPackageEquipment = [
          {
            product_name: 'Paquete Básico de Cirugía',
            quantity: 1,
            price: 500.00,
            product_id: 'mock-package',
            category: 'Paquete'
          }
        ];
        setSelectedEquipment(mockPackageEquipment);
        toast({
          title: "✅ Paquete Seleccionado",
          description: "Se ha agregado el paquete básico de cirugía de ejemplo a la orden.",
        });
      }
    }
    setShowEquipmentModal(false);
  };

  // Estados para modal funcional de equipos
  const [showIndividualEquipmentModal, setShowIndividualEquipmentModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedIndividualProducts, setSelectedIndividualProducts] = useState<Set<string>>(new Set());
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Función para abrir modal de equipos individuales
  const openIndividualEquipmentModal = () => {
    setShowIndividualEquipmentModal(true);
    setSelectedIndividualProducts(new Set());
    setProductQuantities({});
    setSearchQuery('');
    setSelectedCategory('all');
  };

  // Función para abrir modal de paquetes
  const openPackageModal = () => {
    setShowPackageModal(true);
  };

  // Función para seleccionar/deseleccionar producto individual
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedIndividualProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
      // Limpiar cantidad cuando se deselecciona
      const newQuantities = { ...productQuantities };
      delete newQuantities[productId];
      setProductQuantities(newQuantities);
    } else {
      newSelected.add(productId);
      // Establecer cantidad por defecto
      setProductQuantities(prev => ({
        ...prev,
        [productId]: 1
      }));
    }
    setSelectedIndividualProducts(newSelected);
  };

  // Función para cambiar cantidad de un producto
  const changeProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setProductQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  // Función para confirmar selección de equipos individuales
  const confirmIndividualEquipmentSelection = () => {
    const selectedProducts = Array.from(selectedIndividualProducts).map(productId => {
      const product = availableProducts.find(p => p.id === productId);
      const quantity = productQuantities[productId] || 1;
      return {
        product_name: product?.name || 'Producto no encontrado',
        quantity: quantity,
        price: product?.price || 0,
        product_id: productId,
        category: product?.category || 'General'
      };
    });

    setSelectedEquipment(selectedProducts);
    setShowIndividualEquipmentModal(false);
    
    toast({
      title: "✅ Equipos Individuales Seleccionados",
      description: `Se han seleccionado ${selectedProducts.length} equipos individuales.`,
    });
  };

  // Función para validar stock y disponibilidad
  const validateProductSelection = (productId: string, quantity: number): { isValid: boolean; message: string } => {
    const product = availableProducts.find(p => p.id === productId);
    
    if (!product) {
      return { isValid: false, message: 'Producto no encontrado' };
    }
    
    if (!product.available) {
      return { isValid: false, message: 'Producto no disponible' };
    }
    
    if (quantity > product.stock) {
      return { isValid: false, message: `Stock insuficiente. Disponible: ${product.stock}` };
    }
    
    if (product.stock_warning && quantity > product.stock * 0.8) {
      return { isValid: true, message: `⚠️ Stock bajo. Solo quedan ${product.stock} unidades` };
    }
    
    return { isValid: true, message: 'Producto válido' };
  };

  // Función para confirmar selección con validación
  const confirmIndividualEquipmentSelectionWithValidation = () => {
    const errors: string[] = [];
    const validProducts: any[] = [];
    
    // Validar cada producto seleccionado
    Array.from(selectedIndividualProducts).forEach(productId => {
      const quantity = productQuantities[productId] || 1;
      const validation = validateProductSelection(productId, quantity);
      
      if (!validation.isValid) {
        errors.push(`Producto ${availableProducts.find(p => p.id === productId)?.name}: ${validation.message}`);
      } else {
        if (validation.message.includes('⚠️')) {
          // Mostrar advertencia pero permitir continuar
          toast({
            title: "⚠️ Advertencia de Stock",
            description: validation.message,
            variant: "default"
          });
        }
        
        const product = availableProducts.find(p => p.id === productId);
        validProducts.push({
          product_name: product?.name || 'Producto no encontrado',
          quantity: quantity,
          price: product?.price || 0,
          product_id: productId,
          category: product?.category || 'General'
        });
      }
    });
    
    if (errors.length > 0) {
      toast({
        title: "❌ Errores de Validación",
        description: errors.join('\n'),
        variant: "destructive"
      });
      return;
    }
    
    if (validProducts.length === 0) {
      toast({
        title: "⚠️ No hay productos válidos",
        description: "Selecciona al menos un producto válido.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedEquipment(validProducts);
    setShowIndividualEquipmentModal(false);
    
    toast({
      title: "✅ Equipos Individuales Seleccionados",
      description: `Se han seleccionado ${validProducts.length} equipos individuales.`,
    });
  };

  // Función para crear paquete personalizado
  const createCustomPackage = () => {
    if (templates.length === 0) {
      toast({
        title: "⚠️ No hay templates disponibles",
        description: "No se pueden crear paquetes sin templates del procedimiento.",
        variant: "destructive"
      });
      return;
    }

    // Crear paquete basado en templates disponibles
    const totalValue = templates.reduce((sum, t) => sum + ((t.product?.price || 0) * (t.quantity || 1)), 0);
    const packageEquipment = [
      {
        product_name: `Paquete ${formData.procedure}`,
        quantity: 1,
        price: totalValue,
        product_id: 'package-template',
        category: 'Paquete',
        is_package: true,
        package_details: templates.map(t => ({
          name: t.product?.name,
          quantity: t.quantity,
          price: t.product?.price
        }))
      }
    ];

    setSelectedEquipment(packageEquipment);
    setShowPackageModal(false);
    
    toast({
      title: "✅ Paquete Personalizado Creado",
      description: `Se ha creado un paquete con ${templates.length} equipos del procedimiento.`,
    });
  };

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = availableProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas
  const uniqueCategories = ['all', ...Array.from(new Set(availableProducts.map(p => p.category).filter(Boolean)))];

  // Función para manejar el envío del formulario con protección contra race conditions
  const handleSubmit = async () => {
    // Prevenir múltiples envíos simultáneos
    if (isSubmitting) {
      console.log('⚠️ Formulario ya se está enviando, ignorando envío adicional');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validar permisos antes de proceder
      const permissionsValidation = validateUserPermissions();
      if (!permissionsValidation.canCreateOrder) {
        toast({
          title: "❌ Sin Permisos",
          description: permissionsValidation.message,
          variant: "destructive"
        });
        return;
      }
      
      // Validar que todos los campos requeridos estén completos
      if (!formData.doctorId || !formData.patientName || !formData.surgeryDate || 
          !formData.surgeryTime || !formData.surgeryType || !formData.surgeryLocation || 
          !formData.procedure) {
        toast({
          title: "⚠️ Campos Requeridos",
          description: "Por favor, completa todos los campos obligatorios.",
          variant: "destructive"
        });
        return;
      }
      
      // Obtener el procedimiento seleccionado
      console.log('🔍 Buscando procedimiento seleccionado:', {
        formDataProcedure: formData.procedure,
        proceduresCount: procedures.length,
        procedures: procedures.map(p => ({ id: p.id, name: p.name }))
      });
      
      const selectedProcedure = procedures.find(p => p.name === formData.procedure);
      console.log('🔍 Resultado de búsqueda:', {
        selectedProcedure,
        found: !!selectedProcedure,
        selectedProcedureId: selectedProcedure?.id
      });
      
      if (!selectedProcedure) {
        console.error('❌ Procedimiento no encontrado:', {
          formDataProcedure: formData.procedure,
          availableProcedures: procedures.map(p => p.name)
        });
        toast({
          title: "❌ Error",
          description: "No se pudo encontrar el procedimiento seleccionado.",
          variant: "destructive"
        });
        return;
      }

      // Crear la orden usando el servicio
      const orderData = {
        user_id: formData.doctorId,
        procedure_id: selectedProcedure.id,
        patient_name: formData.patientName,
        surgery_date: formData.surgeryDate,
        surgery_time: formData.surgeryTime,
        surgery_location: formData.surgeryLocation,
        coverage_type: formData.coverageType === 'none' ? undefined : formData.coverageType,
        insurance_name: formData.insuranceName,
        notes: formData.notes,
        selected_equipment: selectedEquipment // Incluir información de los equipos seleccionados
      };

      console.log('📋 Datos de la orden a crear:', {
        orderData,
        selectedProcedure: {
          id: selectedProcedure.id,
          name: selectedProcedure.name
        }
      });

      const createdOrder = await orderService.createOrder(orderData);
      
      // Si hay equipos seleccionados, persistirlos usando el servicio
      if (selectedEquipment.length > 0) {
        try {
          console.log('🔄 Persistiendo equipos para la orden creada:', createdOrder.id);
          
          // Transformar equipos al formato del servicio
          const serviceEquipment = selectedEquipment.map(eq => ({
            order_id: createdOrder.id,
            product_id: eq.product_id,
            product_name: eq.product_name,
            category: eq.category,
            quantity: eq.quantity,
            price: eq.price,
            notes: eq.is_package ? `Paquete: ${eq.product_name}` : 'Equipo individual',
            confirmed: false,
            is_from_package: eq.is_package || false,
            package_id: eq.is_package ? eq.product_id : undefined
          }));
          
          // Persistir equipos usando el servicio
          console.log('✅ Equipos preparados para persistencia:', serviceEquipment);
          
          // Persistir equipos en la base de datos
          const persistedEquipment = await orderEquipmentService.addMultipleEquipmentToOrder(createdOrder.id, serviceEquipment);
          console.log('✅ Equipos persistidos exitosamente:', persistedEquipment.length);
          
        } catch (equipmentError) {
          console.error('❌ Error persistiendo equipos:', equipmentError);
          // No fallar la creación de la orden por errores de equipos
          toast({
            title: "⚠️ Advertencia",
            description: "La orden se creó pero hubo un problema al guardar los equipos. Puedes agregarlos más tarde.",
            variant: "default"
          });
        }
      }
      
      // Solo llamar a onSubmit si está definido (aunque ya no lo usamos)
      if (onSubmit) {
        onSubmit(createdOrder);
      }
      
      // Mostrar mensaje de éxito apropiado
      const successMessage = selectedEquipment.length > 0 
        ? "La orden ha sido creada exitosamente con equipos seleccionados."
        : "La orden ha sido creada exitosamente. Puedes agregar equipos más tarde desde la vista de detalles.";
      
      toast({
        title: "✅ Orden Creada",
        description: successMessage,
      });
      
      console.log('✅ Orden creada exitosamente, cerrando modal y recargando lista...');
      
      // Cerrar el modal inmediatamente después de crear la orden
      onClose();
      
      // Resetear el formulario
      setFormData({
        doctorId: '',
        doctorName: '',
        patientName: '',
        surgeryDate: '',
        surgeryTime: '',
        surgeryType: '',
        surgeryLocation: '',
        procedure: '',
        coverageType: 'none',
        notes: ''
      });
      
      // Resetear estados de equipos
      setSelectedEquipment([]);
      setShowEquipmentModal(false);
      setShowIndividualEquipmentModal(false);
      setShowPackageModal(false);
      
      // Resetear estados de médicos
      setSelectedDoctor(null);
      setDoctorSearchQuery('');
      setShowDoctorList(false);
      
      // Resetear paso actual
      setCurrentStep(1);
      
      // Llamar al callback de creación de orden
      if (onOrderCreated) {
        onOrderCreated();
      }
    } catch (error) {
      console.error('Error creating order:', error);
      
      // Manejo específico de errores
      let errorMessage = "No se pudo crear la orden. Por favor, intenta de nuevo.";
      let errorTitle = "❌ Error";
      
      if (error instanceof Error) {
        // Error de ID duplicado (409 Conflict)
        if (error.message.includes('23505') || error.message.includes('unique_violation')) {
          errorMessage = "Error de ID duplicado. Se está reintentando automáticamente...";
          errorTitle = "🔄 Reintentando";
        }
        // Error de referencia (foreign key)
        else if (error.message.includes('23503') || error.message.includes('foreign_key_violation')) {
          errorMessage = "Error de referencia: Verifica que el médico y procedimiento sean válidos.";
          errorTitle = "⚠️ Error de Referencia";
        }
        // Error de validación
        else if (error.message.includes('23514') || error.message.includes('check_violation')) {
          errorMessage = "Error de validación: Verifica que todos los campos requeridos estén completos.";
          errorTitle = "⚠️ Error de Validación";
        }
        // Error de conexión
        else if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = "Error de conexión. Verifica tu conexión a internet e intenta de nuevo.";
          errorTitle = "🌐 Error de Conexión";
        }
        // Error específico del servidor
        else if (error.message.includes('409')) {
          errorMessage = "Conflicto en la base de datos. Se está reintentando automáticamente...";
          errorTitle = "🔄 Reintentando";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: errorTitle.includes("Reintentando") ? "default" : "destructive"
      });
      
      // Si es un error de ID duplicado o 409, no cerrar el modal para permitir reintento
      if (error instanceof Error && 
          (error.message.includes('23505') || error.message.includes('409'))) {
        return; // No cerrar el modal, permitir reintento
      }
      
      // Para otros errores, cerrar el modal
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para persistir equipos seleccionados usando el servicio
  const persistSelectedEquipment = async (equipment: any[]) => {
    try {
      console.log('🔄 Persistiendo equipos seleccionados...', equipment);
      
      // Transformar equipos al formato del servicio
      const serviceEquipment = equipment.map(eq => ({
        order_id: 'temp-order', // Se actualizará cuando se cree la orden
        product_id: eq.product_id,
        product_name: eq.product_name,
        category: eq.category,
        quantity: eq.quantity,
        price: eq.price,
        notes: eq.is_package ? `Paquete: ${eq.product_name}` : 'Equipo individual',
        confirmed: false,
        is_from_package: eq.is_package || false,
        package_id: eq.is_package ? eq.product_id : undefined
      }));
      
      // Por ahora solo guardamos en estado local
      // Cuando se cree la orden, se persistirán usando orderEquipmentService
      setSelectedEquipment(equipment);
      
      console.log('✅ Equipos persistidos localmente:', serviceEquipment);
      
    } catch (error) {
      console.error('❌ Error persistiendo equipos:', error);
      toast({
        title: "❌ Error",
        description: "No se pudieron persistir los equipos seleccionados.",
        variant: "destructive"
      });
    }
  };

  // Función para confirmar selección con persistencia
  const confirmIndividualEquipmentSelectionWithPersistence = async () => {
    const errors: string[] = [];
    const validProducts: any[] = [];
    
    // Validar cada producto seleccionado
    Array.from(selectedIndividualProducts).forEach(productId => {
      const quantity = productQuantities[productId] || 1;
      const validation = validateProductSelection(productId, quantity);
      
      if (!validation.isValid) {
        errors.push(`Producto ${availableProducts.find(p => p.id === productId)?.name}: ${validation.message}`);
      } else {
        if (validation.message.includes('⚠️')) {
          // Mostrar advertencia pero permitir continuar
          toast({
            title: "⚠️ Advertencia de Stock",
            description: validation.message,
            variant: "default"
          });
        }
        
        const product = availableProducts.find(p => p.id === productId);
        validProducts.push({
          product_name: product?.name || 'Producto no encontrado',
          quantity: quantity,
          price: product?.price || 0,
          product_id: productId,
          category: product?.category || 'General'
        });
      }
    });
    
    if (errors.length > 0) {
      toast({
        title: "❌ Errores de Validación",
        description: errors.join('\n'),
        variant: "destructive"
      });
      return;
    }
    
    if (validProducts.length === 0) {
      toast({
        title: "⚠️ No hay productos válidos",
        description: "Selecciona al menos un producto válido.",
        variant: "destructive"
      });
      return;
    }
    
    // Persistir equipos seleccionados
    await persistSelectedEquipment(validProducts);
    setShowIndividualEquipmentModal(false);
    
    toast({
      title: "✅ Equipos Individuales Seleccionados",
      description: `Se han seleccionado y persistido ${validProducts.length} equipos individuales.`,
    });
  };

  // Renderizar el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Médico seleccionado o búsqueda */}
            {selectedDoctor ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Médico Seleccionado</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDoctor(null);
                      setShowDoctorList(false);
                    }}
                  >
                    Cambiar Médico
                  </Button>
                </div>
                
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Avatar del médico */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {selectedDoctor.display_name?.charAt(0) || 'M'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Información del médico */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-xl font-bold text-gray-900">
                          {selectedDoctor.display_name} {selectedDoctor.last_name}
                        </h4>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {selectedDoctor.role}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-600">{selectedDoctor.email}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-600">
                              {selectedDoctor.phone_number || 'Sin teléfono registrado'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-600">
                              Cédula: {selectedDoctor.cedula || 'No registrada'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Información adicional */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>ID de Usuario: {selectedDoctor.id}</span>
                          <span>Registrado desde: {selectedDoctor.created_at ? new Date(selectedDoctor.created_at).toLocaleDateString('es-ES') : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seleccionar Médico</h3>
                
                {/* Búsqueda de médicos */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar por nombre del médico..."
                      value={doctorSearchQuery}
                      onChange={(e) => setDoctorSearchQuery(e.target.value)}
                      onFocus={() => setShowDoctorList(true)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Lista de médicos */}
                {showDoctorList && (
                  <div className="max-h-64 overflow-y-auto border rounded-md">
                    {filteredDoctors.length > 0 ? (
                      filteredDoctors.map(doctor => (
                        <div 
                          key={doctor.id}
                          className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleDoctorSelect(doctor)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{`${doctor.display_name} ${doctor.last_name}`}</div>
                              <div className="text-sm text-gray-600">{doctor.email}</div>
                              <div className="text-sm text-gray-500">{doctor.role} • Médico</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">{doctor.phone_number || 'Sin teléfono'}</div>
                              <div className="text-xs text-gray-500">Médico registrado</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No se encontraron médicos
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Paciente y Cirugía</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Nombre del Paciente *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => updateFormData('patientName', e.target.value)}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surgeryDate">Fecha de Cirugía *</Label>
                <DateInput
                  value={formData.surgeryDate}
                  onChange={(value) => handleDateTimeChange('surgeryDate', value)}
                  placeholder="dd/mm/yyyy"
                  required
                  minDate={new Date()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surgeryTime">Hora de Cirugía *</Label>
                <TimePicker
                  id="surgeryTime"
                  value={formData.surgeryTime}
                  onChange={(val) => handleDateTimeChange('surgeryTime', val)}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalles de la Cirugía</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surgeryType">Tipo de Cirugía *</Label>
                <Select
                  value={formData.surgeryType}
                  onValueChange={(value) => handleSurgeryTypeChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de cirugía" />
                  </SelectTrigger>
                  <SelectContent>
                    {surgeryTypes.map(type => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="surgeryLocation">Lugar de la Cirugía *</Label>
                <Input
                  id="surgeryLocation"
                  value={formData.surgeryLocation}
                  onChange={(e) => updateFormData('surgeryLocation', e.target.value)}
                  placeholder="Ej: Hospital ABC, Sala 3"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="procedure">Procedimiento *</Label>
                <Select
                  value={formData.procedure}
                  onValueChange={(value) => handleProcedureChangeElegant(value)}
                  disabled={!formData.surgeryType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.surgeryType ? "Seleccionar procedimiento" : "Primero selecciona un tipo de cirugía"} />
                  </SelectTrigger>
                  <SelectContent>
                    {procedures.map(procedure => (
                      <SelectItem key={procedure.id} value={procedure.name}>
                        {procedure.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* TAREA 4: Indicador de carga automática de templates */}
                {isLoadingTemplates && formData.procedure && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2 text-blue-700">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-xs">Cargando templates automáticamente...</span>
                    </div>
                  </div>
                )}
                
                {/* TAREA 4: Indicador de error de carga */}
                {!isLoadingTemplates && templatesLoadError && formData.procedure && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs">❌ Error al cargar templates</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coverageType">Tipo de Cobertura</Label>
                <Select
                  value={formData.coverageType}
                  onValueChange={(value: 'Privado' | 'Seguro' | '') => updateFormData('coverageType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cobertura (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin especificar</SelectItem>
                    <SelectItem value="Privado">Privado</SelectItem>
                    <SelectItem value="Seguro">Seguro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {formData.coverageType === 'Seguro' && (
              <div className="space-y-2">
                <Label htmlFor="insuranceName">Nombre de la Aseguradora</Label>
                <Input
                  id="insuranceName"
                  value={formData.insuranceName || ''}
                  onChange={(e) => updateFormData('insuranceName', e.target.value)}
                  placeholder="Ej: Axxa, MetLife, etc."
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                placeholder="Notas adicionales sobre la cirugía..."
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Selección de Equipos (Opcional)</h3>
              <p className="text-sm text-gray-600">
                Puedes agregar equipos ahora o continuar sin ellos y agregarlos más tarde
              </p>
            </div>

                {/* Información del procedimiento seleccionado */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">
                          Procedimiento: {formData.procedure}
                        </h4>
                        <p className="text-sm text-blue-700">
                          Tipo de Cirugía: {formData.surgeryType}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

            {/* TAREA 5: Sección de template optimizada para mejor experiencia */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Package className="h-5 w-5 text-blue-600" />
                  {isLoadingTemplates ? 'Cargando Plantilla...' : 
                   templates.length > 0 ? 'Plantilla Disponible' : 'Sin Plantilla Predefinida'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingTemplates ? (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-sm text-blue-600">
                      Buscando plantilla para: <strong>{formData.procedure}</strong>
                    </p>
                  </div>
                ) : templates.length > 0 ? (
                  <>
                    <p className="text-sm text-green-600">
                      ✅ Hemos encontrado una plantilla predefinida con <strong>{templates.length} equipos recomendados</strong> para este procedimiento.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => {
                          // TAREA 5: Aplicar template inmediatamente sin carga adicional
                          const templateEquipment = templates.map(template => ({
                            id: `template-${template.id}`,
                            product_id: template.product_id,
                            product_name: template.product?.name || 'Producto',
                            category: template.category || 'General',
                            quantity: template.quantity || 1,
                            price: template.product?.price || 0,
                            confirmed: false,
                            is_from_package: true,
                            package_id: `template-${template.id}`,
                            notes: `Aplicado desde template: ${template.category}`
                          }));
                          setSelectedEquipment(templateEquipment);
                          toast({
                            title: "✅ Template Aplicado",
                            description: `${templateEquipment.length} equipos del template han sido agregados automáticamente.`,
                          });
                        }}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                        size="lg"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Aplicar Plantilla ({templates.length} equipos)
                      </Button>
                      
                      <Button 
                        onClick={() => setShowPackageModal(true)}
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 flex-1"
                        size="lg"
                      >
                        <Eye className="h-5 w-5 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      No hay plantilla predefinida para este procedimiento, pero puedes seleccionar equipos individuales.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={loadProductsAsFallback}
                        className="bg-blue-600 hover:bg-blue-700 flex-1"
                        size="lg"
                      >
                        <Package className="h-5 w-5 mr-2" />
                        Cargar Productos Disponibles
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* TAREA 4: Indicador de error cuando falla la carga de templates */}
            {!isLoadingTemplates && templatesLoadError && (
              <Card className="bg-red-50 border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-900">
                    <AlertCircle className="h-5 w-5" />
                    Error al Cargar Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-3">
                    <p className="text-red-700 font-medium mb-2">
                      ❌ No se pudieron cargar los templates del procedimiento
                    </p>
                    <p className="text-sm text-red-600 mb-3">
                      {templatesLoadError}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setTemplatesLoadError(null);
                          if (currentProcedureId) {
                            // Reactivar la carga automática
                            setCurrentProcedureId(null);
                            setTimeout(() => setCurrentProcedureId(currentProcedureId), 100);
                          }
                        }}
                        className="border-red-300 text-red-700 hover:bg-red-100"
                      >
                        🔄 Reintentar Carga
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={loadProductsAsFallback}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        🔄 Cargar Productos Alternativos
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* NOTA: Los botones de "Agregar Equipos" y "Continuar Sin Equipos" han sido removidos */}
            {/* Los equipos se pueden agregar más tarde desde la vista de detalles de la orden */}

            {/* TAREA 4: Indicador de carga de templates mejorado */}
            {isLoadingTemplates && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Cargando Templates del Procedimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-blue-700 font-medium mb-2">
                      Buscando equipos disponibles para: <strong>{formData.procedure}</strong>
                    </p>
                    <p className="text-sm text-blue-600">
                      Esto puede tomar unos segundos mientras verificamos la disponibilidad...
                    </p>
                    
                    {/* Barra de progreso animada */}
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-4 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAREA 4: Indicador de éxito cuando los templates se cargan - ELIMINADO */}

            {/* Resumen de equipos seleccionados */}
            {selectedEquipment.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <CheckCircle className="h-5 w-5" />
                    Equipos Seleccionados
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {selectedEquipment.length} {selectedEquipment.length === 1 ? 'equipo' : 'equipos'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedEquipment.map((equipment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex-1">
                          <div className="font-medium text-green-900">{equipment.product_name}</div>
                          <div className="text-sm text-green-700">
                            Categoría: {equipment.category} • Cantidad: {equipment.quantity}
                          </div>
                          {equipment.is_package && equipment.package_details && (
                            <div className="text-xs text-green-600 mt-1">
                              <strong>Paquete incluye:</strong> {equipment.package_details.length} equipos
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-medium text-green-700">
                            ${(equipment.price * equipment.quantity).toFixed(2)}
                          </div>
                          {equipment.is_package && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                              Paquete
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 font-medium">Total de equipos:</span>
                    <span className="text-green-800 font-bold">
                      ${selectedEquipment.reduce((sum, eq) => sum + (eq.price * eq.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="text-center">
                      <p className="text-sm text-green-600">
                        ✅ Los equipos se integrarán automáticamente con el sistema existente
                      </p>
                      <p className="text-xs text-green-500 mt-1">
                        Se pueden gestionar desde "Detalles de Orden → Editar Orden → Ver/Editar Orden"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            )}

            {/* Información adicional */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-4">
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-2">
                    💡 <strong>Recuerda:</strong> Los equipos son opcionales en este momento.
                  </p>
                  <p>
                    Puedes crear la orden ahora y agregar equipos más tarde desde la vista de detalles, 
                    donde tendrás acceso completo al sistema de gestión de equipos.
                  </p>
                </div>
                  </CardContent>
                </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Función para validar datos antes de enviar
  const validateFormData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Validación de información del médico
    if (!formData.doctorId || !formData.doctorName) {
      errors.push('Debe seleccionar un médico');
    }
    
    // Validación de información del paciente
    if (!formData.patientName.trim()) {
      errors.push('El nombre del paciente es obligatorio');
    }
    
    if (!formData.surgeryDate) {
      errors.push('La fecha de cirugía es obligatoria');
    }
    
    if (!formData.surgeryTime) {
      errors.push('La hora de cirugía es obligatoria');
    }
    
    // Validación de información de la cirugía
    if (!formData.surgeryType) {
      errors.push('Debe seleccionar un tipo de cirugía');
    }
    
    if (!formData.surgeryLocation) {
      errors.push('Debe seleccionar una ubicación de cirugía');
    }
    
    if (!formData.procedure) {
      errors.push('Debe seleccionar un procedimiento');
    }
    
    // Validación de fecha y hora
    if (formData.surgeryDate && formData.surgeryTime) {
      const surgeryDateTime = new Date(`${formData.surgeryDate}T${formData.surgeryTime}`);
      const now = new Date();
      
      if (surgeryDateTime <= now) {
        errors.push('La fecha y hora de cirugía debe ser futura');
      }
      
      // Validar que no sea más de 1 año en el futuro
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      if (surgeryDateTime > oneYearFromNow) {
        errors.push('La fecha de cirugía no puede ser más de 1 año en el futuro');
      }
    }
    
    // Validación de cobertura
    if (formData.coverageType === 'Seguro' && !formData.insuranceName?.trim()) {
      errors.push('Debe especificar el nombre del seguro');
    }
    
    // Validación de equipos (opcional pero con validación si se seleccionan)
    if (selectedEquipment.length > 0) {
      const invalidEquipment = selectedEquipment.filter(eq => 
        !eq.product_id || !eq.product_name || eq.quantity < 1 || eq.price < 0
      );
      
      if (invalidEquipment.length > 0) {
        errors.push('Algunos equipos seleccionados tienen datos inválidos');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Función para validar disponibilidad de médico
  const validateDoctorAvailability = async (): Promise<{ isAvailable: boolean; conflicts: any[] }> => {
    try {
      if (!formData.doctorId || !formData.surgeryDate || !formData.surgeryTime) {
        return { isAvailable: true, conflicts: [] };
      }
      
      const surgeryDateTime = new Date(`${formData.surgeryDate}T${formData.surgeryTime}`);
      const surgeryEndTime = new Date(surgeryDateTime.getTime() + 3 * 60 * 60 * 1000); // +3 horas
      
      const { data: conflicts, error } = await supabase
        .from('Orders')
        .select('id, patient_name, surgery_date, surgery_time, procedure')
        .eq('user_id', formData.doctorId)
        .eq('surgery_date', formData.surgeryDate)
        .not('status', 'eq', 'cancelled')
        .not('status', 'eq', 'completed');
      
      if (error) throw error;
      
      const overlappingOrders = (conflicts || []).filter(order => {
        if (!order.surgery_time) return false;
        
        const orderStart = new Date(`${order.surgery_date}T${order.surgery_time}`);
        const orderEnd = new Date(orderStart.getTime() + 3 * 60 * 60 * 1000); // +3 horas
        
        return (
          (surgeryDateTime >= orderStart && surgeryDateTime < orderEnd) ||
          (surgeryEndTime > orderStart && surgeryEndTime <= orderEnd) ||
          (surgeryDateTime <= orderStart && surgeryEndTime >= orderEnd)
        );
      });
      
      return {
        isAvailable: overlappingOrders.length === 0,
        conflicts: overlappingOrders
      };
      
    } catch (error) {
      console.error('Error validando disponibilidad del médico:', error);
      return { isAvailable: true, conflicts: [] }; // En caso de error, permitir continuar
    }
  };

  // Función para validar stock de equipos
  const validateEquipmentStock = async (): Promise<{ isValid: boolean; warnings: string[] }> => {
    const warnings: string[] = [];
    
    try {
      for (const equipment of selectedEquipment) {
        if (equipment.product_id && equipment.quantity) {
          const product = availableProducts.find(p => p.id === equipment.product_id);
          
          if (product) {
            if (equipment.quantity > product.stock) {
              warnings.push(`${equipment.product_name}: Cantidad solicitada (${equipment.quantity}) excede stock disponible (${product.stock})`);
            } else if (product.stock_warning && equipment.quantity > product.stock * 0.8) {
              warnings.push(`${equipment.product_name}: Stock bajo (${product.stock} unidades) - Cantidad solicitada: ${equipment.quantity}`);
            }
          }
        }
      }
      
      return {
        isValid: warnings.length === 0,
        warnings
      };
      
    } catch (error) {
      console.error('Error validando stock de equipos:', error);
      return { isValid: true, warnings: [] };
    }
  };

  // Función para validar permisos del usuario
  const validateUserPermissions = (): { canCreateOrder: boolean; canSelectEquipment: boolean; message: string } => {
    const userRole = getUserRole();
    
    // Roles que pueden crear órdenes
    const canCreateOrder = 
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_OPERATIVO) ||
      hasRole(UserRole.ADMINISTRADOR_GENERAL) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO);
    
    // Roles que pueden seleccionar equipos
    const canSelectEquipment = 
      hasRole(UserRole.GERENTE_COMERCIAL) ||
      hasRole(UserRole.GERENTE_OPERATIVO) ||
      hasRole(UserRole.ADMINISTRADOR_GENERAL) ||
      hasRole(UserRole.GERENTE_ADMINISTRATIVO) ||
      hasRole(UserRole.JEFE_ALMACEN);
    
    let message = '';
    
    if (!canCreateOrder) {
      message = `Tu rol (${userRole}) no tiene permisos para crear órdenes. Contacta al administrador.`;
    } else if (!canSelectEquipment) {
      message = `Tu rol (${userRole}) puede crear órdenes pero no seleccionar equipos. Los equipos se pueden agregar más tarde.`;
    } else {
      message = `Tu rol (${userRole}) tiene permisos completos para crear órdenes y seleccionar equipos.`;
    }
    
    return {
      canCreateOrder,
      canSelectEquipment,
      message
    };
  };

  // Función para validar datos de cobertura
  const validateCoverageData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (formData.coverageType === 'Seguro') {
      if (!formData.insuranceName?.trim()) {
        errors.push('Debe especificar el nombre del seguro');
      }
      
      if (formData.insuranceName && formData.insuranceName.length < 3) {
        errors.push('El nombre del seguro debe tener al menos 3 caracteres');
      }
      
      if (formData.insuranceName && formData.insuranceName.length > 100) {
        errors.push('El nombre del seguro no puede exceder 100 caracteres');
      }
    }
    
    if (formData.coverageType === 'Privado') {
      // Validaciones específicas para cobertura privada
      if (formData.notes && formData.notes.length > 500) {
        errors.push('Las notas para cobertura privada no pueden exceder 500 caracteres');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Función para validar procedimiento y ubicación
  const validateProcedureAndLocation = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Validación de tipo de cirugía
    if (!formData.surgeryType) {
      errors.push('Debe seleccionar un tipo de cirugía');
    }
    
    // Validación de ubicación
    if (!formData.surgeryLocation) {
      errors.push('Debe seleccionar una ubicación de cirugía');
    }
    
    // Validación de procedimiento
    if (!formData.procedure) {
      errors.push('Debe seleccionar un procedimiento');
    }
    
    // Validación de coherencia entre tipo de cirugía y procedimiento
    if (formData.surgeryType && formData.procedure) {
      const selectedSurgeryType = surgeryTypes.find(type => type.name === formData.surgeryType);
      const selectedProcedure = procedures.find(p => p.name === formData.procedure);
      
      if (selectedSurgeryType && selectedProcedure) {
        // Verificar que el procedimiento pertenezca al tipo de cirugía
        if (selectedProcedure.surgery_type_id !== selectedSurgeryType.id) {
          errors.push('El procedimiento seleccionado no corresponde al tipo de cirugía');
        }
      }
    }
    
    // Validación de ubicación específica
    if (formData.surgeryLocation) {
      const validLocations = [
        'Quirófano 1', 'Quirófano 2', 'Quirófano 3', 'Quirófano 4',
        'Sala de Endoscopía', 'Sala de Procedimientos', 'Consultorio'
      ];
      
      if (!validLocations.includes(formData.surgeryLocation)) {
        errors.push('La ubicación seleccionada no es válida');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Función para validar fecha y hora
  const validateDateTime = (): { isValid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!formData.surgeryDate) {
      errors.push('La fecha de cirugía es obligatoria');
      return { isValid: false, errors, warnings };
    }
    
    if (!formData.surgeryTime) {
      errors.push('La hora de cirugía es obligatoria');
      return { isValid: false, errors, warnings };
    }
    
    try {
      const surgeryDateTime = new Date(`${formData.surgeryDate}T${formData.surgeryTime}`);
      const now = new Date();
      
      // Validar que la fecha y hora sea futura
      if (surgeryDateTime <= now) {
        errors.push('La fecha y hora de cirugía debe ser futura');
      }
      
      // Validar que no sea más de 1 año en el futuro
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      if (surgeryDateTime > oneYearFromNow) {
        errors.push('La fecha de cirugía no puede ser más de 1 año en el futuro');
      }
      
      // Validar horario de trabajo (8:00 AM - 8:00 PM)
      const hour = surgeryDateTime.getHours();
      if (hour < 8 || hour >= 20) {
        warnings.push('La hora de cirugía está fuera del horario de trabajo (8:00 AM - 8:00 PM)');
      }
      
      // Validar que no sea fin de semana
      const dayOfWeek = surgeryDateTime.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        warnings.push('La fecha de cirugía es un fin de semana');
      }
      
      // Validar que no sea día festivo (aquí se podrían agregar más validaciones)
      const month = surgeryDateTime.getMonth();
      const day = surgeryDateTime.getDate();
      
      // Ejemplo de días festivos (se puede expandir)
      const holidays = [
        { month: 0, day: 1 },   // 1 de enero
        { month: 4, day: 5 },   // 5 de mayo
        { month: 8, day: 16 },  // 16 de septiembre
        { month: 11, day: 25 }  // 25 de diciembre
      ];
      
      const isHoliday = holidays.some(holiday => holiday.month === month && holiday.day === day);
      if (isHoliday) {
        warnings.push('La fecha de cirugía es un día festivo');
      }
      
    } catch (error) {
      errors.push('Formato de fecha y hora inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  // Función para validar datos del paciente
  const validatePatientData = (): { isValid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validación del nombre del paciente
    if (!formData.patientName.trim()) {
      errors.push('El nombre del paciente es obligatorio');
    } else {
      const patientName = formData.patientName.trim();
      
      // Validar longitud mínima y máxima
      if (patientName.length < 3) {
        errors.push('El nombre del paciente debe tener al menos 3 caracteres');
      }
      
      if (patientName.length > 100) {
        errors.push('El nombre del paciente no puede exceder 100 caracteres');
      }
      
      // Validar formato (debe contener al menos un espacio para nombre y apellido)
      const nameParts = patientName.split(' ').filter(part => part.length > 0);
      if (nameParts.length < 2) {
        warnings.push('Se recomienda incluir nombre y apellido del paciente');
      }
      
      // Validar que no contenga caracteres especiales no permitidos
      const invalidChars = /[<>{}[\]\\|`~!@#$%^&*+=]/;
      if (invalidChars.test(patientName)) {
        errors.push('El nombre del paciente contiene caracteres no permitidos');
      }
      
      // Validar que no sea solo números
      if (/^\d+$/.test(patientName)) {
        errors.push('El nombre del paciente no puede ser solo números');
      }
    }
    
    // Validación de notas del paciente
    if (formData.notes && formData.notes.length > 1000) {
      errors.push('Las notas del paciente no pueden exceder 1000 caracteres');
    }
    
    // Validación de información adicional
    if (formData.notes && formData.notes.length > 500) {
      warnings.push('Las notas son extensas. Considere resumir la información más importante.');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  // Función de validación completa que integra todas las validaciones
  const performCompleteValidation = async (): Promise<{
    canProceed: boolean;
    errors: string[];
    warnings: string[];
    availability: { isAvailable: boolean; conflicts: any[] };
    stock: { isValid: boolean; warnings: string[] };
    permissions: { canCreateOrder: boolean; canSelectEquipment: boolean; message: string };
  }> => {
    
    
    // Validaciones básicas del formulario
    const formValidation = validateFormData();
    const coverageValidation = validateCoverageData();
    const procedureValidation = validateProcedureAndLocation();
    const dateTimeValidation = validateDateTime();
    const patientValidation = validatePatientData();
    const permissionsValidation = validateUserPermissions();
    
    // Validaciones asíncronas
    const [availabilityValidation, stockValidation] = await Promise.all([
      validateDoctorAvailability(),
      validateEquipmentStock()
    ]);
    
    // Consolidar todos los errores y advertencias
    const allErrors = [
      ...formValidation.errors,
      ...coverageValidation.errors,
      ...procedureValidation.errors,
      ...dateTimeValidation.errors,
      ...patientValidation.errors
    ];
    
    const allWarnings = [
      ...dateTimeValidation.warnings,
      ...patientValidation.warnings,
      ...stockValidation.warnings
    ];
    
    // Verificar si se puede proceder
    const canProceed = 
      formValidation.isValid &&
      coverageValidation.isValid &&
      procedureValidation.isValid &&
      dateTimeValidation.isValid &&
      patientValidation.isValid &&
      permissionsValidation.canCreateOrder &&
      availabilityValidation.isAvailable;
    
    // Actualizar estados de validación
    setDoctorAvailability({
      isAvailable: availabilityValidation.isAvailable,
      conflicts: availabilityValidation.conflicts,
      lastChecked: new Date()
    });
    
    setEquipmentStockValidation({
      isValid: stockValidation.isValid,
      warnings: stockValidation.warnings,
      lastChecked: new Date()
    });
    
    console.log('✅ Validación completa completada:', {
      canProceed,
      errorCount: allErrors.length,
      warningCount: allWarnings.length,
      availability: availabilityValidation.isAvailable,
      stock: stockValidation.isValid,
      permissions: permissionsValidation.canCreateOrder
    });
    
    return {
      canProceed,
      errors: allErrors,
      warnings: allWarnings,
      availability: availabilityValidation,
      stock: stockValidation,
      permissions: permissionsValidation
    };
  };

  return (
    <>
      {/* Modal principal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-none pb-32' : 'max-w-4xl'} max-h-[90vh] overflow-y-auto`}>
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2">
              <span>Nueva Orden</span>
              <Badge variant="secondary" className="text-xs">
                Paso {currentStep} de {totalSteps} - {
                  currentStep === 1 ? 'Seleccionar Médico' : 
                  currentStep === 2 ? 'Información del Paciente' : 
                  currentStep === 3 ? 'Detalles de Cirugía' : 
                  'Selección de Equipos'
                }
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {/* Indicador de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Contenido del paso actual */}
          <div className="flex-1 pb-6">
            {renderCurrentStep()}
          </div>

          {/* Botones de navegación */}
          <div className="flex justify-between pt-4 border-t bg-white sticky bottom-0">
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
                onClick={onClose}
              >
                Cancelar
              </Button>
              
              {currentStep === totalSteps ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateCurrentStep() || isSubmitting}
                >
                  {isSubmitting ? 'Creando Orden...' : 'Crear Orden'}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!validateCurrentStep() || isValidating}
                >
                  {isValidating ? 'Validando...' : 'Siguiente'}
                </Button>
              )}
            </div>
          </div>

          {/* Mostrar mensaje de error si existe */}
          {errorMessage && (<div className="text-red-600 text-sm mb-2">{errorMessage}</div>)}
        </DialogContent>
      </Dialog>

      {/* Modal de warning para tiempo */}
      <Dialog open={showTimeWarning} onOpenChange={setShowTimeWarning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Advertencia de Tiempo</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Cirugía Programada en Menos de 3 Horas
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Has programado una cirugía para {pendingDateTime?.date && new Date(pendingDateTime.date).toLocaleDateString('es-ES')} a las {pendingDateTime?.time}.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>¿Estás seguro de que quieres continuar?</strong> Esta cirugía está programada en menos de 3 horas, lo que puede requerir preparación urgente.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={cancelDateTimeWithWarning}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDateTimeWithWarning}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de equipos */}
      <Dialog open={showEquipmentModal} onOpenChange={setShowEquipmentModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Selección de Equipos
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Selecciona equipos individuales o por paquete para el procedimiento: <strong>{formData.procedure}</strong>
              </p>
            </div>

            {/* TAREA 4: Indicadores visuales mejorados para templates */}
            
            {/* Indicador de carga de templates */}
            {isLoadingTemplates && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Cargando Plantillas...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-sm text-blue-700">
                      Buscando templates para el procedimiento: <strong>{formData.procedure}</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Esto puede tomar unos segundos...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mostrar templates disponibles si existen */}
            {!isLoadingTemplates && templates.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <FileText className="h-5 w-5" />
                    Templates Disponibles para {formData.procedure}
                    {templates.some(t => t.is_fallback) && (
                      <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                        Fallback
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="font-medium">{template.product?.name || 'Producto no encontrado'}</div>
                          <div className="text-sm text-gray-600">
                            Categoría: {template.category} • Cantidad sugerida: {template.quantity}
                          </div>
                          {template.product?.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {template.product.description}
                            </div>
                          )}
                          {template.is_fallback && (
                            <div className="text-xs text-yellow-600 mt-1">
                              ⚠️ Producto disponible (no en template específico)
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-medium text-blue-600">
                            ${template.product?.price || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            Stock: {template.product?.stock || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAREA 4: Mensaje mejorado cuando no hay templates */}
            {!isLoadingTemplates && templates.length === 0 && formData.procedure && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-yellow-600 mb-2">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">No se encontraron templates para este procedimiento</p>
                    </div>
                    
                    {/* Mostrar error si existe */}
                    {templatesLoadError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Error al cargar templates</span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">{templatesLoadError}</p>
                      </div>
                    )}
                    
                    <p className="text-sm text-yellow-700 mb-3">
                      No hay templates predefinidos para "{formData.procedure}". 
                      Puedes continuar sin equipos o seleccionar productos disponibles.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={loadProductsAsFallback}
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                      >
                        🔄 Cargar Productos Disponibles
                      </Button>
                      
                      {/* Botón de reintento si hay error */}
                      {templatesLoadError && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setTemplatesLoadError(null);
                            if (currentProcedureId) {
                              // Reactivar la carga automática
                              setCurrentProcedureId(null);
                              setTimeout(() => setCurrentProcedureId(currentProcedureId), 100);
                            }
                          }}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          🔄 Reintentar Carga
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAREA 4: Botones de acción mejorados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={openIndividualEquipmentModal}
                className="bg-blue-600 hover:bg-blue-700 h-16"
                size="lg"
                disabled={isLoadingTemplates}
              >
                <Package className="h-5 w-5 mr-2" />
                {isLoadingTemplates ? 'Cargando...' : 'Equipos Individuales'}
              </Button>
              
              <Button 
                onClick={openPackageModal}
                className="bg-green-600 hover:bg-green-700 h-16"
                size="lg"
                disabled={isLoadingTemplates}
              >
                <Package className="h-5 w-5 mr-2" />
                {isLoadingTemplates ? 'Cargando...' : 'Paquetes Predefinidos'}
              </Button>
            </div>

            {/* Información adicional */}
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    💡 <strong>Nota:</strong> Los equipos seleccionados se agregarán a la orden y podrás editarlos más tarde desde la vista de detalles de la orden.
                  </p>
                  <div className="text-xs text-gray-500 text-center">
                    <p>• <strong>Equipos Individuales:</strong> Selecciona productos específicos uno por uno</p>
                    <p>• <strong>Paquetes Predefinidos:</strong> Conjuntos de equipos optimizados para procedimientos comunes</p>
                    {templates.length > 0 && (
                      <p className="mt-2 text-blue-600">
                        📋 <strong>Se encontraron {templates.length} templates</strong> para este procedimiento
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botón para cerrar sin seleccionar */}
            <div className="text-center">
              <Button 
                variant="outline"
                onClick={() => setShowEquipmentModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cerrar sin seleccionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de equipos individuales */}
      <Dialog open={showIndividualEquipmentModal} onOpenChange={setShowIndividualEquipmentModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Selección de Equipos Individuales
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Selecciona productos individuales para el procedimiento: <strong>{formData.procedure}</strong>
              </p>
            </div>

            {/* Filtros de búsqueda y categoría */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select onValueChange={(value) => setSelectedCategory(value)} value={selectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'Todas las categorías' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de productos */}
            <div className="max-h-64 overflow-y-auto border rounded-md">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div 
                    key={product.id}
                    className={`p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                      !product.available ? 'opacity-50 bg-gray-100' : ''
                    }`}
                    onClick={() => product.available && toggleProductSelection(product.id)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedIndividualProducts.has(product.id)}
                        onChange={() => product.available && toggleProductSelection(product.id)}
                        disabled={!product.available}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">{product.description || 'Sin descripción'}</div>
                        <div className="text-xs text-gray-500">
                          ${product.price} - Categoría: {product.category}
                        </div>
                        {/* Indicadores de stock */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-800' 
                              : product.stock > 5 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            Stock: {product.stock}
                          </span>
                          {!product.available && (
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                              No disponible
                            </span>
                          )}
                          {product.stock_warning && (
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                              ⚠️ Stock bajo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {selectedIndividualProducts.has(product.id) && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Cantidad:</span>
                          <input
                            type="number"
                            value={productQuantities[product.id] || 1}
                            onChange={(e) => changeProductQuantity(product.id, parseInt(e.target.value) || 1)}
                            min="1"
                            max={product.stock}
                            className="w-16 text-center border border-gray-300 rounded-md"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No se encontraron productos
                </div>
              )}
            </div>

            {/* Resumen de selección */}
            {selectedIndividualProducts.size > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-blue-700 font-medium">
                      ✅ {selectedIndividualProducts.size} producto(s) seleccionado(s)
                    </p>
                    <p className="text-sm text-blue-600">
                      Total estimado: ${Array.from(selectedIndividualProducts).reduce((sum, productId) => {
                        const product = availableProducts.find(p => p.id === productId);
                        const quantity = productQuantities[productId] || 1;
                        return sum + ((product?.price || 0) * quantity);
                      }, 0).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowIndividualEquipmentModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmIndividualEquipmentSelectionWithPersistence}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={selectedIndividualProducts.size === 0}
              >
                Confirmar Selección
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de paquetes */}
      <Dialog open={showPackageModal} onOpenChange={setShowPackageModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Vista Previa del Template: {formData.procedure}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Este es el template recomendado para el procedimiento seleccionado. 
                Puedes revisar los equipos antes de aplicarlos.
              </p>
            </div>

            {/* Mostrar paquetes disponibles */}
            {templates.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <FileText className="h-5 w-5" />
                    Equipos del Template
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {templates.length} {templates.length === 1 ? 'equipo' : 'equipos'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {templates.map(template => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="font-medium">{template.product?.name || 'Paquete no encontrado'}</div>
                          <div className="text-sm text-gray-600">
                            Categoría: {template.category} • Cantidad sugerida: {template.quantity}
                          </div>
                          {template.product?.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {template.product.description}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-medium text-blue-600">
                            ${template.product?.price || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            Stock: {template.product?.stock || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700 font-medium">Total del template:</span>
                      <span className="text-blue-800 font-bold">
                        ${templates.reduce((sum, t) => sum + ((t.product?.price || 0) * (t.quantity || 1)), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Indicador de carga */}
            {isLoadingTemplates && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-blue-700 font-medium">Cargando template del procedimiento...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mensaje cuando no hay templates */}
            {!isLoadingTemplates && templates.length === 0 && formData.procedure && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-yellow-600 mb-2">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">No se encontraron templates para este procedimiento</p>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      No hay templates predefinidos para "{formData.procedure}". 
                      Puedes continuar sin equipos o agregarlos más tarde desde la vista de detalles.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPackageModal(false)}
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  // Aplicar template automáticamente
                  const templateEquipment = templates.map(template => ({
                    id: `template-${template.id}`,
                    product_id: template.product_id,
                    product_name: template.product?.name || 'Producto',
                    category: template.category || 'General',
                    quantity: template.quantity || 1,
                    price: template.product?.price || 0,
                    confirmed: false,
                    is_from_package: true,
                    package_id: `template-${template.id}`,
                    notes: `Aplicado desde template: ${template.category}`
                  }));
                  setSelectedEquipment(templateEquipment);
                  setShowPackageModal(false);
                  toast({
                    title: "✅ Template aplicado",
                    description: `${templateEquipment.length} equipos del template han sido agregados automáticamente.`,
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={templates.length === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aplicar Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* NUEVO: Modal de vista previa del template */}
      <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Vista Previa del Template: {formData.procedure}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Este es el template recomendado para el procedimiento seleccionado. 
                Puedes revisar los equipos antes de aplicarlos.
              </p>
            </div>

            {/* Mostrar templates disponibles */}
            {templates.length > 0 && (
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Equipos del Template
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {templates.length} {templates.length === 1 ? 'equipo' : 'equipos'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                          <div className="font-medium">{template.product?.name || 'Producto no encontrado'}</div>
                          <div className="text-sm text-gray-600">
                            Categoría: {template.category} • Cantidad sugerida: {template.quantity}
                          </div>
                          {template.product?.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {template.product.description}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-medium text-blue-600">
                            ${template.product?.price || 0}
                          </div>
                          <div className="text-xs text-gray-500">
                            Stock: {template.product?.stock || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Total del template:</span>
                      <span className="text-gray-800 font-bold">
                        ${templates.reduce((sum, t) => sum + ((t.product?.price || 0) * (t.quantity || 1)), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowTemplatePreview(false)}
              >
                Cerrar
              </Button>
                              <Button
                  onClick={() => {
                    // Aplicar template automáticamente
                    const templateEquipment = templates.map(template => ({
                      id: `template-${template.id}`,
                      product_id: template.product_id,
                      product_name: template.product?.name || 'Producto',
                      category: template.category || 'General',
                      quantity: template.quantity || 1,
                      price: template.product?.price || 0,
                      confirmed: false,
                      is_from_package: true,
                      package_id: `template-${template.id}`,
                      notes: `Aplicado desde template: ${template.category}`
                    }));
                    setSelectedEquipment(templateEquipment);
                    setShowTemplatePreview(false);
                    toast({
                      title: "✅ Template aplicado",
                      description: `${templateEquipment.length} equipos del template han sido agregados automáticamente.`,
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={templates.length === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aplicar Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewOrderModal; 