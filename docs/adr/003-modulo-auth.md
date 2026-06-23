# ADR-003: Delegación de Auth a FastAPI con Hashing Híbrido

**Estado:** Aceptada  
**Fecha:** 2026-06-20  

## Contexto
El Módulo de Autenticación (Auth) debe manejar la identidad, autorización por roles y tokens JWT. Django Admin utiliza su modelo de usuario personalizado (`users_user`), su algoritmo de hashing nativo (`pbkdf2_sha256`) y sesiones mediante cookies. El Frontend requiere interactividad sin estado (Stateless) mediante JWT.

Las opciones eran:
1. Usar Django (con JWT plugins) para todo el Auth público y privado.
2. Construir Auth en FastAPI con tablas separadas (desconectando usuarios de la administración).
3. **Módulo Auth en FastAPI mapeado directamente al usuario y hashing de Django.**

## Decisión
Se eligió la opción 3: **Construir el módulo Auth en FastAPI, compartiendo la tabla de usuarios con Django e imitando su algoritmo de contraseñas.**

## Justificación (Análisis de Viabilidad)

La elección se fundamenta respondiendo a la rúbrica del proyecto:

1. **Complejidad de la interactividad de acceso:** Alta. Los pacientes requieren acceso rápido e interacciones persistentes (Auth JWT), mientras que los administradores requieren poder revocar, suspender o editar perfiles desde un panel nativo en tiempo real sin desincronización.
2. **Experiencia del equipo:** El equipo posee profundo conocimiento sobre la librería `passlib` de Python y algoritmos criptográficos, logrando implementar con éxito la encriptación `django_pbkdf2_sha256` dentro del ecosistema de FastAPI.
3. **Nivel de validación y Rendimiento Inicial:** La API pública exige validación de identidad (Autenticación) en milisegundos para no penalizar las lecturas del catálogo. FastAPI validando JWT en memoria cumple holgadamente con esta exigencia de rendimiento.
4. **Huella y peso del sistema (Bundle Backend):** La implementación de JWT Stateless (sin sesiones en base de datos) reduce drásticamente las operaciones I/O en PostgreSQL, manteniendo la "ligereza" del servidor al autorizar cientos de peticiones simultáneas.
5. **Relación Costo/Beneficio (Sprint de 4 semanas):** Programar todo un sistema de gestión de roles desde cero en FastAPI tomaría semanas. Reutilizar la tabla de Django y solo implementar un validador híbrido con `passlib` brinda seguridad de grado empresarial en apenas días de desarrollo.

## Consecuencias
- **Positivas:** El frontend goza de una API de Auth rapidísima. Además, si el administrador suspende a un usuario en Django, a dicho usuario se le revoca el acceso en la plataforma al instante al renovar el token.
- **Negativas:** Se requiere mantener sincronizada manualmente la configuración de cifrado en FastAPI si Django altera su esquema de hashing en versiones futuras.
