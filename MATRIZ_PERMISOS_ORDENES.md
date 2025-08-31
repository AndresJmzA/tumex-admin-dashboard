# Matriz de Permisos - Flujo de Órdenes TUMEX

## Descripción
Esta matriz de permisos sirve como la **única fuente de verdad** para la lógica de negocio del modal de "Detalles de la Orden". Define qué acciones puede realizar cada rol de usuario según el estado actual de la orden.

## Estructura de la Matriz

| ID_Estado | Estado_Orden | Rol_Usuario_Autorizado | Acciones_Permitidas | Estado_Resultante |
|-----------|--------------|------------------------|---------------------|-------------------|
| `CREATED` | Orden Creada | `GESTOR_CUENTA`, `GESTOR_OPERACIONES`, `GESTOR_GENERAL`, `DOCTOR` | `['EDIT_ORDER', 'DELETE_ORDER']` | `PENDING_ACCEPTANCE` |
| `PENDING_ACCEPTANCE` | Pendiente de Aceptación | `GESTOR_OPERACIONES` | `['ACCEPT_ORDER', 'REJECT_ORDER']` | `ACCEPTED` o `REJECTED` |
| `ACCEPTED` | Orden Aceptada | `GESTOR_CUENTA` | `['CONTACT_DOCTOR', 'CONFIRM_EQUIPMENT']` | `DOCTOR_CONFIRMATION` |
| `REJECTED` | Orden Rechazada | `GESTOR_OPERACIONES` | `['RESCHEDULE_ORDER']` | `PENDING_ACCEPTANCE` |
| `DOCTOR_CONFIRMATION` | Confirmación del Doctor | `DOCTOR` | `['CONFIRM_ORDER', 'REJECT_RESCHEDULE']` | `EQUIPMENT_TEMPLATES` o `ORDER_CANCELLED` |
| `EQUIPMENT_TEMPLATES` | Plantillas de Equipos Creadas | `GESTOR_OPERACIONES` | `['PREPARE_ORDER']` | `ORDER_PREPARATION` |
| `ORDER_PREPARATION` | Orden en Preparación | `GESTOR_OPERACIONES` | `['ASSIGN_TECHNICIANS']` | `TECHNICIAN_ASSIGNMENT` |
| `TECHNICIAN_ASSIGNMENT` | Técnicos Asignados | `GESTOR_OPERACIONES` | `['LOAD_ORDER']` | `ORDER_LOADED` |
| `ORDER_LOADED` | Orden Cargada | `TECNICO` | `['SEND_ORDER']` | `ORDER_IN_TRANSIT` |
| `ORDER_IN_TRANSIT` | Orden en Tránsito | `TECNICO` | `['ARRIVE_LOCATION']` | `ARRIVED_LOCATION` |
| `ARRIVED_LOCATION` | Llegada al Lugar | `TECNICO` | `['INSTALL_ORDER']` | `ORDER_INSTALLED` |
| `ORDER_INSTALLED` | Orden Instalada | `TECNICO` | `['COMPLETE_ORDER']` | `ORDER_COMPLETED` |
| `ORDER_COMPLETED` | Orden Completada | `TECNICO` | `['RETURN_BASE']` | `TECHNICIAN_RETURN` |
| `TECHNICIAN_RETURN` | Técnicos Regresados | `GESTOR_OPERACIONES` | `['CLOSE_ORDER']` | `ORDER_CLOSED` |
| `ORDER_CANCELLED` | Orden Cancelada | `GESTOR_CUENTA`, `GESTOR_OPERACIONES` | `['REOPEN_ORDER']` | `PENDING_ACCEPTANCE` |
| `ORDER_CLOSED` | Orden Cerrada | `GESTOR_OPERACIONES`, `GESTOR_CUENTA` | `['VIEW_ORDER_HISTORY']` | N/A |

## Roles del Sistema

### Definición de Roles
- **`GESTOR_CUENTA` (g.c.)**: Responsable de contacto con doctores y confirmación de equipos
- **`GESTOR_OPERACIONES` (g.o.)**: Responsable de aceptación/rechazo y preparación de órdenes
- **`GESTOR_GENERAL` (g.g.)**: Puede crear órdenes
- **`DOCTOR`**: Confirma órdenes y puede rechazar reagendas
- **`TECNICO`**: Ejecuta la instalación y retorna al finalizar

## Estados del Sistema

### Estados Iniciales
- **`CREATED`**: Estado inicial cuando se crea una orden
- **`PENDING_ACCEPTANCE`**: Esperando aprobación del gestor de operaciones

### Estados de Procesamiento
- **`ACCEPTED`**: Orden aprobada, pendiente de confirmación del doctor
- **`DOCTOR_CONFIRMATION`**: Esperando confirmación del doctor
- **`EQUIPMENT_TEMPLATES`**: Plantillas de equipos creadas
- **`ORDER_PREPARATION`**: Orden en proceso de preparación
- **`TECHNICIAN_ASSIGNMENT`**: Técnicos asignados a la orden

### Estados de Ejecución
- **`ORDER_LOADED`**: Orden cargada por los técnicos
- **`ORDER_IN_TRANSIT`**: Orden en camino al destino
- **`ARRIVED_LOCATION`**: Técnicos llegaron al lugar
- **`ORDER_INSTALLED`**: Equipos instalados
- **`ORDER_COMPLETED`**: Trabajo completado
- **`TECHNICIAN_RETURN`**: Técnicos regresaron a base

### Estados Finales
- **`ORDER_CLOSED`**: Orden cerrada exitosamente
- **`ORDER_CANCELLED`**: Orden cancelada

## Acciones del Sistema

### Acciones de Gestión
- **`EDIT_ORDER`**: Editar detalles de la orden
- **`DELETE_ORDER`**: Eliminar la orden
- **`ACCEPT_ORDER`**: Aprobar la orden
- **`REJECT_ORDER`**: Rechazar la orden
- **`RESCHEDULE_ORDER`**: Reprogramar la orden

### Acciones de Confirmación
- **`CONTACT_DOCTOR`**: Contactar al doctor
- **`CONFIRM_EQUIPMENT`**: Confirmar equipos necesarios
- **`CONFIRM_ORDER`**: Confirmar la orden
- **`REJECT_RESCHEDULE`**: Rechazar la reprogramación

### Acciones de Preparación
- **`PREPARE_ORDER`**: Preparar la orden
- **`ASSIGN_TECHNICIANS`**: Asignar técnicos
- **`LOAD_ORDER`**: Cargar la orden

### Acciones de Ejecución
- **`SEND_ORDER`**: Enviar la orden
- **`ARRIVE_LOCATION`**: Llegar al lugar
- **`INSTALL_ORDER`**: Instalar equipos
- **`COMPLETE_ORDER`**: Completar trabajo
- **`RETURN_BASE`**: Regresar a base

### Acciones de Cierre
- **`CLOSE_ORDER`**: Cerrar la orden
- **`REOPEN_ORDER`**: Reabrir orden cancelada
- **`VIEW_ORDER_HISTORY`**: Ver historial de la orden

## Transiciones Especiales

### Flujo de Reagenda
- El rechazo (`REJECTED`) puede llevar a reagenda, retornando al estado `PENDING_ACCEPTANCE`
- La confirmación del doctor puede llevar a cancelación si rechaza la reagenda

### Estados Terminales
- **`ORDER_CLOSED`**: Estado final exitoso - no permite más transiciones
- **`ORDER_CANCELLED`**: Estado final por cancelación - permite reapertura

## Uso en el Código

Esta matriz debe ser implementada en el modal de "Detalles de la Orden" para:

1. **Validar Permisos**: Verificar que el usuario actual puede realizar la acción solicitada
2. **Mostrar Botones**: Renderizar solo los botones de acción permitidos
3. **Controlar Transiciones**: Asegurar que las transiciones de estado sean válidas
4. **Auditoría**: Registrar todas las acciones realizadas por cada usuario

## Mantenimiento

- **Actualizar**: Cuando se modifique el flujo de negocio
- **Versionar**: Mantener historial de cambios
- **Validar**: Asegurar consistencia con el diagrama de flujo original
- **Documentar**: Explicar cualquier cambio en la lógica de negocio

---

*Documento generado basado en el diagrama de flujo TUMEX - Última actualización: [Fecha actual]*
