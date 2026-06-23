# ADR-001: Arquitectura Basada en Servicios con Django y FastAPI

**Estado:** Aceptada 
**Fecha:** 2026-06-20

## Contexto
El proyecto exige una arquitectura de "Monolito Modular". Tradicionalmente, un monolito se construye sobre un único framework y se despliega en un solo proceso. Sin embargo, nuestro equipo se enfrentó a un dilema: necesitábamos la robustez de un panel administrativo maduro (Módulo Admin) y un rendimiento excepcional de baja latencia para la lectura del catálogo (Módulo API Pública).

Las opciones consideradas fueron:
1. Construir todo en Django (Admin nativo + Django REST Framework).
2. Construir todo en FastAPI (API nativa + un admin panel de terceros como SQLAdmin).
3. **Backend híbrido:** Separar el Módulo Admin en Django y los Módulos Auth/API Pública en FastAPI, orquestados bajo la misma red docker y compartiendo la misma base de datos.

## Decisión
Adoptamos la opción 3: **Backend híbrido (Django + FastAPI)**.

## Justificación (Análisis de Viabilidad)

La elección se fundamenta respondiendo a la rúbrica del proyecto:

1. **Complejidad técnica del negocio:** Es alta. Se requiere un panel administrativo robusto (CRUD instantáneo) y una API de alto rendimiento para interactividad en catálogos y sistemas de evaluación (triage). Ningún framework por sí solo resolvía ambas necesidades con igual eficiencia.
2. **Experiencia del equipo:** El equipo posee experiencia técnica sólida tanto en el ecosistema tradicional de Django (para la gestión administrativa) como en ecosistemas modernos asíncronos (FastAPI), reduciendo los riesgos técnicos de integrar ambas tecnologías.
3. **Rendimiento y Latencia requerida:** Para las búsquedas en el catálogo y agendamientos, la rúbrica exige latencias muy estrictas (p95 < 300ms). FastAPI asíncrono supera ampliamente a Django sincrónico en este aspecto.
4. **Carga y huella de infraestructura (Bundle/Memoria):** Aunque requiere dos imágenes Docker separadas, los contenedores de FastAPI (Uvicorn) son extremadamente ligeros (Bundle pequeño en backend), y el uso de Alpine Linux mantiene el impacto en RAM por debajo del límite aceptable.
5. **Relación Costo/Beneficio (Sprint de 4 semanas):** Forzar a Django a ser ultra-rápido de forma asíncrona o programar un panel de administración completo desde cero en FastAPI tomaría meses. Dividir las tareas maximiza el tiempo: Django ahorra semanas de maquetado administrativo, y FastAPI permite un desarrollo ágil y veloz de la API.

## Consecuencias
- **Positivas:** Obtenemos lo mejor de ambos mundos (Seguridad Administrativa y Rendimiento de API).
- **Negativas:** Obliga a mantener dos `Dockerfile` y a realizar un mapeo cuidadoso entre el ORM de Django y SQLAlchemy para asegurar la integridad de las tablas. Se utiliza Kafka y workers para tareas de fondo a fin de aislar fallos.
