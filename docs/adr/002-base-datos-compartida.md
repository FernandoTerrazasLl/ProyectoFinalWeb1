# ADR-002: Base de Datos Compartida como Capa de Integración

**Estado:** Aceptada  
**Fecha:** 2026-06-20  

## Contexto
Teniendo en cuenta la decisión tomada en la [ADR-001] sobre la división en Django y FastAPI, surge el problema de cómo los módulos se comunican entre sí. Por ejemplo, si FastAPI registra un usuario, ¿cómo se entera el panel de Django?

Opciones:
1. Comunicación por API REST (Microservicios puros).
2. Bus de eventos (Kafka / RabbitMQ).
3. **Base de Datos Compartida:** Ambos frameworks apuntan al mismo servidor PostgreSQL y a la misma base de datos física.

## Decisión
Adoptamos la opción 3: **Base de Datos Compartida como Capa de Integración**.

## Justificación
Para mantener la naturaleza "Monolítica" exigida por la rúbrica y reducir la latencia de la red, los módulos se integran a nivel de persistencia.
- **Django** es el único responsable de ejecutar migraciones estructurales (DDL).
- **FastAPI** utiliza SQLAlchemy en modo de lectura/escritura (DML), mapeando sus modelos (ej. `__tablename__ = 'users_user'`) directamente a la estructura que generó Django.

## Consecuencias
- **Positivas:** Simplicidad arquitectónica extrema. Los administradores en Django ven reflejados instantáneamente los cambios que hacen los pacientes en FastAPI.
- **Negativas:** Fuerte acoplamiento a nivel de esquema (Shared Database Pattern). Un cambio en un modelo de Django puede romper FastAPI si no se actualiza SQLAlchemy sincronizadamente. Se mitiga mediante pruebas unitarias exhaustivas.
