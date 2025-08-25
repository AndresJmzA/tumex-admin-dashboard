import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - Usando variables de entorno de Vite
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar que las variables estén disponibles
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  console.log('Asegúrate de que tu archivo .env.local contenga:');
  console.log('VITE_SUPABASE_URL=tu_url_de_supabase');
  console.log('VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase');
  process.exit(1);
}

console.log('🔗 Conectando a Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Datos de usuarios con contraseñas simples para desarrollo
const usuarios = [
  // 1. Administrador del Sistema
  {
    email: "admin@tumex.com",
    display_name: "Administrador",
    last_name: "Sistema",
    role: "Admin",
    phone_number: "555-0001",
    password: "123456"
  },
  
  // 2. Gerentes de Área
  {
    email: "gerente.comercial@tumex.com",
    display_name: "María",
    last_name: "González",
    role: "Gerente Comercial",
    phone_number: "555-0101",
    password: "123456"
  },
  {
    email: "gerente.operaciones@tumex.com",
    display_name: "Carlos",
    last_name: "Rodríguez",
    role: "Gerente Operaciones",
    phone_number: "555-0102",
    password: "123456"
  },
  {
    email: "gerente.cobranza@tumex.com",
    display_name: "Ana",
    last_name: "Martínez",
    role: "Gerente Cobranza",
    phone_number: "555-0103",
    password: "123456"
  },
  {
    email: "gerente.general@tumex.com",
    display_name: "Roberto",
    last_name: "Hernández",
    role: "Gerente General",
    phone_number: "555-0104",
    password: "123456"
  },
  
  // 3. Jefe de Almacén
  {
    email: "jefe.almacen@tumex.com",
    display_name: "Luis",
    last_name: "Pérez",
    role: "Jefe de Almacén",
    phone_number: "555-0201",
    password: "123456"
  },
  
  // 4. Técnicos (10)
  {
    email: "tecnico1@tumex.com",
    display_name: "Jorge",
    last_name: "García",
    role: "Técnico",
    phone_number: "555-0301",
    password: "123456"
  },
  {
    email: "tecnico2@tumex.com",
    display_name: "Miguel",
    last_name: "López",
    role: "Técnico",
    phone_number: "555-0302",
    password: "123456"
  },
  {
    email: "tecnico3@tumex.com",
    display_name: "Pedro",
    last_name: "Sánchez",
    role: "Técnico",
    phone_number: "555-0303",
    password: "123456"
  },
  {
    email: "tecnico4@tumex.com",
    display_name: "Juan",
    last_name: "Ramírez",
    role: "Técnico",
    phone_number: "555-0304",
    password: "123456"
  },
  {
    email: "tecnico5@tumex.com",
    display_name: "Francisco",
    last_name: "Torres",
    role: "Técnico",
    phone_number: "555-0305",
    password: "123456"
  },
  {
    email: "tecnico6@tumex.com",
    display_name: "Diego",
    last_name: "Flores",
    role: "Técnico",
    phone_number: "555-0306",
    password: "123456"
  },
  {
    email: "tecnico7@tumex.com",
    display_name: "Andrés",
    last_name: "Morales",
    role: "Técnico",
    phone_number: "555-0307",
    password: "123456"
  },
  {
    email: "tecnico8@tumex.com",
    display_name: "Ricardo",
    last_name: "Vargas",
    role: "Técnico",
    phone_number: "555-0308",
    password: "123456"
  },
  {
    email: "tecnico9@tumex.com",
    display_name: "Eduardo",
    last_name: "Cruz",
    role: "Técnico",
    phone_number: "555-0309",
    password: "123456"
  },
  {
    email: "tecnico10@tumex.com",
    display_name: "Alberto",
    last_name: "Reyes",
    role: "Técnico",
    phone_number: "555-0310",
    password: "123456"
  },
  
  // 5. Médicos (8) - Diferentes Hospitales
  // Nota: Los médicos existen en la base de datos como clientes
  // pero no tienen acceso al dashboard de administración
  // Hospital General de México
  {
    email: "dr.garcia@hospitalgeneral.com",
    display_name: "Dr. Alejandro",
    last_name: "García",
    role: "Médico",
    phone_number: "555-0401",
    password: "123456"
  },
  {
    email: "dr.martinez@hospitalgeneral.com",
    display_name: "Dra. Patricia",
    last_name: "Martínez",
    role: "Médico",
    phone_number: "555-0402",
    password: "123456"
  },
  
  // Clínica Santa María
  {
    email: "dr.lopez@clinicasantamaria.com",
    display_name: "Dr. Roberto",
    last_name: "López",
    role: "Médico",
    phone_number: "555-0403",
    password: "123456"
  },
  {
    email: "dr.hernandez@clinicasantamaria.com",
    display_name: "Dra. Carmen",
    last_name: "Hernández",
    role: "Médico",
    phone_number: "555-0404",
    password: "123456"
  },
  
  // Centro Médico ABC
  {
    email: "dr.torres@centromedicoabc.com",
    display_name: "Dr. Miguel",
    last_name: "Torres",
    role: "Médico",
    phone_number: "555-0405",
    password: "123456"
  },
  {
    email: "dr.flores@centromedicoabc.com",
    display_name: "Dra. Isabel",
    last_name: "Flores",
    role: "Médico",
    phone_number: "555-0406",
    password: "123456"
  },
  
  // Hospital Ángeles
  {
    email: "dr.morales@hospitalangeles.com",
    display_name: "Dr. Fernando",
    last_name: "Morales",
    role: "Médico",
    phone_number: "555-0407",
    password: "123456"
  },
  {
    email: "dr.vargas@hospitalangeles.com",
    display_name: "Dra. Laura",
    last_name: "Vargas",
    role: "Médico",
    phone_number: "555-0408",
    password: "123456"
  }
];

// Función para crear usuarios
async function crearUsuarios() {
  console.log('🚀 Iniciando creación de usuarios para desarrollo...');
  console.log('📝 Contraseña para todos los usuarios: 123456');
  
  let usuariosCreados = 0;
  let errores = 0;
  
  for (const usuario of usuarios) {
    try {
      // Remover password del objeto antes de insertar (si la tabla no tiene campo password)
      const { password, ...usuarioSinPassword } = usuario;
      
      const { data, error } = await supabase
        .from('users')
        .insert([usuarioSinPassword]);
      
      if (error) {
        console.error(`❌ Error al crear usuario ${usuario.email}:`, error.message);
        errores++;
      } else {
        console.log(`✅ Usuario creado: ${usuario.email} (${usuario.role})`);
        usuariosCreados++;
      }
    } catch (error) {
      console.error(`❌ Error inesperado al crear ${usuario.email}:`, error);
      errores++;
    }
  }
  
  console.log('\n📊 Resumen de creación de usuarios:');
  console.log(`✅ Usuarios creados exitosamente: ${usuariosCreados}`);
  console.log(`❌ Errores: ${errores}`);
  console.log(`📋 Total procesados: ${usuarios.length}`);
  
  if (errores === 0) {
    console.log('\n🎉 ¡Todos los usuarios fueron creados exitosamente!');
    console.log('🔑 Contraseña para todos: 123456');
  } else {
    console.log('\n⚠️ Algunos usuarios no pudieron ser creados. Revisa los errores arriba.');
  }
}

// Ejecutar la función
crearUsuarios(); 