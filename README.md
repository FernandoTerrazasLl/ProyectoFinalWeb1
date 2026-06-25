# Curamente

## Prerrequisitos

- Docker Desktop o Docker Engine con Docker Compose.
- Git.
- Node.js y npm si quiere ejecutar los clientes frontend fuera de Docker.
- Python 3.12+ si quiere ejecutar backend o admin fuera de Docker.

## Setup

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1.git
   cd ProyectoFinalWeb1
   ```

2. Crear el archivo de entorno:

   ```bash
   cp .env.example .env
   ```

3. Levantar todo el sistema:

   ```bash
   docker compose up --build
   ```

4. Detener los servicios:

   ```bash
   docker compose down
   ```

## Rutas

| Ruta | Descripción |
| :--- | :--- |
| [http://localhost](http://localhost) | Frontend principal TypeScript + Handlebars |
| [http://localhost/directory](http://localhost/directory) | Directorio público de psicólogos |
| [http://localhost/react](http://localhost/react) | Frontend migrado a React |
| [http://localhost/admin](http://localhost/admin) | Panel administrativo Django |
| [http://localhost/api/docs](http://localhost/api/docs) | Swagger / OpenAPI de FastAPI |
| [http://localhost/api/openapi.json](http://localhost/api/openapi.json) | Contrato OpenAPI en JSON |

## Deployment

[https://fernandotll.dev/](https://fernandotll.dev/)

## Claves de demo

La contraseña de las cuentas es:

```text
password
```

| Rol | Usuario |
| :--- | :--- |
| Admin | `admin@test.com` |
| Psicólogo A | `provA@test.com` |
| Psicólogo B | `provB@test.com` |
| Psicólogo C | `provC@test.com` |

## Links de entrega

- [Repositorio](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1)
- [Historias de usuario](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/issues)
- [Tabla de trazabilidad](#tabla-de-trazabilidad)
- [ADRs](docs/adr)
- [Kanban](https://github.com/users/FernandoTerrazasLl/projects/9)
- [Figma](https://www.figma.com/design/HIcyIeiTdjp0YQahtMmy6z/Final-Web-1?node-id=0-1&m=dev)
- [Diapositivas](diapositivas.html)

## Arquitectura

CuraMente usa una arquitectura de monolito modular desplegada con Docker Compose y expuesta por Nginx. Django tiene el panel administrativo, FastAPI expone la API pública, Auth, UGC, citas y triage, y PostgreSQL tiene los datos transaccionales. Redis, Elasticsearch, MongoDB, Kafka y ClickHouse cubren cache, búsqueda, eventos UGC y analítica.

El frontend está hecho con TypeScript, Vite, Handlebars components, arquitectura FSD, BEM. La carpeta `code/react` contiene la version en React como un cliente separado.

Patrones de diseño usados:

| Patrón | Ubicación | Uso |
| :--- | :--- | :--- |
| Observer | `code/frontend/src/shared/lib/store/Store.ts`, `code/react/src/shared/lib/store/Store.ts` | Notifica cambios de estado a componentes suscritos como sesión, toast y resultado de triage. |
| Singleton | `code/frontend/src/shared/api/http.ts`, `code/frontend/src/shared/lib/router/routerInstance.ts`, `code/react/src/shared/api/http.ts`, `code/react/src/shared/lib/router/routerInstance.ts` | Comparte una única instancia del cliente HTTP y del router en el frontend. |
| Facade | `code/frontend/src/shared/api/HttpClient.ts`, `code/react/src/shared/api/HttpClient.ts` | Centraliza `fetch`, tokens JWT, refresh tokens y manejo de errores HTTP. |
| Adapter | `code/frontend/src/entities/*/api/to*.ts`, `code/react/src/entities/*/api/to*.ts` | Convierte respuestas del backend a modelos del frontend. |

Las decisiones técnicas están documentadas en [docs/adr](docs/adr).

## Frontends

### Frontend TypeScript + Handlebars

```bash
cd code/frontend
npm install
npm run dev
npm run validate
npm run test:coverage
```

### Frontend React

```bash
cd code/react
npm install
npm run dev
npm run validate
npm run test:coverage
```

## Docker compose

Los servicios se levantan con:

```bash
docker compose up --build
```

El reverse proxy expone el sistema en `http://localhost`, redirige `/api/*` al backend FastAPI, `/admin/*` al panel Django, `/react/*` al cliente React y `/` al cliente principal.

## CI/CD

Los comandos de validación del frontend son:

```bash
cd code/frontend
npm run validate
npm run test:coverage
```

```bash
cd code/react
npm run validate
npm run test:coverage
```

Los comandos del backend son los mismos que ejecuta `backend-ci.yml` dentro de Docker:

```bash
docker compose up -d postgres redis elasticsearch mongodb kafka clickhouse backend admin
docker compose exec -T backend sh -c "lint-imports --no-cache"
docker compose exec -T admin sh -c "lint-imports --no-cache"
docker compose exec -T backend sh -c "COVERAGE_FILE=/tmp/.coverage pytest --junitxml=/tmp/pytest-report.xml --cov=src --cov-report=html:/tmp/htmlcov tests/"
```

Al hacer `git push` a `main` o abrir un pull request con cambios, GitHub Actions ejecuta las pruebas y genera reportes de cobertura como artifacts.

| Workflow | Link | Qué ejecuta |
| :--- | :--- | :--- |
| Actions | [GitHub Actions](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/actions) | Historial general de ejecuciones. |
| Backend CI | [backend-ci.yml](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/actions/workflows/backend-ci.yml) | `import-linter`, `pytest` y artifact `backend-coverage-report`. |
| Frontend CI | [frontend-ci.yml](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/actions/workflows/frontend-ci.yml) | `npm run validate`, `npm run test:coverage` y artifact `coverage-html`. |
| React CI | [react-ci.yml](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/actions/workflows/react-ci.yml) | `npm run validate`, `npm run test:coverage` y artifact `react-coverage-html`. |

## Diagramas

### Diagrama secuencia Módulo Encuesta

<img width="804" height="624" alt="Diagrama secuencia Módulo Encuesta" src="https://github.com/user-attachments/assets/31d3b67e-7895-44f5-a7a0-ec75c7e299e5" />

### Diagrama de Secuencia: Transición al Home Filtrado por Evaluación

<img width="858" height="496" alt="Diagrama de secuencia de transición al home filtrado" src="https://github.com/user-attachments/assets/efe445ae-f58d-49bd-8166-7dbc53ef95bb" />

### Diagrama de Actividad: Reserva de Citas

<img width="476" height="672" alt="Diagrama de actividad de reserva de citas" src="https://github.com/user-attachments/assets/f90f4731-0d35-4bcd-8f05-11f1f8c95fd1" />

### Diagrama de Estados: Ciclo de Vida de una Cita

<img width="894" height="455" alt="Diagrama de estados del ciclo de vida de una cita" src="https://github.com/user-attachments/assets/b0be70c7-1efd-4134-a36f-367d83aa1199" />

### Diagrama C1

<img width="1105" height="628" alt="Diagrama C1" src="https://github.com/user-attachments/assets/bae808dc-4677-4735-8370-e95db48caa8d" />

### Diagrama C2

<img width="776" height="836" alt="Diagrama C2" src="https://github.com/user-attachments/assets/6a00adc2-ddfc-4fea-b2a3-5a1095a044c7" />

### Diagrama C3

<img width="1084" height="873" alt="Diagrama C3" src="https://github.com/user-attachments/assets/68684937-cea2-4c77-8713-615b77238e01" />

### Diagrama ER

<img width="722" height="874" alt="Diagrama ER" src="https://github.com/user-attachments/assets/c5732adc-82cd-4ced-ab95-8abec9beca5a" />

### Diagrama Despliegue

<img width="1271" height="963" alt="Diagrama de despliegue" src="https://github.com/user-attachments/assets/22b82727-2e7d-4621-a493-c1428fba01f1" />

## Tabla de trazabilidad

| ID Historia | Descripción Corta | Commit | Autor | Fecha | Endpoint Backend | Pantalla Frontend | Test de Integración (`test_*.py`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **US-AUTH-01** | Registro de nuevo paciente | [913c15f](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/913c15fa8e5704f18d7774fa143ec2cf916604c4) | Alejandro Ramirez | 2026-06-21 | `POST /api/auth/register` | `/signup` | `test_auth.py::test_register_patient` |
| **US-AUTH-02** | Inicio de sesión local | [cd2fb5a](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/cd2fb5a8795d6232ce6d0af831040308a2e2ec11) | Fernando Terrazas | 2026-06-23 | `POST /api/auth/login` | `/auth` | `test_auth.py::test_login_patient_success` |
| **US-AUTH-03** | Ingreso rápido con Google | [0932767](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/09327675ec7264cef079480ff261234cc0899d37) | Fernando Terrazas | 2026-06-23 | `POST /api/auth/google` | `/auth` | `test_auth.py::test_google_login` |
| **US-API-01** | Exploración del catálogo | [8fc3345](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/8fc33456793ea1ff54e8aff599c5ca3228777d3d) | Alejandro Ramirez | 2026-06-23 | `GET /api/psychologists` | `/directory` | `test_catalog.py::test_get_psychologists` |
| **US-API-02** | Búsqueda por problema | [6cf6eaf](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/6cf6eaf921adeb4a28627fde7467a20c5070c40a) | Alejandro Ramirez | 2026-06-23 | `GET /api/psychologists?search=` | `/directory` | `test_catalog.py::test_get_psychologists` |
| **US-API-03** | Aplicación de filtros | [883d669](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/883d6697ea495b5b58b34e1c271973a7f1b6bf86) | Fernando Terrazas | 2026-06-23 | `GET /api/psychologists?specialty=` | `/directory` | `test_catalog.py::test_get_psychologists_with_filters` |
| **US-API-04** | Revisión perfil completo | [cc93250](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/cc93250271cd9b1e5079d09d873a329d4221272e) | Fernando Terrazas | 2026-06-23 | `GET /api/psychologists/{id}` | `/provider-profile` | `test_catalog.py::test_get_psychologist_detail` |
| **US-ADM-01** | Integrar nuevos psicólogos | [c805161](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/c8051618cbbb578a271d6701636aae4742f9c468) | Fernando Terrazas | 2026-06-21 | Panel Django (`User`, `Profile`) | `/admin` | `providers/tests.py` |
| **US-ADM-02** | Retiro de profesionales | [070ca95](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/070ca952b05b309561b1ce0a9771b8d0a7c4d79f) | Fernando Terrazas | 2026-06-23 | Panel Django (`is_active`) | `/admin` | `users/tests.py` |
| **US-ADM-03** | Organización de tipos de terapias | [070ca95](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/070ca952b05b309561b1ce0a9771b8d0a7c4d79f) | Fernando Terrazas | 2026-06-23 | Panel Django (`Specialty`) | `/admin` | `providers/tests.py` |
| **US-UGC-01** | Calificación de la atención | [8eafa3d](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/8eafa3d0495e61a3fe5f8be6ae5063ef4e669df9) | Fernando Terrazas | 2026-06-23 | `POST /api/ugc/reviews` | `/patient-profile` | `test_ugc.py::test_create_review` |
| **US-UGC-02** | Consulta de prestigio y opiniones | [92556fa](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/92556fa6f8b62b5dba1b79a384eaba1ff0bee980) | Alejandro Ramirez | 2026-06-22 | `GET /api/psychologists/{id}` | `/provider-profile` | `test_catalog.py::test_get_psychologist_detail` |
| **US-TRG-01** | Cuestionario visual | [6cf6eaf](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/6cf6eaf921adeb4a28627fde7467a20c5070c40a) | Alejandro Ramirez | 2026-06-23 | N/A (lógica frontend) | `/triage` | N/A |
| **US-TRG-02** | Abandono de evaluación | [b957137](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/b9571373bc45f3ea27106de3733925d0fabb3397) | Fernando Terrazas | 2026-06-23 | N/A (lógica frontend) | `/triage` | N/A |
| **US-TRG-03** | Análisis de respuestas | [a448a8c](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/a448a8c83d58310540419691b7c6f3ee19b3b192) | Fernando Terrazas | 2026-06-21 | `POST /api/triage/evaluate` | `/triage` | `test_triage.py::test_evaluate_triage` |
| **US-TRG-04** | Presentación de recomendación | [b957137](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/b9571373bc45f3ea27106de3733925d0fabb3397) | Fernando Terrazas | 2026-06-23 | `POST /api/triage/evaluate` | `/triage` | `test_triage.py::test_evaluate_triage` |
| **US-BKG-01** | Disponibilidad horaria | [0868f1a](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/0868f1a9548a07e2098043747b4ec7704f433216) | Alejandro Ramirez | 2026-06-23 | `GET /api/appointments/availability` | `/provider-profile` | `test_appointments.py::test_get_availability` |
| **US-BKG-02** | Confirmación de reserva | [c947318](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/c947318767cdeab879ea1ad0f0f213e31b9763fa) | Alejandro Ramirez | 2026-06-24 | `POST /api/appointments` | `/provider-profile` | `test_appointments.py::test_create_appointment` |
| **US-BKG-03** | Visualización del día laboral del psicólogo | [11a9617](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/11a9617c46beeb8a501cea32974686d0d958e13d) | Alejandro Ramirez | 2026-06-22 | `GET /api/appointments/schedule` | `/provider-schedule` | `test_appointments.py::test_get_provider_schedule` |
| **US-BKG-04** | Revisión de expediente paciente | [e774644](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/e77464493fba9aaf2399fbd4c0dce84a7f457216) | Alejandro Ramirez | 2026-06-23 | `GET /api/appointments/schedule` | `/provider-schedule` | `test_appointments.py::test_get_provider_schedule` |
| **US-BKG-05** | Edición perfil psicólogo | [5a75923](https://github.com/FernandoTerrazasLl/ProyectoFinalWeb1/commit/5a75923380b24c88810c6b9811ab1990382b4a19) | Fernando Terrazas | 2026-06-23 | `PUT /api/me/provider-profile` | `/provider-settings` | `test_users.py::test_update_provider_profile` |

## Integrantes

- Fernando Terrazas Llanos
- Alejandro Ramirez Vallejos
