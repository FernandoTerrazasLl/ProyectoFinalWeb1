# ADR-005: Elección del Framework del Módulo API Pública (FastAPI)

**Estado:** Aceptada  
**Fecha:** 2026-06-20  

## Contexto
El Módulo de API Pública es responsable de las lecturas masivas del catálogo (búsqueda de psicólogos, filtrado, listado). Según los requisitos no funcionales y la rúbrica, este módulo debe estar optimizado para latencia y responder consistentemente por debajo de los 300 ms (p95). Además, requiere documentar sus contratos estrictamente.

Opciones de framework backend para la API:
1. Django REST Framework (DRF)
2. Flask
3. **FastAPI**

## Decisión
Se eligió **FastAPI** como el framework base para todos los módulos de la API, incluyendo la API Pública, Auth y el Módulo de Negocio nuevo (Citas/Triage).

## Justificación (Análisis de Viabilidad)

La elección se fundamenta respondiendo a la rúbrica del proyecto:

1. **Complejidad de procesamiento:** Alta. FastAPI debe realizar múltiples operaciones de entrada/salida (I/O) simultáneas hacia bases de datos externas como PostgreSQL y Elasticsearch para devolver resultados unificados y filtrados del catálogo médico.
2. **Experiencia del equipo:** Fuerte experiencia en Python moderno (tipado estático), la librería `asyncio`, y validación de esquemas con `pydantic`. Esto reduce casi a cero la curva de adopción técnica.
3. **Nivel de rendimiento inicial (Latencia):** El requerimiento clave es la latencia (p95 < 300ms). FastAPI funciona de forma asíncrona nativa mediante Starlette, permitiendo mantener conexiones I/O sin bloquear el hilo principal. Supera a DRF significativamente en benchmarks de velocidad.
4. **Carga en infraestructura (Bundle Backend):** FastAPI no incluye ORMs obligatorios, motores de plantillas HTML ni módulos innecesarios. Esto genera contenedores Docker ("bundles") sumamente ligeros que arrancan en fracciones de segundo y consumen memoria RAM mínima.
5. **Relación Costo/Beneficio (Sprint de 4 semanas):** Documentar una API manualmente toma decenas de horas. La generación automática de OpenAPI (Swagger) de FastAPI elimina por completo el costo de redacción de contratos, permitiendo al equipo de frontend integrarse el mismo día que se publica el endpoint.

## Consecuencias
- **Positivas:** Cumplimiento garantizado del requisito de latencia y generación instantánea del contrato API mediante esquemas autogenerados.
- **Negativas:** Su enfoque estrictamente asíncrono penaliza si algún desarrollador sin experiencia introduce una librería de Python sincrónica que bloquee el Event Loop (como usar un `requests` estándar en lugar de un cliente asíncrono), lo cual exige mayor revisión de código.
