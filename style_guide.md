
# 🎨 TUMex Design System - Guía de Estilo

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Paleta de Colores](#paleta-de-colores)
3. [Tipografía](#tipografía)
4. [Espaciado y Layout](#espaciado-y-layout)
5. [Componentes UI](#componentes-ui)
6. [Patrones de Diseño](#patrones-de-diseño)
7. [Responsive Design](#responsive-design)
8. [Iconografía](#iconografía)
9. [Estados y Feedback](#estados-y-feedback)
10. [Mejores Prácticas](#mejores-prácticas)

---

## Introducción

Este documento define el sistema de diseño de TUMex, una aplicación web para la gestión de paquetes quirúrgicos. El objetivo es mantener consistencia visual y funcional en toda la aplicación.

### Principios de Diseño
- **Claridad**: Interfaces limpias y fáciles de entender
- **Consistencia**: Elementos uniformes en toda la aplicación
- **Profesionalismo**: Diseño apropiado para el sector médico
- **Eficiencia**: Facilitar las tareas del usuario

---

## Paleta de Colores

### Colores Primarios
```css
/* TUMex Primary - Teal/Cyan */
--tumex-primary-100: hsl(191, 40%, 92%)  /* #E6F3F5 */
--tumex-primary-200: hsl(191, 35%, 82%)  /* #CCEBF0 */
--tumex-primary-300: hsl(191, 35%, 72%)  /* #B3E2EA */
--tumex-primary-400: hsl(191, 35%, 62%)  /* #99DAE5 */
--tumex-primary-500: hsl(190, 48%, 32%)  /* #27737B - Color principal */
--tumex-primary-600: hsl(190, 50%, 26%)  /* #1F5D64 */
--tumex-primary-700: hsl(191, 55%, 20%)  /* #17464C */
--tumex-primary-800: hsl(191, 60%, 14%)  /* #0F3135 */
--tumex-primary-900: hsl(191, 65%, 8%)   /* #071B1D */
```

### Colores Secundarios
```css
/* TUMex Secondary - Light Gray */
--tumex-secondary-500: hsl(180, 20%, 92%)  /* #E8F2F2 */

/* TUMex Tertiary - Bright Cyan */
--tumex-tertiary-500: hsl(184, 95%, 35%)  /* #038A8A */
```

### Colores de Estado
```css
/* Éxito */
--success: hsl(142, 71%, 45%)      /* #22C55E */
--success-light: hsl(142, 69%, 93%) /* #DCFCE7 */

/* Advertencia */
--warning: hsl(48, 96%, 53%)       /* #EAB308 */
--warning-light: hsl(48, 90%, 95%) /* #FEFCE8 */

/* Error */
--error: hsl(0, 84%, 60%)          /* #EF4444 */
--error-light: hsl(0, 93%, 95%)    /* #FEF2F2 */

/* Información */
--info: hsl(217, 91%, 60%)         /* #3B82F6 */
--info-light: hsl(214, 95%, 93%)   /* #DBEAFE */
```

### Colores Neutrales
```css
/* Grises */
--gray-50: hsl(210, 20%, 98%)      /* #F9FAFB */
--gray-100: hsl(220, 14%, 96%)     /* #F3F4F6 */
--gray-200: hsl(220, 13%, 91%)     /* #E5E7EB */
--gray-300: hsl(216, 12%, 84%)     /* #D1D5DB */
--gray-400: hsl(218, 11%, 65%)     /* #9CA3AF */
--gray-500: hsl(220, 9%, 46%)      /* #6B7280 */
--gray-600: hsl(215, 14%, 34%)     /* #4B5563 */
--gray-700: hsl(217, 19%, 27%)     /* #374151 */
--gray-800: hsl(215, 28%, 17%)     /* #1F2937 */
--gray-900: hsl(222, 84%, 5%)      /* #111827 */
```

---

## Tipografía

### Fuentes del Sistema
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Escalas de Tamaño
```css
/* Tamaños de Texto */
.text-xs   { font-size: 0.75rem; }   /* 12px */
.text-sm   { font-size: 0.875rem; }  /* 14px */
.text-base { font-size: 1rem; }      /* 16px */
.text-lg   { font-size: 1.125rem; }  /* 18px */
.text-xl   { font-size: 1.25rem; }   /* 20px */
.text-2xl  { font-size: 1.5rem; }    /* 24px */
.text-3xl  { font-size: 1.875rem; }  /* 30px */
```

### Pesos de Fuente
```css
.font-normal    { font-weight: 400; }
.font-medium    { font-weight: 500; }
.font-semibold  { font-weight: 600; }
.font-bold      { font-weight: 700; }
```

### Uso de Tipografía
- **Títulos principales**: `text-lg sm:text-xl font-semibold`
- **Subtítulos**: `text-sm sm:text-base font-medium`
- **Texto de contenido**: `text-sm text-gray-700`
- **Texto auxiliar**: `text-xs text-gray-500`
- **Texto de código**: `font-mono text-sm`

---

## Espaciado y Layout

### Sistema de Espaciado
```css
/* Espaciado basado en incrementos de 4px */
.space-1  { 0.25rem; }  /* 4px */
.space-2  { 0.5rem; }   /* 8px */
.space-3  { 0.75rem; }  /* 12px */
.space-4  { 1rem; }     /* 16px */
.space-6  { 1.5rem; }   /* 24px */
.space-8  { 2rem; }     /* 32px */
.space-12 { 3rem; }     /* 48px */
```

### Contenedores Principales
```css
/* Espaciado del dashboard */
.dashboard-container {
  padding: 0.75rem;
  gap: 1rem;
}

@media (min-width: 640px) {
  .dashboard-container {
    padding: 1.5rem;
    gap: 1.5rem;
  }
}
```

### Grid System
```css
/* Layouts responsivos */
.grid-responsive-2 {
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 768px) {
  .grid-responsive-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-responsive-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## Componentes UI

### Border Radius
```css
/* Sistema de bordes redondeados personalizado */
--radius: 0.875rem;                    /* 14px para elementos pequeños */
.tumex-button-radius { border-radius: var(--radius); }
.tumex-card-radius { border-radius: 1.125rem; }  /* 18px para cards */
```

### Botones

#### Botón Primario
```tsx
<Button className="tumex-button-radius bg-tumex-primary-500 hover:bg-tumex-primary-600 text-white">
  Texto del Botón
</Button>
```

#### Botón Secundario
```tsx
<Button variant="outline" className="tumex-button-radius border-gray-300 text-gray-600 hover:bg-gray-50">
  Texto del Botón
</Button>
```

#### Botón de Estado
```tsx
<Button className="tumex-button-radius bg-green-600 hover:bg-green-700 text-white">
  Aceptar
</Button>

<Button variant="outline" className="tumex-button-radius border-red-300 text-red-600 hover:bg-red-50">
  Rechazar
</Button>
```

### Cards
```tsx
<Card className="p-3 sm:p-4 tumex-card-radius bg-white">
  {/* Contenido */}
</Card>
```

### Badges
```tsx
{/* Badge de estado estándar */}
<Badge className="tumex-button-radius text-xs font-medium border bg-tumex-primary-100 text-tumex-primary-800 border-tumex-primary-300">
  Estado
</Badge>

{/* Badge de éxito */}
<Badge className="tumex-button-radius text-xs font-medium border bg-green-100 text-green-800 border-green-300">
  Completado
</Badge>

{/* Badge de advertencia */}
<Badge className="tumex-button-radius text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-300">
  Pendiente
</Badge>

{/* Badge de error */}
<Badge className="tumex-button-radius text-xs font-medium border bg-red-100 text-red-800 border-red-300">
  Crítico
</Badge>
```

---

## Patrones de Diseño

### Estructura de Secciones
```tsx
// Patrón estándar para secciones del dashboard
<Card className="p-3 sm:p-4 tumex-card-radius bg-white h-full flex flex-col">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
      Título de la Sección
    </h2>
    <Badge variant="secondary" className="tumex-button-radius">
      Contador
    </Badge>
  </div>

  {/* Contenido */}
  <div className="flex-1">
    {/* Contenido principal */}
  </div>
</Card>
```

### Elementos de Lista
```tsx
// Patrón para elementos de lista con acciones
<div className="p-3 bg-gray-50 rounded-tumex-button space-y-3">
  {/* Header con ID y estado */}
  <div className="flex items-center justify-between">
    <span className="text-sm font-mono font-semibold text-gray-900">
      #ID-001
    </span>
    <Badge className="tumex-button-radius text-xs">
      Estado
    </Badge>
  </div>
  
  {/* Información principal */}
  <div className="space-y-2">
    <div>
      <p className="text-xs text-gray-500">Etiqueta</p>
      <p className="text-sm font-medium text-gray-900">Valor</p>
    </div>
  </div>

  {/* Acciones */}
  <div className="flex gap-2 pt-2">
    <Button size="sm" className="tumex-button-radius">
      Acción Principal
    </Button>
    <Button size="sm" variant="outline" className="tumex-button-radius">
      Acción Secundaria
    </Button>
  </div>
</div>
```

---

## Responsive Design

### Breakpoints
```css
/* Breakpoints del sistema */
sm: 640px   /* Tablets pequeñas */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
2xl: 1536px /* Desktop muy grande */
```

### Patrones Responsivos
```css
/* Espaciado responsivo */
.responsive-spacing {
  padding: 0.75rem;
  gap: 1rem;
}

@media (min-width: 640px) {
  .responsive-spacing {
    padding: 1.5rem;
    gap: 1.5rem;
  }
}

/* Texto responsivo */
.responsive-text {
  font-size: 0.875rem;
}

@media (min-width: 640px) {
  .responsive-text {
    font-size: 1rem;
  }
}
```

### Grid Responsivo
```tsx
// Grid que se adapta de 1 columna a 2 columnas
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
  {/* Contenido */}
</div>

// Grid que se adapta de 1 a 2 a 4 columnas
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  {/* Contenido */}
</div>
```

---

## Iconografía

### Biblioteca de Iconos
Usamos **Lucide React** como biblioteca principal de iconos.

### Tamaños de Iconos
```tsx
// Tamaños estándar
<Icon className="h-4 w-4" />     /* 16px - Iconos pequeños */
<Icon className="h-5 w-5" />     /* 20px - Iconos medianos */
<Icon className="h-6 w-6" />     /* 24px - Iconos grandes */
<Icon className="h-8 w-8" />     /* 32px - Iconos muy grandes */
```

### Iconos por Contexto
```tsx
// Navegación
import { Menu, Bell, User, Search } from "lucide-react";

// Acciones
import { Eye, Edit, Trash2, Plus, Download } from "lucide-react";

// Estados
import { Check, X, AlertTriangle, Info, Clock } from "lucide-react";

// Negocio
import { Package, Truck, Calendar, FileText } from "lucide-react";
```

### Uso de Iconos
```tsx
// Icono con texto
<Button className="tumex-button-radius">
  <Eye className="h-4 w-4 mr-2" />
  Ver Detalles
</Button>

// Icono solo
<button className="p-2 hover:bg-gray-100 rounded-tumex-button">
  <Bell className="h-5 w-5 text-gray-600" />
</button>
```

---

## Estados y Feedback

### Estados de Aprobación
```tsx
// Colores por estado
const statusColors = {
  pending: "bg-tumex-primary-100 text-tumex-primary-800 border-tumex-primary-300",
  partial: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  critical: "bg-red-100 text-red-800 border-red-300"
};
```

### Indicadores de Tiempo
```tsx
// Colores por urgencia
const timeColors = {
  recent: "bg-green-100 text-green-800 border-green-300",  // Hace pocas horas
  urgent: "bg-yellow-100 text-yellow-800 border-yellow-300", // Hace 1 día
  critical: "bg-red-100 text-red-800 border-red-300"      // Hace varios días
};
```

### Loading States
```tsx
// Skeleton para carga
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
</div>
```

---

## Mejores Prácticas

### Estructura de Componentes
```tsx
// Estructura recomendada para componentes
const ComponentName = () => {
  // 1. Hooks y estado
  const [state, setState] = useState();
  
  // 2. Funciones auxiliares
  const handleAction = () => {
    // Lógica
  };
  
  // 3. Datos
  const items = [...];
  
  // 4. Render
  return (
    <Card className="p-3 sm:p-4 tumex-card-radius bg-white">
      {/* Contenido */}
    </Card>
  );
};
```

### Naming Conventions
```tsx
// Variables de estado
const [isLoading, setIsLoading] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

// Funciones de manejo
const handleClick = () => {};
const handleSubmit = () => {};
const handleChange = () => {};

// Clases CSS
const baseClasses = "tumex-button-radius bg-white";
const activeClasses = "bg-tumex-primary-500 text-white";
```

### Accesibilidad
```tsx
// Siempre incluir texto alternativo
<Button aria-label="Ver detalles de la orden">
  <Eye className="h-4 w-4" />
</Button>

// Usar roles apropiados
<div role="button" tabIndex={0}>
  Elemento clickeable
</div>

// Estados de loading
<Button disabled={isLoading}>
  {isLoading ? 'Cargando...' : 'Enviar'}
</Button>
```

### Performance
```tsx
// Memorizar componentes pesados
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Renderizado complejo */}</div>;
});

// Lazy loading para componentes grandes
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

---

## Sidebar y Navegación

### Sidebar Configuration
```tsx
// Estructura del sidebar
<SidebarProvider>
  <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
    <TumexSidebar />
    <div className="flex-1 flex flex-col">
      {/* Contenido principal */}
    </div>
  </div>
</SidebarProvider>
```

### Glass Effect
```css
/* Efecto de vidrio para el sidebar */
.sidebar-glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

---

## Conclusión

Este sistema de diseño proporciona una base sólida para el desarrollo consistente de la aplicación TUMex. Todos los desarrolladores deben seguir estas pautas para mantener la coherencia visual y funcional.

### Recursos Adicionales
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Shadcn/ui**: [https://ui.shadcn.com](https://ui.shadcn.com)
- **Lucide React**: [https://lucide.dev](https://lucide.dev)

---

*Última actualización: 2025-06-27*
