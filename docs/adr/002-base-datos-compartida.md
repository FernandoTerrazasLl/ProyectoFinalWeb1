# ADR-002: Base de Datos Compartida

**Estado:** Aceptada  
**Fecha:** 2026-06-20  

## Contexto
Al dividir nuestro sistema en dos partes (Django para el panel de administración y FastAPI), necesitamos decidir cómo van a compartir la información transaccional (Usuarios y Citas).

Opciones evaluadas:
1. **Preguntas directas (API REST):** Que Django le pida la información a FastAPI cada vez que la necesite.
2. **Bases de datos separadas copiándose datos (Kafka):** Que cada framework tenga su propia base de datos y se sincronicen asíncronamente mediante microservicios.
3. **Base de Datos Compartida:** Que tanto Django como FastAPI se conecten exactamente a la misma instancia de PostgreSQL.

## Decisión
Adoptamos la opción 3: **Base de Datos Compartida**. 
*(Nota: Kafka sí se utilizará en el proyecto, pero exclusivamente para manejar tareas pesadas en segundo plano como UGC, no para sincronizar datos vitales transaccionales entre frameworks).*

## Justificación (Análisis de Viabilidad)

La elección se fundamenta respondiendo a la rúbrica del proyecto:

1. **Complejidad de la interactividad de datos:** La plataforma requiere interactividad en tiempo real (inmediatez) entre la acción de un usuario agendando una cita y la visualización de la misma por parte de los administradores. Las colas asíncronas introducirían consistencia eventual indeseada en datos vitales de salud.
2. **Experiencia del equipo:** El equipo tiene experiencia robusta manejando bloqueos (locks) y control de concurrencia directamente a nivel de base de datos en PostgreSQL, permitiendo gestionar de forma segura múltiples clientes conectándose al mismo servidor.
3. **Nivel de rendimiento y Consistencia:** Se necesita consistencia fuerte (ACID). El acceso directo a una misma base de datos elimina la latencia de capa de red entre microservicios, asegurando tiempos de respuesta inmediatos.
4. **Huella de infraestructura (Bundle aceptable):** Mantener múltiples clústeres de bases de datos relacionales duplicaría la carga de memoria requerida por Docker. Una sola base PostgreSQL consolida los recursos manteniendo la ligereza de la infraestructura local.
5. **Relación Costo/Beneficio (Sprint de 4 semanas):** Sincronizar bases de datos separadas vía Kafka requiere lidiar con compensaciones, fallos de red y monitoreo exhaustivo, lo cual excedería las 4 semanas. La Base de Datos Compartida con una regla clara ("Django crea la tabla, FastAPI la lee") es pragmática y la opción más rentable en tiempo.

## Consecuencias
- **Positivas:** Diseño simple. Reflejo de datos al instante entre plataformas.
- **Negativas:** Los sistemas quedan muy acoplados a la estructura. Si se cambia un nombre de columna en Django, debe ajustarse manualmente en FastAPI. Se mitigará esto mediante pruebas automatizadas rigurosas.