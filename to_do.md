
# 📋 Plan de Implementación - Dashboard TUMex para Paquetes Quirúrgicos

## Estado del Proyecto
- [x] Análisis del modelo de negocio
- [x] Definición de etapas de desarrollo
- [ ] Implementación en progreso

---

## ✅ ETAPA 1: Actualización de Estadísticas Principales
**Objetivo**: Transformar las métricas del dashboard para reflejar el modelo de negocio de paquetes quirúrgicos

### Tareas:
- [ ] Cambiar "Alquileres Activos" → "Órdenes de Renta Activas"
- [ ] Cambiar "Solicitudes Pendientes" → "Órdenes Pendientes de Aprobación"
- [ ] Cambiar "Total de Equipos" → "Paquetes Quirúrgicos Disponibles"
- [ ] Cambiar "Tickets de Soporte" → "Contraoffertas Recibidas"
- [ ] Actualizar colores e iconos apropiados para cada métrica
- [ ] Ajustar números de ejemplo realistas

**Entregables**: 4 cards de estadísticas actualizadas con nuevo contenido y colores apropiados

**Archivos a modificar**: `src/pages/Dashboard.tsx`

---

## ✅ ETAPA 2: Transformación del Componente de Solicitudes
**Objetivo**: Convertir "Solicitudes por Aceptar" en "Órdenes Pendientes de Aprobación"

### Tareas:
- [ ] Cambiar título de sección: "Solicitudes por Aceptar" → "Órdenes Pendientes de Aprobación"
- [ ] Actualizar ejemplos a paquetes quirúrgicos:
  - [ ] "Monitor de Signos Vitales" → "Paquete Laparoscopía Completo"
  - [ ] "Ventilador Mecánico" → "Paquete Cirugía Cardiovascular"
  - [ ] "Bomba de Infusión" → "Paquete Neurocirugía"
- [ ] Implementar sistema de indicadores de aprobación:
  - [ ] Badge "1/2 Aprobaciones"
  - [ ] Badge "2/2 Aprobaciones - Listo para Enviar"
  - [ ] Badge "Pendiente 1ra Aprobación"
- [ ] Crear estados visuales diferenciados por color
- [ ] Implementar botones de acción contextuales:
  - [ ] "Aprobar" (para primeras aprobaciones)
  - [ ] "Aprobar y Enviar" (para segundas aprobaciones)
  - [ ] "Ver Detalles"
- [ ] Actualizar badge de contador: "5 pendientes" → "3 pendientes de aprobación"

**Entregables**: Componente rediseñado con flujo de doble aprobación

**Archivos a modificar**: `src/pages/Dashboard.tsx`

---

## ✅ ETAPA 3: Nueva Sección de Negociaciones Activas
**Objetivo**: Crear componente para gestionar contraoffertas de clientes

### Tareas:
- [ ] Reemplazar sección "Servicio al Cliente" con "Negociaciones Activas"
- [ ] Crear estructura de contraoffertas:
  - [ ] ID de orden original
  - [ ] Paquete quirúrgico solicitado
  - [ ] Oferta original vs contraoferta del cliente
  - [ ] Estado de negociación
  - [ ] Tiempo transcurrido desde última oferta
- [ ] Implementar indicadores de tiempo:
  - [ ] "Hace 2 horas" (reciente)
  - [ ] "Hace 1 día" (urgente)
  - [ ] "Hace 3 días" (crítico)
- [ ] Crear acciones rápidas:
  - [ ] "Aceptar Contraoferta"
  - [ ] "Rechazar"
  - [ ] "Negociar"
  - [ ] "Ver Historial"
- [ ] Badge de contador: "2 negociaciones activas"

**Entregables**: Nuevo componente "Negociaciones Activas"

**Archivos a modificar**: `src/pages/Dashboard.tsx`

---

## ✅ ETAPA 4: Actualización de Actividad Reciente
**Objetivo**: Reflejar el flujo real del negocio en el historial de actividades

### Tareas:
- [ ] Actualizar ejemplos de actividades:
  - [ ] "Nueva solicitud de alquiler" → "Nueva orden de paquete quirúrgico recibida"
  - [ ] "Equipo devuelto" → "Paquete Laparoscopía devuelto completo"
  - [ ] "Mantenimiento completado" → "Primera aprobación completada"
- [ ] Agregar nuevos tipos de actividad:
  - [ ] "Segunda aprobación otorgada"
  - [ ] "Orden enviada al cliente"
  - [ ] "Contraoferta recibida"
  - [ ] "Negociación finalizada"
- [ ] Actualizar nombres de equipos:
  - [ ] "Máquina de Ultrasonido XR-200" → "Paquete Cirugía General Completo"
  - [ ] "Monitor de Paciente PM-500" → "Paquete Laparoscopía Estándar"
  - [ ] "Ventilador Mecánico VM-300" → "Paquete Cirugía Cardíaca Premium"
- [ ] Actualizar estados:
  - [ ] "completado" → "aprobado"
  - [ ] "pendiente" → "en proceso de aprobación"
  - [ ] "devuelto" → "finalizado"

**Entregables**: Componente de actividad reciente actualizado

**Archivos a modificar**: `src/pages/Dashboard.tsx`

---

## ✅ ETAPA 5: Sistema de Estados y Badges
**Objetivo**: Implementar código de colores y badges para estados del flujo

### Tareas:
- [ ] Definir código de colores por estado:
  - [ ] Verde: "2/2 Aprobaciones - Listo"
  - [ ] Amarillo: "1/2 Aprobaciones"
  - [ ] Azul: "Pendiente 1ra Aprobación"
  - [ ] Naranja: "En Negociación"
  - [ ] Rojo: "Urgente/Crítico"
- [ ] Crear badges de progreso:
  - [ ] Badge "1/2" con color amarillo
  - [ ] Badge "2/2" con color verde
  - [ ] Badge "Listo para Enviar" con color verde brillante
- [ ] Implementar indicadores de urgencia:
  - [ ] Por tiempo de espera
  - [ ] Por tipo de cirugía (urgente vs programada)
  - [ ] Por valor de la orden
- [ ] Asegurar consistencia visual en toda la aplicación

**Entregables**: Sistema de badges y estados implementado

**Archivos a modificar**: `src/pages/Dashboard.tsx`, posible creación de `src/components/StatusBadge.tsx`

---

## ✅ ETAPA 6: Refinamiento y Optimización
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

---

*Última actualización: 2025-06-27*
