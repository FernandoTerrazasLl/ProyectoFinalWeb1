# ADR-004: Arquitectura del Frontend (Vanilla JS + Handlebars + FSD)

**Estado:** Aceptada  
**Fecha:** 2026-06-20  

## Contexto
El proyecto exige un Frontend robusto que consuma todos los módulos del backend y demuestre las historias de usuario de extremo a extremo. La rúbrica prohíbe frameworks full-stack como Next.js, exige CSS bajo metodología BEM, y obliga a elegir una arquitectura estructurada (MVC o FSD).

Opciones evaluadas:
1. React con arquitectura MVC.
2. Angular (CLI).
3. **Vanilla JS con componentes en Handlebars y arquitectura FSD**.

## Decisión
Se decidió construir el Frontend utilizando **Vanilla JS orquestado con Vite, Handlebars para la creación de componentes UI reutilizables, y Feature-Sliced Design (FSD) como arquitectura base**.

## Justificación
- **Ligereza y Rendering Directo:** Handlebars nos permite tener templates limpios y un renderizado extremadamente rápido en el cliente sin el peso del Virtual DOM de React. Asegura que ningún chunk supere los 250 KB.
- **Arquitectura FSD (Feature-Sliced Design):** Garantiza una separación estricta de las responsabilidades del negocio (features), las entidades del dominio (entities) y los componentes compartidos (shared). Es altamente escalable y se alinea perfectamente con la división de módulos de nuestro backend.
- **Metodología BEM:** Handlebars y Vanilla CSS se complementan naturalmente para aplicar la metodología de nombrado BEM sin requerir abstracciones complejas.

## Consecuencias
- **Positivas:** El código frontend es agnóstico a grandes frameworks comerciales, tiene un tiempo de carga (LCP) inmejorable, y la estructura FSD facilita que nuevos desarrolladores entiendan las reglas de negocio aisladas por "features".
- **Negativas:** La reactividad del estado global debe ser implementada manualmente mediante patrones de observabilidad (Observer) en Vanilla JS, lo que demanda un diseño más cuidadoso del flujo de datos.
