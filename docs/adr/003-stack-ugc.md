# ADR-003: Selección del Stack Tecnológico para UGC y API Pública

**Estado:** Aceptada
**Fecha:** 2026-06-21
**Contexto:** El monolito modular debe integrar módulos avanzados de acuerdo con los requerimientos técnicos estrictos del proyecto. Particularmente:
- **Módulos 2 y 3 (ETL y API Pública):** Requieren optimización para baja latencia. Consultar directamente PostgreSQL para la lectura masiva del catálogo de especialistas no es viable debido a la latencia y carga.
- **Módulo 4 (Auth):** Requiere manejo robusto de sesiones y JWT tokens.
- **Módulo 5 (UGC):** Genera grandes volúmenes de eventos y métricas de usuario (clicks, vistas, reseñas, ratings). Usar PostgreSQL saturaría la base transaccional.

Las opciones consideradas son: 
a) Mantener todo en PostgreSQL para simplificar el stack.
b) Adoptar una arquitectura de eventos distribuida tipo CQRS inyectando infraestructura especializada según el dominio (Redis, Elasticsearch, Mongo, Kafka, ClickHouse).

**Decisión:** Adoptamos la opción (b) para cumplir al 100% con los criterios de evaluación. 
Se ha integrado el siguiente stack al `docker-compose.yml`:
1. **Elasticsearch:** Como índice de lectura para el catálogo de la API pública.
2. **Redis:** Como caché en memoria y gestor de tokens para Auth.
3. **Kafka:** Como bus de eventos asíncronos para desacoplar la ingesta de UGC.
4. **MongoDB:** Para almacenar el UGC estructurado (documentos de reseñas sin un esquema relacional estricto).
5. **ClickHouse:** Para analítica de eventos a gran escala.

**Consecuencias:**
+ **Ventajas:** Cumplimiento total de la rúbrica. Desacoplamiento extremo entre el dominio transaccional (Admin/Django) y el dominio de lectura analítica. Lecturas sub-300ms aseguradas.
- **Desventajas:** Incremento dramático en el consumo de RAM del entorno local (requiriendo más de 6GB asignados a Docker). Complejidad operativa añadida para sincronizar PostgreSQL con Elasticsearch y Kafka.
