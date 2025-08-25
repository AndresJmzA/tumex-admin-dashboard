# 📜 Guía de Arquitectura y Desarrollo para la WebApp TUMex

**Versión:** 1.0
**Fecha:** 18 de julio de 2025
**Proyecto:** Panel de Administración y Operaciones TUMex (PWA)

## 1. Resumen del Proyecto

Este documento define la arquitectura, funcionalidades y permisos para la **Progressive Web App (PWA)** de TUMex. El objetivo es crear un panel de administración centralizado que digitalice y optimice el ciclo de vida completo de una orden de equipos médicos, desde la solicitud hasta la facturación. La aplicación debe ser escalable, intuitiva y adaptada a las necesidades específicas de cada rol dentro de la empresa.

## 2. Arquitectura Global de la PWA

La aplicación se estructurará en módulos funcionales para garantizar la escalabilidad y mantenibilidad.

* **Módulo de Autenticación y Roles (Auth & RBAC)**: Gestiona el inicio de sesión y los permisos. Cada usuario tendrá un rol asignado que definirá su acceso.
* **Módulo del Dashboard (`/`)**: Pantalla de inicio personalizada con widgets dinámicos según el rol del usuario.
* **Módulo de Órdenes (`/orders`)**: Núcleo de la aplicación. Gestiona el ciclo de vida de las órdenes.
* **Módulo de Inventario (`/inventory`)**: Catálogo de productos, control de stock y gestión de plantillas de cirugía.
* **Módulo de Calendario y Tareas (`/calendar`)**: Agenda de cirugías y asignación de tareas al personal técnico.
* **Módulo de Personal (`/personal`)**: Administración de perfiles de empleados, roles y permisos.
* **Módulo de Finanzas (`/finances`)**: Interfaz para supervisar órdenes completadas y gestionar la facturación.
* **Portal del Técnico (Vista Móvil)**: Interfaz simplificada y optimizada para dispositivos móviles, diseñada para el trabajo en campo.

## 3. Base de Datos

Se recomienda utilizar una base de datos robusta y escalable para el backend.

* **Consideraciones**:
    * **Base de Datos Relacional**: Ideal para gestionar las complejas relaciones entre órdenes, clientes, inventario y personal, lo cual es crucial para el crecimiento futuro.
    * **Interfaz Intuitiva**: La interfaz de gestión debe permitir visualizar y editar los datos directamente en tablas, facilitando la gestión administrativa.
    * **Flexibilidad**: Ofrecer la flexibilidad de migrar a diferentes infraestructuras si la empresa lo requiere en el futuro.
    * **Capacidades en Tiempo Real**: Proporcionar actualizaciones en vivo, permitiendo que todos los roles vean los cambios de estado de las órdenes al instante.

---

## 4. Flujo de Trabajo y Permisos por Área

A continuación, se detalla qué verá y qué podrá hacer cada rol en la plataforma.

### 👑 **Administrador General**

**Visión General**: Usuario con acceso completo al sistema. Puede gestionar todos los módulos, usuarios y configuraciones.

* **Pantallas Principales**:
    1. **Dashboard General**: Vista completa de todos los módulos y estadísticas globales.
    2. **Gestión de Usuarios**: Administración completa de roles y permisos.
    3. **Configuración del Sistema**: Ajustes globales y configuración.

* **Permisos y Funcionalidades**:
    * **Acceso completo** a todos los módulos y funcionalidades.
    * **Gestión de usuarios**: Crear, editar, eliminar usuarios y asignar roles.
    * **Configuración del sistema**: Ajustes globales, parámetros del sistema.
    * **Reportes completos**: Acceso a todos los reportes y estadísticas.
    * **Auditoría**: Revisión de logs y actividad del sistema.

### 🧑‍💼 **Gerente Comercial**

**Visión General**: Responsable de capturar las órdenes iniciales y servir de puente con los médicos.

* **Pantallas Principales**:
    1.  **Dashboard Comercial**: Resumen de sus órdenes y notificaciones.
    2.  **Gestión de Órdenes**: Listado y detalle de las órdenes que ha creado.

* **Permisos y Funcionalidades**:
    * **En el Dashboard**:
        * Ver un widget con el estado de sus órdenes más recientes.
        * Recibir notificaciones de "Confirmación de equipos pendiente".
    * **En Órdenes**:
        * **Crear** nuevas órdenes manualmente a través del `NewOrderModal`.
        * **Leer** el estado y los detalles de todas las órdenes en las que participa.
        * **Actualizar** una orden para añadir o modificar la lista de equipos tras la llamada de verificación con el médico.
    * **En Finanzas**:
        * **Leer** el listado de órdenes completadas.
        * **Marcar** una orden como "Lista para Facturar".

### 🛠️ **Gerente Operativo**

**Visión General**: El coordinador central de las operaciones. Su misión es asegurar la viabilidad de cada orden y asignar los recursos necesarios.

* **Pantallas Principales**:
    1.  **Dashboard Operativo**: Centro de mando para acciones inmediatas.
    2.  **Gestión de Órdenes**: Vista completa para supervisar el ciclo de vida.
    3.  **Calendario de Equipo**: Herramienta de planificación.

* **Permisos y Funcionalidades**:
    * **En el Dashboard**:
        * Ver un panel principal con **"Órdenes por Revisar"**.
        * Recibir **alertas visuales** cuando dos órdenes se traslapen en fecha y hora. La alerta debe ofrecer opciones para **aceptar, reprogramar o rechazar** cualquiera de las dos órdenes.
    * **En Órdenes**:
        * **Leer** todas las órdenes del sistema.
        * **Aprobar o Rechazar** las órdenes nuevas. Si rechaza, debe añadir un motivo.
        * **Asignar** técnicos específicos a las órdenes aprobadas.
    * **En Inventario**:
        * **Leer** y revisar las plantillas de almacén creadas por el Jefe de Almacén.
        * **Aprobar** dichas plantillas.
    * **En Calendario**:
        * **Control total (Crear, Leer, Actualizar, Eliminar)** sobre la agenda de cirugías y tareas de los técnicos.

### 📦 **Jefe de Almacén**

**Visión General**: Responsable de la gestión del inventario físico y la preparación de los equipos para cada cirugía.

* **Pantallas Principales**:
    1.  **Dashboard de Almacén**: Vista rápida de tareas pendientes.
    2.  **Gestión de Inventario y Plantillas**: Su herramienta de trabajo principal.

* **Permisos y Funcionalidades**:
    * **En el Dashboard**:
        * Ver una lista de **"Órdenes Aprobadas por Preparar"**.
        * Ver un widget de **"Alertas de Inventario"** (stock bajo, sin stock).
    * **En Inventario**:
        * **Crear y Gestionar** las plantillas maestras de cirugías.
        * Para una orden aprobada, **Generar una Plantilla de Salida**.
        * Al generar la plantilla, el sistema realizará una **pre-verificación de stock** y mostrará el estado de cada ítem con un código de color:
            * ✅ **Disponible**
            * ⚠️ **Stock Bajo**
            * ❌ **Sin Stock**
            * 🔧 **En Mantenimiento**
            * ❓ **Revisión Manual Requerida**
        * **Actualizar** el stock de los productos al entrar y salir del almacén.

### 🩺 **Técnicos**

**Visión General**: El personal de campo. Necesitan una interfaz móvil, simple y centrada en la ejecución de tareas.

* **Pantallas Principales (Portal del Técnico - PWA)**:
    1.  **Mi Agenda de Hoy**: Lista de tareas cronológicas.
    2.  **Detalle de Tarea**: Pantalla para ejecutar y documentar cada paso.

* **Permisos y Funcionalidades**:
    * **En su Agenda**:
        * **Leer** las cirugías y tareas que tiene asignadas para el día/semana.
    * **En una Tarea Específica**:
        * **Actualizar** el estado de la tarea (`En Tránsito`, `En Sitio`, `Completada`).
        * **Subir Evidencias**: Acceder a la cámara o galería para subir fotos en cada etapa clave (traslado, preparación, retiro). **Cada carga de evidencia debe ir acompañada de un campo de texto para añadir notas o un mensaje descriptivo**.
        * **Registrar Cargos**: Al finalizar la cirugía, acceder a un formulario simple para anotar insumos extra utilizados.

### 💼 **Gerente Administrativo**

**Visión General**: Encargado de la documentación y el enlace con el área de finanzas.

* **Pantallas Principales**:
    1.  **Gestión de Remisiones**.
    2.  **Módulo de Finanzas**.

* **Permisos y Funcionalidades**:
    * **En Gestión de Remisiones**:
        * Ver una lista de órdenes listas para generar su nota de remisión.
        * **Generar un PDF** de la nota de remisión a partir de una plantilla y los datos de la orden. Este PDF estará listo para ser impreso.
        * **Subir** una foto o escaneo de la remisión firmada como evidencia de entrega.
    * **En Finanzas**:
        * **Leer** el listado de órdenes completadas.
        * Accionar un botón de **"Enviar a Facturación"**, que enviará un correo electrónico automatizado al área de finanzas.

### 💰 **Área de Finanzas**

**Visión General**: Responsable de la facturación final de las órdenes completadas.

* **Pantallas Principales**:
    1.  **Dashboard de Finanzas**: Vista de órdenes listas para facturar.

* **Permisos y Funcionalidades**:
    * **En el Dashboard**:
        * Ver una lista de órdenes marcadas como "Listas para Facturar".
    * **En Órdenes**:
        * **Leer** los detalles completos de una orden finalizada, incluyendo los cargos adicionales reportados por los técnicos.
        * **Actualizar** el estado de la orden a "Facturada" una vez que el proceso se haya completado externamente.

---

## 5. Notas para Desarrollo Futuro

* **Integración con Mapas y Logística**: Conectar la plataforma con una API de mapas (ej. Google Maps) para calcular tiempos de traslado en tiempo real y generar alertas de logística para el Gerente Operativo.
* **Portal de Clientes/Médicos**: Desarrollar un portal externo para que los doctores puedan crear y dar seguimiento a sus propias órdenes directamente en la plataforma.
* **Módulo de Facturación Integrado**: En lugar de un correo, conectar la app a una API de facturación (como Facturama, Bind ERP, etc.) para generar los CFDI directamente desde la plataforma.