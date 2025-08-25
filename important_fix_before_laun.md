# Vulnerabilidades importantes a corregir antes de lanzar a producción

## Resumen de vulnerabilidades detectadas (`npm audit`)

- **esbuild <=0.24.2**
  - **Severidad:** Moderada
  - **Descripción:** esbuild permite que cualquier sitio web envíe solicitudes al servidor de desarrollo y lea la respuesta.
  - **Más información:** [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99)
  - **Solución:** Actualmente no hay una solución disponible.

- **Dependencias afectadas:**
  - `vite` (versiones 0.11.0 - 6.1.6) depende de versiones vulnerables de esbuild.
  - `lovable-tagger` depende de versiones vulnerables de vite.

- **Total:** 3 vulnerabilidades de severidad moderada.

## Recomendaciones

- Mientras el proyecto esté en desarrollo local, el riesgo es bajo.
- No exponer el servidor de desarrollo a internet.
- Revisar periódicamente si hay actualizaciones de las dependencias.
- Antes de lanzar a producción, asegurarse de que estas vulnerabilidades estén resueltas o mitigadas.

---

_Este archivo sirve como recordatorio para revisar y corregir estas vulnerabilidades antes de lanzar el proyecto a producción._ 