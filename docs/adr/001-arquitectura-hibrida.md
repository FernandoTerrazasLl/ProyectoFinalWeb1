# ADR-001: Arquitectura de Monolito Lógico (Backend Políglota con Django y FastAPI)

**Estado:** Aceptada  
**Fecha:** 2026-06-20  

## Contexto
El proyecto exige una arquitectura de "Monolito Modular". Tradicionalmente, un monolito se construye sobre un único framework y se despliega en un solo proceso. Sin embargo, nuestro equipo se enfrentó a un dilema: necesitábamos la robustez de un panel administrativo maduro (Módulo Admin) y un rendimiento excepcional de baja latencia para la lectura del catálogo (Módulo API Pública).

Las opciones consideradas fueron:
1. Construir todo en Django (Admin nativo + Django REST Framework).
2. Construir todo en FastAPI (API nativa + un admin panel de terceros como SQLAdmin).
3. **Backend Políglota:** Separar el Módulo Admin en Django y los Módulos Auth/API Pública en FastAPI, orquestados bajo la misma red docker y compartiendo la misma base de datos.

## Decisión
Adoptamos la opción 3: **Backend Políglota (Django + FastAPI)**.

Esta arquitectura relaja la definición estricta de "despliegue único en un solo proceso" al utilizar dos contenedores de aplicación, pero conforma un **Monolito Lógico** fuertemente acoplado en el nivel de datos e infraestructura.

## Justificación
- **Velocidad de desarrollo administrativo:** Django nos regala un CRUD completo y seguro (Módulo 1) sin requerir semanas de desarrollo.
- **Rendimiento asíncrono:** FastAPI (Módulos 3, 4 y el nuevo módulo de negocio) nos asegura cumplir con el SLA de latencia ($p95 < 300$ ms) gracias a su naturaleza asíncrona (ASGI).
- Las habilidades del equipo estaban divididas entre ambos ecosistemas.

## Consecuencias
- **Positivas:** Obtenemos lo mejor de ambos mundos (Seguridad Administrativa y Rendimiento de API).
- **Negativas:** Obliga a mantener dos `Dockerfile` y a realizar un mapeo cuidadoso entre el ORM de Django y SQLAlchemy para asegurar la integridad de las tablas.
