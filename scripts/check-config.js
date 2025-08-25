#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del proyecto...\n');

// Verificar archivo .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ Archivo .env.local no encontrado');
  console.log('📝 Crea un archivo .env.local en la raíz del proyecto con las siguientes variables:');
  console.log('');
  console.log('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=your-anon-key-here');
  console.log('VITE_API_URL=http://localhost:8080');
  console.log('');
  console.log('💡 Puedes usar el archivo env.example como referencia');
  process.exit(1);
}

// Leer y verificar variables de entorno
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = envContent.split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) {
    acc[key.trim()] = value.trim();
  }
  return acc;
}, {});

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

let allConfigured = true;

console.log('📋 Variables de entorno encontradas:');
requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value && value !== 'your-project.supabase.co' && value !== 'your-anon-key-here') {
    console.log(`✅ ${varName}: Configurada`);
  } else {
    console.log(`❌ ${varName}: No configurada o usando valores por defecto`);
    allConfigured = false;
  }
});

console.log('');

if (allConfigured) {
  console.log('🎉 ¡Configuración completada! Puedes ejecutar npm run dev');
} else {
  console.log('⚠️  Algunas variables no están configuradas correctamente');
  console.log('📖 Consulta el README.md para instrucciones de configuración');
  process.exit(1);
} 