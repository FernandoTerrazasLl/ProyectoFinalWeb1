# ADR-004: Arquitectura del Frontend (Vanilla JS + Handlebars + FSD)

**Estado:** Aceptada  
**Fecha:** 2026-06-20  

## Contexto
El proyecto exige un Frontend robusto que consuma todos los módulos del backend y demuestre las historias de usuario de extremo a extremo. La rúbrica prohíbe frameworks full-stack como Next.js, exige CSS bajo metodología BEM, y obliga a elegir una arquitectura estructurada (MVC o FSD).

Opciones evaluadas:
1. Vanilla TS con web componentes y arquitectura FSD
2. Vanilla TS con componentes en Handlebars y arquitectura MVC
3. **Vanilla TS con componentes en Handlebars y arquitectura FSD**.

## Decisión
Se decidió construir el Frontend utilizando **Vanilla TS orquestado con Vite, Handlebars para la creación de componentes UI reutilizables, y Feature-Sliced Design (FSD) como arquitectura base**.

## Justificación (Análisis de Viabilidad)

La elección se fundamenta respondiendo a la rúbrica del proyecto:

1. **Complejidad de la interactividad:** La plataforma requiere interactividad moderada (agendamiento, filtros, reseñas), sin llegar a extremos en tiempo real. El patrón Observer en Vanilla TS es suficiente para manejar los estados sin requerir React o Vue.
2. **Experiencia del equipo:** Fuerte conocimiento de DOM y Typescript puro. Aprender un framework reactivo complejo desde cero introduciría riesgos. FSD organiza esta experiencia vainilla en una estructura predecible.
3. **Nivel de SEO y Rendering Inicial:** El catálogo requiere SEO. Como Single Page Application (SPA), garantizamos un tiempo de carga del JS inicial ultrarrápido permitiendo que Googlebot indexe el DOM renderizado por Handlebars sin latencia.
4. **Tamaño del bundle aceptable:** Para pacientes en redes móviles, el tamaño debe ser ínfimo. Vanilla TS y Handlebars generan un bundle de apenas KB, superando ampliamente el tamaño base de librerías como React o Angular.
5. **Relación Costo/Beneficio (Sprint de 4 semanas):** Configurar y aprender React tomaría demasiado tiempo (Costo Alto). Vanilla elimina barreras iniciales, Handlebars agiliza la maquetación repetitiva, y FSD evita que el código veloz se vuelva insostenible (Beneficio Máximo para las 4 semanas).

## Consecuencias
- **Positivas:** El código frontend tiene un rendimiento elevadísimo (tiempo de carga mínimo) al ser vanilla. Además, la estructura FSD facilita que nuevos desarrolladores entiendan las reglas de negocio aisladas por "features".
- **Negativas:** La reactividad del estado global debe ser implementada manualmente mediante patrones de observabilidad (Observer) en Vanilla TS, lo que demanda un diseño más cuidadoso del flujo de datos.
