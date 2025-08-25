# Flujo de la Orden y Áreas en TUMex

## Ciclo de Vida de la Orden en la WebApp

### 1. Recepción de la Orden
- **Entrada manual:** Si la orden llega por llamada, correo o WhatsApp, un usuario autorizado (Gte Comercial, Gte Operativo, etc.) la registra manualmente en la plataforma.
- **Entrada automática:** Si la orden llega por la app, se crea automáticamente con los datos proporcionados.

### 2. Revisión y Aceptación de la Orden
- **Responsable:** Gerente Operativo
- **Acción:**  
  - Revisa viabilidad (horario, disponibilidad de aparatos y técnicos, otros factores).
  - Puede aceptar o rechazar la orden.
  - Si rechaza, debe indicar motivo (queda registro).
  - Si acepta, la orden avanza al siguiente paso.

### 3. Confirmación de Equipos con el Médico
- **Responsable:** Gte Comercial / App
- **Acción:**  
  - Si la orden fue manual, se contacta al médico para confirmar qué equipos necesita.
  - Si la orden fue por la app, ya se tiene la lista de equipos; solo se confirma con el médico.

### 4. Generación de Plantillas de Almacén
- **Responsable:** Jefe de Almacén
- **Acción:**  
  - Genera plantillas de entrada y salida de equipos e insumos.
  - Puede llenarlas digitalmente o subir una plantilla manual (PDF, foto, etc.).
  - Técnicos y Gte Operativo pueden revisar y aprobar.

### 5. Coordinación de Cirugía y Equipos
- **Responsable:** Gte Operativo
- **Acción:**  
  - Asigna técnicos y define qué equipos se trasladan.
  - Técnicos reciben notificación/tarea asignada.

### 6. Traslado de Equipos e Insumos
- **Responsable:** Técnicos
- **Acción:**  
  - Realizan el traslado.
  - Suben evidencia fotográfica del traslado (fotos de equipos, insumos, etc.).

### 7. Nota de Remisión
- **Responsable:** Gte Administrativo
- **Acción:**  
  - Genera la nota de remisión.
  - Adjunta evidencia (foto, PDF, etc.).

### 8. Preparación de Quirófano
- **Responsable:** Técnicos
- **Acción:**  
  - Ingresan equipos e insumos.
  - Preparan el quirófano.
  - Suben evidencia fotográfica.

### 9. Finalización de Cirugía y Salida de Equipos
- **Responsable:** Técnicos
- **Acción:**  
  - Registran la finalización.
  - Hacen cargos y salida de equipos.
  - Suben evidencia fotográfica de la salida.

---

## Flujo por Área en la WebApp

### Gerente Comercial
- Crear orden manualmente (si aplica)
- Confirmar equipos con médico (si aplica)
- Consultar estatus de órdenes

### Gerente Operativo
- Revisar y aceptar/rechazar órdenes
- Asignar técnicos y equipos
- Revisar plantillas de almacén
- Consultar y coordinar tareas

### Jefe de Almacén
- Generar plantillas de entrada/salida
- Subir o llenar plantillas digitalmente
- Consultar órdenes y equipos asignados

### Técnicos
- Ver tareas asignadas (traslado, preparación, finalización)
- Subir evidencias fotográficas en cada etapa
- Confirmar realización de tareas

### Gerente Administrativo
- Generar y subir nota de remisión
- Adjuntar evidencia

### Nota sobre Médicos
- Los médicos tienen su propia aplicación móvil
- Esta webapp es únicamente para empleados de TUMex
- La confirmación médica se maneja a través de la app de médicos
- Los empleados de TUMex gestionan la comunicación con médicos desde esta webapp 