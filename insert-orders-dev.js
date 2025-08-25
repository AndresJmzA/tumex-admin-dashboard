import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Datos de órdenes de ejemplo
const ordenes = [
  {
    id: 'order_1754316654780_p0hf2tk5y',
    user_id: 'dr.garcia@hospitalgeneral.com',
    procedure_id: 'PROC-APENDICECTOMIA',
    status: 'approved',
    patient_name: 'María Elena Rodríguez',
    surgery_date: '2025-08-05',
    surgery_time: '10:00:00',
    surgery_location: 'Quirófano 3 - Hospital General de México',
    coverage_type: 'Seguro',
    insurance_name: 'Axxa',
    notes: 'Paciente con apendicitis aguda confirmada por TC',
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-15T14:45:00Z'
  },
  {
    id: 'order_1754316654781_p0hf2tk6z',
    user_id: 'dr.martinez@hospitalgeneral.com',
    procedure_id: 'PROC-COLECISTECTOMIA',
    status: 'doctor_confirmation',
    patient_name: 'Carlos Alberto Méndez',
    surgery_date: '2025-08-12',
    surgery_time: '14:30:00',
    surgery_location: 'Quirófano 1 - Hospital General de México',
    coverage_type: 'Privado',
    insurance_name: null,
    notes: 'Colecistitis crónica con cálculos múltiples',
    created_at: '2025-01-16T09:15:00Z',
    updated_at: '2025-01-16T11:20:00Z'
  },
  {
    id: 'order_1754316654782_p0hf2tk7a',
    user_id: 'dr.lopez@clinicasantamaria.com',
    procedure_id: 'PROC-URETEROSCOPIA',
    status: 'templates_ready',
    patient_name: 'Ana Sofía González',
    surgery_date: '2025-08-08',
    surgery_time: '08:00:00',
    surgery_location: 'Quirófano 2 - Clínica Santa María',
    coverage_type: 'Seguro',
    insurance_name: 'GNP',
    notes: 'Cálculo ureteral derecho de 8mm',
    created_at: '2025-01-17T16:45:00Z',
    updated_at: '2025-01-17T18:30:00Z'
  },
  {
    id: 'order_1754316654783_p0hf2tk8b',
    user_id: 'dr.hernandez@clinicasantamaria.com',
    procedure_id: 'PROC-HISTERECTOMIA',
    status: 'technicians_assigned',
    patient_name: 'Rosa María Torres',
    surgery_date: '2025-08-15',
    surgery_time: '12:00:00',
    surgery_location: 'Quirófano 4 - Clínica Santa María',
    coverage_type: 'Seguro',
    insurance_name: 'MetLife',
    notes: 'Miomas uterinos múltiples, histerectomía total laparoscópica',
    created_at: '2025-01-18T13:20:00Z',
    updated_at: '2025-01-18T15:10:00Z'
  },
  {
    id: 'order_1754316654784_p0hf2tk9c',
    user_id: 'dr.torres@centromedicoabc.com',
    procedure_id: 'PROC-ENUCLEACION',
    status: 'equipment_transported',
    patient_name: 'José Luis Morales',
    surgery_date: '2025-08-10',
    surgery_time: '09:30:00',
    surgery_location: 'Quirófano 1 - Centro Médico ABC',
    coverage_type: 'Privado',
    insurance_name: null,
    notes: 'Hiperplasia prostática benigna, enucleación con láser',
    created_at: '2025-01-19T10:00:00Z',
    updated_at: '2025-01-19T12:15:00Z'
  },
  {
    id: 'order_1754316654785_p0hf2tk0d',
    user_id: 'dr.flores@centromedicoabc.com',
    procedure_id: 'PROC-BRONCOSCOPIA',
    status: 'remission_created',
    patient_name: 'Patricia Elena Vargas',
    surgery_date: '2025-08-20',
    surgery_time: '11:00:00',
    surgery_location: 'Quirófano 3 - Centro Médico ABC',
    coverage_type: 'Seguro',
    insurance_name: 'Seguros Monterrey',
    notes: 'Evaluación de masa pulmonar derecha',
    created_at: '2025-01-20T14:30:00Z',
    updated_at: '2025-01-20T16:45:00Z'
  },
  {
    id: 'order_1754316654786_p0hf2tk1e',
    user_id: 'dr.morales@hospitalangeles.com',
    procedure_id: 'PROC-NEFROLITOTOMIA',
    status: 'surgery_prepared',
    patient_name: 'Miguel Ángel Cruz',
    surgery_date: '2025-08-25',
    surgery_time: '13:30:00',
    surgery_location: 'Quirófano 2 - Hospital Ángeles',
    coverage_type: 'Privado',
    insurance_name: null,
    notes: 'Cálculo renal izquierdo de 15mm',
    created_at: '2025-01-21T08:45:00Z',
    updated_at: '2025-01-21T10:30:00Z'
  },
  {
    id: 'order_1754316654787_p0hf2tk2f',
    user_id: 'dr.vargas@hospitalangeles.com',
    procedure_id: 'PROC-MIOMECTOMIA',
    status: 'surgery_completed',
    patient_name: 'Carmen Elena Reyes',
    surgery_date: '2025-08-18',
    surgery_time: '15:00:00',
    surgery_location: 'Quirófano 1 - Hospital Ángeles',
    coverage_type: 'Seguro',
    insurance_name: 'Banorte',
    notes: 'Mioma submucoso de 6cm',
    created_at: '2025-01-22T12:00:00Z',
    updated_at: '2025-01-22T14:20:00Z'
  },
  {
    id: 'order_1754316654788_p0hf2tk3g',
    user_id: 'dr.garcia@hospitalgeneral.com',
    procedure_id: 'PROC-CISTOLITO-LASER',
    status: 'ready_for_billing',
    patient_name: 'Roberto Carlos Silva',
    surgery_date: '2025-08-22',
    surgery_time: '10:15:00',
    surgery_location: 'Quirófano 4 - Hospital General de México',
    coverage_type: 'Privado',
    insurance_name: null,
    notes: 'Cálculo vesical de 12mm',
    created_at: '2025-01-23T09:30:00Z',
    updated_at: '2025-01-23T11:45:00Z'
  },
  {
    id: 'order_1754316654789_p0hf2tk4h',
    user_id: 'dr.martinez@hospitalgeneral.com',
    procedure_id: 'PROC-CIRCUNCISION',
    status: 'billed',
    patient_name: 'Diego Alejandro Pérez',
    surgery_date: '2025-08-28',
    surgery_time: '08:45:00',
    surgery_location: 'Quirófano 2 - Hospital General de México',
    coverage_type: 'Seguro',
    insurance_name: 'Axxa',
    notes: 'Circuncisión por fimosis',
    created_at: '2025-01-24T16:15:00Z',
    updated_at: '2025-01-24T18:00:00Z'
  }
];

// Función para crear órdenes
async function crearOrdenes() {
  console.log('🚀 Iniciando creación de órdenes de ejemplo...');
  
  let ordenesCreadas = 0;
  let errores = 0;
  
  for (const orden of ordenes) {
    try {
      const { data, error } = await supabase
        .from('Orders')
        .insert([orden]);
      
      if (error) {
        console.error(`❌ Error al crear orden ${orden.id}:`, error.message);
        errores++;
      } else {
        console.log(`✅ Orden creada: ${orden.id} - ${orden.patient_name}`);
        ordenesCreadas++;
      }
    } catch (error) {
      console.error(`❌ Error inesperado al crear orden ${orden.id}:`, error);
      errores++;
    }
  }
  
  console.log('\n📊 Resumen de creación de órdenes:');
  console.log(`✅ Órdenes creadas exitosamente: ${ordenesCreadas}`);
  console.log(`❌ Errores: ${errores}`);
  console.log(`📋 Total procesadas: ${ordenes.length}`);
  
  if (errores === 0) {
    console.log('\n🎉 ¡Todas las órdenes fueron creadas exitosamente!');
  } else {
    console.log('\n⚠️ Algunas órdenes no pudieron ser creadas. Revisa los errores arriba.');
  }
}

// Ejecutar la función
crearOrdenes(); 