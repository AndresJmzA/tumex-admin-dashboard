
# 📋 Plan de Implementación - Dashboard TUMex para Paquetes Quirúrgicos

## Estado del Proyecto
- [x] Análisis del modelo de negocio
- [x] Definición de etapas de desarrollo
- [ ] Implementación en progreso

---

## ✅ ETAPA 1: Actualización de Estadísticas Principales
**Objetivo**: Transformar las métricas del dashboard para reflejar el modelo de negocio de paquetes quirúrgicos

### Tareas:
- [x] Cambiar "Alquileres Activos" → "Órdenes de Renta Activas"
- [x] Cambiar "Solicitudes Pendientes" → "Órdenes Pendientes de Aprobación"
- [x] Cambiar "Total de Equipos" → "Paquetes Quirúrgicos Disponibles"
- [x] Cambiar "Tickets de Soporte" → "Contraoffertas Recibidas"
- [x] Actualizar colores e iconos apropiados para cada métrica
- [x] Ajustar números de ejemplo realistas

**Entregables**: 4 cards de estadísticas actualizadas con nuevo contenido y colores apropiados

**Archivos a modificar**: `src/pages/Dashboard.tsx`

---

## ✅ ETAPA 2: Transformación del Componente de Solicitudes
**Objetivo**: Convertir "Solicitudes por Aceptar" en "Órdenes Pendientes de Aprobación"

### Tareas:
- [x] Cambiar título de sección: "Solicitudes por Aceptar" → "Órdenes Pendientes de Aprobación"
- [x] Actualizar ejemplos a paquetes quirúrgicos:
  - [x] "Monitor de Signos Vitales" → "Paquete Laparoscopía Completo"
  - [x] "Ventilador Mecánico" → "Paquete Cirugía Cardiovascular"
  - [x] "Bomba de Infusión" → "Paquete Neurocirugía"
- [x] Implementar sistema de indicadores de aprobación:
  - [x] Badge "1/2 Aprobaciones"
  - [x] Badge "Pendiente 1ra Aprobación"
- [x] Crear estados visuales diferenciados por color
- [x] Implementar botones de acción contextuales:
  - [x] "Aprobar" (para primeras aprobaciones)
  - [x] "Ver Detalles"
- [x] Actualizar badge de contador: "5 pendientes" → "2 pendientes de aprobación"

**Entregables**: Componente rediseñado con flujo de doble aprobación

**Archivos a modificar**: `src/pages/Dashboard.tsx`

---

## ✅ ETAPA 3: Nueva Sección de Negociaciones Activas
**Objetivo**: Crear componente para gestionar contraoffertas de clientes

### Tareas:
- [x] Reemplazar sección "Servicio al Cliente" con "Negociaciones Activas"
- [x] Crear estructura de contraoffertas:
  - [x] ID de orden original
  - [x] Paquete quirúrgico solicitado
  - [x] Oferta original vs contraoferta del cliente
  - [x] Estado de negociación
  - [x] Tiempo transcurrido desde última oferta
- [x] Implementar indicadores de tiempo:
  - [x] "Hace 2 horas" (reciente)
  - [x] "Hace 1 día" (urgente)
  - [x] "Hace 3 días" (crítico)
- [x] Crear acciones rápidas:
  - [x] "Aceptar Contraoferta"
  - [x] "Rechazar"
  - [x] "Negociar"
  - [x] "Ver Historial"
- [x] Badge de contador: "3 negociaciones activas"

**Entregables**: Nuevo componente "Negociaciones Activas"

**Archivos a modificar**: `src/pages/Dashboard.tsx`

---

## ✅ ETAPA 4: Actualización de Actividad Reciente
**Objetivo**: Reflejar el flujo real del negocio en el historial de actividades

### Tareas:
- [x] Actualizar ejemplos de actividades:
  - [x] "Nueva solicitud de alquiler" → "Nueva orden de paquete quirúrgico recibida"
  - [x] "Equipo devuelto" → "Paquete Laparoscopía devuelto completo"
  - [x] "Mantenimiento completado" → "Primera aprobación completada"
- [x] Agregar nuevos tipos de actividad:
  - [x] "Segunda aprobación otorgada"
  - [x] "Orden enviada al cliente"
  - [x] "Contraoferta recibida"
  - [x] "Negociación finalizada"
- [x] Actualizar nombres de equipos:
  - [x] "Máquina de Ultrasonido XR-200" → "Paquete Cirugía General Completo"
  - [x] "Monitor de Paciente PM-500" → "Paquete Laparoscopía Estándar"
  - [x] "Ventilador Mecánico VM-300" → "Paquete Cirugía Cardíaca Premium"
- [x] Actualizar estados:
  - [x] "completado" → "aprobado"
  - [x] "pendiente" → "en proceso de aprobación"
  - [x] "devuelto" → "finalizado"

**Entregables**: Componente de actividad reciente actualizado

**Archivos a modificar**: `src/pages/Dashboard.tsx`

---

## ✅ ETAPA 5: Sistema de Estados y Badges
**Objetivo**: Implementar código de colores y badges para estados del flujo

### Tareas:
- [x] Definir código de colores por estado:
  - [x] Verde: "2/2 Aprobaciones - Listo"
  - [x] Amarillo: "1/2 Aprobaciones"
  - [x] Azul: "Pendiente 1ra Aprobación"
  - [x] Naranja: "En Negociación"
  - [x] Rojo: "Urgente/Crítico"
- [x] Crear badges de progreso:
  - [x] Badge "1/2" con color amarillo
  - [x] Badge "2/2" con color verde
  - [x] Badge "Listo para Enviar" con color verde brillante
- [x] Implementar indicadores de urgencia:
  - [x] Por tiempo de espera
  - [x] Por tipo de cirugía (urgente vs programada)
  - [x] Por valor de la orden
- [x] Asegurar consistencia visual en toda la aplicación

**Entregables**: Sistema de badges y estados implementado

**Archivos a modificar**: `src/pages/Dashboard.tsx`

---

## 📅 ETAPA 6: Integración de Calendario al Dashboard
**Objetivo**: Agregar un calendario interactivo al dashboard para visualizar y gestionar eventos relacionados con las órdenes de renta y negociaciones

### Tareas:
- [ ] Crear componente de calendario usando shadcn/ui Calendar:
  - [ ] Implementar calendario básico con navegación por meses
  - [ ] Configurar formato de fechas en español
  - [ ] Asegurar interactividad con pointer-events-auto
- [ ] Definir tipos de eventos del calendario:
  - [ ] Fechas de inicio de órdenes (verde)
  - [ ] Fechas de fin de órdenes (azul)
  - [ ] Fechas límite de negociaciones (naranja)
  - [ ] Fechas de aprobaciones pendientes (amarillo)
  - [ ] Fechas críticas/urgentes (rojo)
- [ ] Implementar visualización de eventos:
  - [ ] Indicadores de color en fechas específicas
  - [ ] Tooltip con información del evento al hacer hover
  - [ ] Badge con contador de eventos por día
- [ ] Crear panel de filtros:
  - [ ] Filtro por tipo de evento
  - [ ] Filtro por estado de órdenes
  - [ ] Filtro por urgencia
- [ ] Integrar con datos del dashboard:
  - [ ] Mostrar fechas de órdenes pendientes de aprobación
  - [ ] Mostrar fechas límite de negociaciones activas
  - [ ] Sincronizar con estadísticas principales
- [ ] Añadir funcionalidades interactivas:
  - [ ] Click en fecha para ver eventos del día
  - [ ] Navegación rápida a mes actual
  - [ ] Vista resumida de la semana actual
- [ ] Responsive design:
  - [ ] Versión completa para desktop
  - [ ] Versión compacta para móvil y tablet

**Entregables**: Componente de calendario funcional e integrado al dashboard

**Archivos a crear**: 
- `src/components/CalendarDashboard.tsx` (componente principal)
- `src/components/CalendarEvent.tsx` (componente de eventos)
- `src/types/calendar.ts` (tipos TypeScript)

**Archivos a modificar**: `src/pages/Dashboard.tsx`

---

## ✅ ETAPA 7: Eliminación de Actividad Reciente
**Objetivo**: Simplificar el dashboard eliminando la sección de actividad reciente

### Tareas:
- [x] Remover completamente la sección "Actividad Reciente"
- [x] Ajustar el layout del dashboard para mejor distribución del espacio
- [x] Verificar que no queden referencias o dependencias de esta sección
- [x] Revisar que el dashboard mantenga una buena proporción visual

**Entregables**: Dashboard limpio sin sección de actividad reciente

**Archivos a modificar**: `src/pages/Dashboard.tsx`

---

## 📝 ETAPA 8: Refinamiento y Optimización
**Objetivo**: Pulir detalles y optimizar la experiencia de usuario

### Tareas:
- [ ] Revisar responsividad en móviles
- [ ] Optimizar carga de datos (considerar react-query si es necesario)
- [ ] Añadir transiciones suaves entre estados
- [ ] Implementar tooltips explicativos
- [ ] Validar accesibilidad (a11y)
- [ ] Testing en diferentes navegadores
- [ ] Documentar componentes nuevos

**Entregables**: Dashboard pulido y optimizado

---

## 📝 Notas Técnicas

### Consideraciones de Implementación:
- Mantener la estructura actual de shadcn/ui components
- Utilizar Tailwind CSS para styling consistente
- Preservar la funcionalidad de sidebar y layout existente
- Implementar cambios incrementales para evitar breaking changes

### Datos de Ejemplo Sugeridos:
- **Paquetes Quirúrgicos**: Laparoscopía, Cirugía Cardiovascular, Neurocirugía, Cirugía General, Ortopedia
- **Estados de Aprobación**: Pendiente, 1/2 Aprobado, 2/2 Aprobado, Enviado, En Negociación
- **Tipos de Contraoferta**: Precio, Fechas, Equipos Adicionales, Términos de Renta

### Próximos Pasos Post-Dashboard:
- Desarrollo de páginas específicas (Órdenes, Paquetes, Negociaciones)
- Integración con backend/API
- Sistema de notificaciones en tiempo real
- Reportes y analytics específicos del negocio

---

## 🎯 Definición de Completado
El proyecto estará completo cuando:
- [x] Todas las etapas estén marcadas como completadas
- [ ] El dashboard refleje accurately el modelo de negocio de TUMex
- [ ] El flujo de doble aprobación esté claramente representado
- [ ] Las negociaciones y contraoffertas sean visibles y gestionables
- [ ] La experiencia de usuario sea intuitiva para administradores
- [ ] El calendario esté completamente integrado y funcional

---

*Última actualización: 2025-06-27*
