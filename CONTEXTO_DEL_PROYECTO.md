# CONTEXTO DEL PROYECTO TUMEX

## 📋 Descripción General
Este documento define las **reglas fundamentales** y **fuentes de verdad** del proyecto TUMEX. Cualquier desarrollo, modificación o integración DEBE seguir estrictamente estas reglas para mantener la consistencia del sistema.

---

## 🎭 Roles de Usuario (UserRole)

### **Fuente de Verdad:** `src/contexts/AuthContext.tsx`
**IMPORTANTE:** Cualquier lógica de roles DEBE usar estos strings exactos. NO se permiten variaciones.

```typescript
export enum UserRole {
  ADMINISTRADOR_GENERAL = 'Admin',
  GERENTE_COMERCIAL = 'Gerente Comercial',
  GERENTE_OPERATIVO = 'Gerente Operaciones',
  GERENTE_ADMINISTRATIVO = 'Gerente General',
  FINANZAS = 'Gerente Cobranza',
  JEFE_ALMACEN = 'Jefe de Almacén',
  TECNICO = 'Técnico',
  MEDICO = 'Médico'
}
```

### **Descripción de Roles:**

| Rol | Descripción | Responsabilidades |
|-----|-------------|-------------------|
| `Admin` | Administrador General | Acceso completo al sistema, gestión de usuarios |
| `Gerente Comercial` | Gestión de clientes y cuentas | Contacto con doctores, confirmación de equipos |
| `Gerente Operaciones` | Gestión operativa | Aceptación/rechazo, preparación de órdenes |
| `Gerente General` | Gestión administrativa | Creación de órdenes, supervisión general |
| `Gerente Cobranza` | Gestión financiera | Facturación, cobranza, reportes financieros |
| `Jefe de Almacén` | Gestión de inventario | Control de equipos, plantillas, almacén |
| `Técnico` | Ejecución técnica | Instalación, mantenimiento, retorno de equipos |
| `Médico` | Confirmación médica | Confirmación de órdenes, aprobación de cirugías |

---

## 📊 Estados Canónicos de la Orden (CanonicalOrderStatus)

### **Fuente de Verdad:** `src/utils/status.ts`
**IMPORTANTE:** Cualquier lógica de estados de orden DEBE usar estos strings exactos. NO se permiten variaciones.

```typescript
export type CanonicalOrderStatus =
  | 'created'                    // Orden Creada
  | 'pending_objects'            // Pendiente de Objetos
  | 'doctor_confirmation'        // Confirmación con Médico
  | 'objects_confirmed'          // Objetos Confirmados
  | 'approved'                   // Aprobada
  | 'rescheduled'                // Reagendada
  | 'rejected'                   // Rechazada
  | 'doctor_approved'            // Aceptada por Médico
  | 'doctor_rejected'            // Rechazada por Médico
  | 'templates_ready'            // Plantillas Listas
  | 'technicians_assigned'       // Técnicos Asignados
  | 'in_preparation'             // En Preparación
  | 'ready_for_technicians'      // Lista para Técnicos
  | 'assigned'                   // Asignada
  | 'in_transit'                 // En Tránsito
  | 'in_progress'                // En Proceso
  | 'returned'                   // De Vuelta
  | 'remission_created'          // Remisión Creada
  | 'equipment_transported'      // Equipos Trasladados
  | 'surgery_prepared'           // Quirófano Preparado
  | 'surgery_completed'          // Cirugía Completada
  | 'ready_for_billing'          // Lista para Facturar
  | 'billed'                     // Facturada
  | 'completed'                  // Completada
  | 'cancelled';                 // Cancelada
```

### **Flujo de Estados (Simplificado):**

```
created → pending_objects → doctor_confirmation → objects_confirmed → approved
   ↓           ↓                    ↓                    ↓            ↓
rejected   rescheduled        doctor_rejected      templates_ready  in_preparation
   ↓           ↓                    ↓                    ↓            ↓
cancelled  created           cancelled            technicians_assigned  ready_for_technicians
                                           ↓                    ↓
                                    assigned → in_transit → in_progress → surgery_completed
                                           ↓                    ↓
                                    returned            equipment_transported
                                           ↓                    ↓
                                    remission_created → ready_for_billing → billed → completed
```

---

## 🔐 Matriz de Permisos

### **Fuente de Verdad:** `src/services/OrderActionService.ts`
**IMPORTANTE:** La lógica para determinar qué acciones están permitidas se centraliza EXCLUSIVAMENTE en la función `getAvailableActions` de este archivo.

### **Estructura de la Matriz:**
```typescript
interface PermissionMatrixEntry {
  idEstado: OrderStatus;           // Estado actual de la orden
  estadoOrden: string;             // Nombre legible del estado
  rolUsuarioAutorizado: UserRole;  // Rol que puede actuar
  accionesPermitidas: Action[];    // Acciones disponibles
  estadoResultante: OrderStatus;   // Estado después de la acción
}
```

### **Estados del Modal (OrderStatus):**
```typescript
export type OrderStatus = 
  | 'PENDING_ACCEPTANCE'           // Pendiente de Aceptación
  | 'PENDING_DOCTOR_CONFIRMATION'  // Pendiente de Confirmación del Doctor
  | 'PENDING_TECHNICIAN_ASSIGNMENT' // Pendiente de Asignación de Técnico
  | 'PENDING_TECHNICIAN_CONFIRMATION' // Pendiente de Confirmación del Técnico
  | 'PENDING_EQUIPMENT_PREPARATION'   // Pendiente de Preparación de Equipos
  | 'PENDING_SURGERY'              // Pendiente de Cirugía
  | 'IN_PROGRESS'                  // En Progreso
  | 'PENDING_EQUIPMENT_RETURN'     // Pendiente de Devolución de Equipos
  | 'PENDING_FINAL_APPROVAL'       // Pendiente de Aprobación Final
  | 'COMPLETED'                    // Completada
  | 'REJECTED'                     // Rechazada
  | 'CANCELLED';                   // Cancelada
```

### **Roles del Modal (UserRole):**
```typescript
export type UserRole = 
  | 'GESTOR_OPERACIONES'           // Gerente de Operaciones
  | 'GESTOR_CUENTA'                // Gerente de Cuenta
  | 'DOCTOR'                       // Médico
  | 'TECNICO';                     // Técnico
```

### **Acciones Disponibles (Action):**
```typescript
export type Action = 
  | 'ACCEPT_ORDER'                 // Aceptar Orden
  | 'REJECT_ORDER'                 // Rechazar Orden
  | 'CONFIRM_SURGERY'              // Confirmar Cirugía
  | 'ASSIGN_TECHNICIAN'            // Asignar Técnico
  | 'CONFIRM_TECHNICIAN_AVAILABILITY' // Confirmar Disponibilidad del Técnico
  | 'PREPARE_EQUIPMENT'            // Preparar Equipos
  | 'START_SURGERY'                // Iniciar Cirugía
  | 'COMPLETE_SURGERY'             // Completar Cirugía
  | 'RETURN_EQUIPMENT'             // Devolver Equipos
  | 'APPROVE_COMPLETION'           // Aprobar Finalización
  | 'CANCEL_ORDER';                // Cancelar Orden
```

---

## ⚠️ REGLAS CRÍTICAS

### **1. Consistencia de Tipos**
- **NO** crear nuevos tipos de roles o estados sin actualizar las fuentes de verdad
- **NO** usar strings hardcodeados que no estén en los tipos definidos
- **SÍ** usar siempre los tipos exportados desde los archivos fuente

### **2. Centralización de Lógica**
- **NO** implementar lógica de permisos en componentes UI
- **SÍ** usar exclusivamente `getAvailableActions()` para determinar acciones permitidas
- **SÍ** centralizar toda la lógica de negocio en servicios

### **3. Mapeo de Estados**
- **NO** crear mapeos personalizados entre estados
- **SÍ** usar las funciones de normalización de `src/utils/status.ts`
- **SÍ** mantener consistencia entre estados del modal y estados canónicos

### **4. Roles de Usuario**
- **NO** usar roles que no estén definidos en `AuthContext.tsx`
- **SÍ** mapear roles del sistema existente a los roles del modal
- **SÍ** validar permisos antes de mostrar acciones

---

## 🔄 Mapeo de Estados (Modal ↔ Sistema)

### **Problema Identificado:**
Existe una **inconsistencia crítica** entre los estados del modal (`OrderStatus`) y los estados canónicos del sistema (`CanonicalOrderStatus`).

### **Mapeo Actual (Incorrecto):**
```typescript
// ❌ Mapeo incorrecto en Orders.tsx
const statusMapping: Record<string, OrderStatus> = {
  'created': 'PENDING_ACCEPTANCE',                    // Incorrecto
  'approved': 'PENDING_DOCTOR_CONFIRMATION',          // No existe 'approved'
  'doctor_confirmation': 'PENDING_TECHNICIAN_ASSIGNMENT', // Incorrecto
  // ... más mapeos incorrectos
};
```

### **Mapeo Correcto (Recomendado):**
```typescript
// ✅ Mapeo correcto basado en la lógica de negocio
const statusMapping: Record<string, OrderStatus> = {
  'created': 'PENDING_ACCEPTANCE',
  'approved': 'PENDING_DOCTOR_CONFIRMATION',
  'doctor_confirmation': 'PENDING_DOCTOR_CONFIRMATION',
  'objects_confirmed': 'PENDING_TECHNICIAN_ASSIGNMENT',
  'templates_ready': 'PENDING_TECHNICIAN_CONFIRMATION',
  'technicians_assigned': 'PENDING_EQUIPMENT_PREPARATION',
  'in_preparation': 'PENDING_SURGERY',
  'ready_for_technicians': 'IN_PROGRESS',
  'in_progress': 'IN_PROGRESS',
  'surgery_completed': 'PENDING_EQUIPMENT_RETURN',
  'returned': 'PENDING_FINAL_APPROVAL',
  'completed': 'COMPLETED',
  'rejected': 'REJECTED',
  'cancelled': 'CANCELLED'
};
```

---

## 🚨 PROBLEMAS IDENTIFICADOS

### **1. Inconsistencia de Estados**
- **Modal:** 12 estados (`OrderStatus`)
- **Sistema:** 25 estados (`CanonicalOrderStatus`)
- **Mapeo:** Incorrecto e incompleto

### **2. Inconsistencia de Roles**
- **Modal:** 4 roles (`UserRole`)
- **Sistema:** 8 roles (`UserRole` enum)
- **Mapeo:** No existe

### **3. Lógica de Permisos Duplicada**
- **Modal:** Matriz de permisos en `OrderActionService.ts`
- **Sistema:** Lógica dispersa en múltiples componentes
- **Resultado:** Inconsistencias y bugs

---

## ✅ PLAN DE ACCIÓN RECOMENDADO

### **Fase 1: Unificación de Tipos**
1. **Eliminar** tipos duplicados en `OrderActionService.ts`
2. **Importar** tipos desde `AuthContext.tsx` y `status.ts`
3. **Actualizar** interfaces para usar tipos canónicos

### **Fase 2: Corrección de Mapeos**
1. **Implementar** mapeo correcto de estados
2. **Validar** que todas las transiciones sean lógicas
3. **Probar** flujo completo de estados

### **Fase 3: Centralización de Lógica**
1. **Mover** toda la lógica de permisos a `OrderActionService.ts`
2. **Eliminar** lógica duplicada en componentes
3. **Implementar** validación centralizada

### **Fase 4: Testing y Validación**
1. **Probar** todos los flujos de estados
2. **Validar** permisos para cada rol
3. **Documentar** casos edge y excepciones

---

## 📚 Referencias

- **Roles de Usuario:** `src/contexts/AuthContext.tsx`
- **Estados de Orden:** `src/utils/status.ts`
- **Matriz de Permisos:** `src/services/OrderActionService.ts`
- **Documentación Original:** `MATRIZ_PERMISOS_ORDENES.md`

---

## 🎯 Objetivo Final

**Unificar completamente** el sistema para que:
- ✅ Un solo conjunto de tipos para roles y estados
- ✅ Una sola matriz de permisos centralizada
- ✅ Mapeo correcto y consistente entre sistemas
- ✅ Lógica de negocio unificada y mantenible
- ✅ Sistema robusto y libre de inconsistencias

---

*Última actualización: [Fecha actual]*
*Responsable: Equipo de Desarrollo TUMEX*
*Versión: 1.0*
