# ADR-005: Elección del Framework del Módulo API Pública (FastAPI)

**Estado:** Aceptada  
**Fecha:** 2026-06-20  

## Contexto
El Módulo 3 (API Pública) es responsable de las lecturas masivas del catálogo (búsqueda de psicólogos, filtrado, listado). Según los requisitos no funcionales, este módulo debe estar optimizado para latencia y responder consistentemente por debajo de los 300 ms (p95).

Opciones de framework backend para la API:
1. Django REST Framework (DRF)
2. Flask
3. **FastAPI**

## Decisión
Se eligió **FastAPI** como el framework base para todos los módulos de la API, incluyendo la API Pública (Módulo 3), Auth (Módulo 4) y el Módulo de Negocio nuevo (Citas/Triage).

## Justificación
1. **Rendimiento ASGI:** FastAPI funciona de forma asíncrona por defecto, lo que permite manejar operaciones de I/O (consultas a base de datos y Elasticsearch) sin bloquear el hilo principal. Supera a DRF significativamente en benchmarks de latencia.
2. **Documentación Automática (OpenAPI):** FastAPI genera la especificación OpenAPI (Swagger) automáticamente basada en los esquemas Pydantic. Esto es crítico para la rúbrica, ya que el Frontend debe validar sus contratos usando estos esquemas autogenerados.
3. **Validación de Datos en Tiempo de Ejecución:** El uso de Pydantic asegura que "el código es sensible a los datos de entrada y devuelve códigos y mensajes de error apropiados", tal cual exige la sección de "Criterios técnicos".

## Consecuencias
- **Positivas:** Cumplimiento holgado del requisito de latencia y generación instantánea del contrato API para que el equipo de frontend trabaje en paralelo.
- **Negativas:** Obliga a utilizar herramientas nativas asíncronas o conectores optimizados, aumentando levemente la curva de aprendizaje frente a frameworks sincrónicos como Flask.
