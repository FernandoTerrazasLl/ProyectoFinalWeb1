# ADR-003: Delegación de Auth a FastAPI con Hashing Híbrido

**Estado:** Aceptada  
**Fecha:** 2026-06-20  

## Contexto
El Módulo de Autenticación (Auth) debe manejar la identidad, autorización por roles y refresh tokens (JWT). 
Django Admin utiliza la tabla nativa `auth_user` y su propio algoritmo de hashing de contraseñas (`pbkdf2_sha256`) junto con cookies de sesión. 
El Frontend (React/Vanilla) requiere una API moderna para autenticación basada en Tokens JWT.

Las opciones para manejar Auth eran:
1. Usar Django (con JWT tokens) para todo el Auth público y privado.
2. Construir Auth en FastAPI pero con tablas separadas de Django (desconectando a los usuarios del panel de administración).
3. **Módulo Auth en FastAPI mapeado a la tabla de Django.**

## Decisión
Se eligió la opción 3: **Construir el módulo Auth en FastAPI, compartiendo la tabla de usuarios con Django**.

## Justificación
Para lograr esta integración, se configuró la librería `passlib` en el entorno de FastAPI para que encripte y verifique las contraseñas utilizando exactamente el mismo algoritmo que Django (`django_pbkdf2_sha256`). 

## Consecuencias
- **Positivas:** El frontend se comunica exclusivamente con la API rápida de FastAPI para obtener sus tokens JWT. Sin embargo, los usuarios creados pueden ser gestionados, suspendidos o editados de forma nativa en el panel de Django Admin sin requerir sincronización externa.
- **Negativas:** Se requiere mantenimiento manual del algoritmo si Django decide cambiar su hashing en el futuro.
