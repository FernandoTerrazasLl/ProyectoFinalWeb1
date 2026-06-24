# ProyectoFinalWeb1

Aplicacion de Telemedicina psicologica

## Figma

https://www.figma.com/design/HIcyIeiTdjp0YQahtMmy6z/Untitled?node-id=0-1&t=o3nOzy2xUuygXYAr-1

## Diagramas

### Diagrama secuencia Modulo Encuesta

<img width="804" height="624" alt="Image" src="https://github.com/user-attachments/assets/31d3b67e-7895-44f5-a7a0-ec75c7e299e5" />

### Diagrama de Secuencia: Transición al Home Filtrado por Evaluacion

<img width="858" height="496" alt="Image" src="https://github.com/user-attachments/assets/efe445ae-f58d-49bd-8166-7dbc53ef95bb" />

### Diagrama de Actividad: Reserva de Citas

<img width="476" height="672" alt="Image" src="https://github.com/user-attachments/assets/f90f4731-0d35-4bcd-8f05-11f1f8c95fd1" />

### Diagrama de Estados: Ciclo de Vida de una Cita

<img width="894" height="455" alt="Image" src="https://github.com/user-attachments/assets/b0be70c7-1efd-4134-a36f-367d83aa1199" />

### Diagrama C1

<img width="1105" height="628" alt="image" src="https://github.com/user-attachments/assets/bae808dc-4677-4735-8370-e95db48caa8d" />

### Diagrama C2

<img width="776" height="836" alt="image" src="https://github.com/user-attachments/assets/6a00adc2-ddfc-4fea-b2a3-5a1095a044c7" />

### Diagrama C3

<img width="1084" height="873" alt="image" src="https://github.com/user-attachments/assets/68684937-cea2-4c77-8713-615b77238e01" />

### Diagrama ER

<img width="722" height="874" alt="image" src="https://github.com/user-attachments/assets/c5732adc-82cd-4ced-ab95-8abec9beca5a" />

### Diagrama Despliegue

<img width="1271" height="963" alt="image" src="https://github.com/user-attachments/assets/22b82727-2e7d-4621-a493-c1428fba01f1" />

## Tabla de Trazabilidad

| ID Historia | Descripción Corta | Hash Commit | Autor | Fecha | Endpoint Backend | Pantalla Frontend | Test de Integración (`test_*.py`) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **US-AUTH-01** | Registro de nuevo paciente | `913c15f` | A. Ramirez | 2026-06-21 | `POST /api/auth/register` | `/signup` (Registro) | `test_auth.py::test_register_patient` |
| **US-AUTH-02** | Inicio de sesión local | `cd2fb5a` | fernando | 2026-06-23 | `POST /api/auth/login` | `/auth` (Login) | `test_auth.py::test_login_patient_success` |
| **US-AUTH-03** | Ingreso rápido con Google | `0932767` | fernando | 2026-06-23 | `POST /api/auth/google` | `/auth` (Botón Google) | `test_auth.py::test_google_login` |
| **US-API-01** | Exploración del catálogo | `8fc3345` | A. Ramirez | 2026-06-23 | `GET /api/psychologists` | `/directory` (Home) | `test_catalog.py::test_get_psychologists` |
| **US-API-02** | Búsqueda por problema | `6cf6eaf` | A. Ramirez | 2026-06-23 | `GET /api/psychologists?search=` | `/directory` (Buscador) | `test_catalog.py::test_get_psychologists` |
| **US-API-03** | Aplicación de filtros | `883d669` | fernando | 2026-06-23 | `GET /api/psychologists?specialty=` | `/directory` (Sidebar) | `test_catalog.py::test_get_psychologists_with_filters` |
| **US-API-04** | Revisión perfil completo | `cc93250` | fernando | 2026-06-23 | `GET /api/psychologists/{id}` | `/provider-profile` | `test_catalog.py::test_get_psychologist_detail` |
| **US-ADM-01** | Integrar nuevos psicólogos | `c805161` | fernando | 2026-06-21 | Panel Django (`User`, `Profile`) | `/admin` (Django) | `providers/tests.py` |
| **US-ADM-02** | Retiro de profesionales | `070ca95` | fernando | 2026-06-23 | Panel Django (`is_active`) | `/admin` (Django) | `users/tests.py` |
| **US-ADM-03** | Org. tipos de terapias | `070ca95` | fernando | 2026-06-23 | Panel Django (`Specialty`) | `/admin` (Django) | `providers/tests.py` |
| **US-UGC-01** | Calificación de la atención | `8eafa3d` | fernando | 2026-06-23 | `POST /api/ugc/reviews` | `/patient-profile` | `test_ugc.py::test_create_review` |
| **US-UGC-02** | Consulta prestigio (Opiniones)| `92556fa` | A. Ramirez | 2026-06-22 | `GET /api/psychologists/{id}` | `/provider-profile` | `test_catalog.py::test_get_psychologist_detail` |
| **US-TRG-01** | Cuestionario visual | `6cf6eaf` | A. Ramirez | 2026-06-23 | N/A (Lógica de Frontend) | `/triage` (Cuestionario) | N/A |
| **US-TRG-02** | Abandono de evaluación | `b957137` | fernando | 2026-06-23 | N/A (Lógica de Frontend) | `/triage` (Botón Salir) | N/A |
| **US-TRG-03** | Análisis de respuestas | `a448a8c` | fernando | 2026-06-21 | `POST /api/triage/evaluate` | `/triage` (Sumisión) | `test_triage.py::test_evaluate_triage` |
| **US-TRG-04** | Presentación recomendación | `b957137` | fernando | 2026-06-23 | `POST /api/triage/evaluate` | `/triage` (Popup Results)| `test_triage.py::test_evaluate_triage` |
| **US-BKG-01** | Disponibilidad horaria | `0868f1a` | A. Ramirez | 2026-06-23 | `GET /api/appointments/availability`| `/provider-profile` | `test_appointments.py::test_get_availability` |
| **US-BKG-02** | Confirmación de reserva | `c947318` | A. Ramirez | 2026-06-24 | `POST /api/appointments` | `/provider-profile` | `test_appointments.py::test_create_appointment` |
| **US-BKG-03** | Vis. día laboral psicólogo | `11a9617` | A. Ramirez | 2026-06-22 | `GET /api/appointments/schedule` | `/provider-schedule` | `test_appointments.py::test_get_provider_schedule` |
| **US-BKG-04** | Revisión expediente paciente | `e774644` | A. Ramirez | 2026-06-23 | `GET /api/appointments/schedule` | `/provider-schedule` | `test_appointments.py::test_get_provider_schedule` |
| **US-BKG-05** | Edición perfil psicólogo | `5a75923` | fernando | 2026-06-23 | `PUT /api/me/provider-profile` | `/provider-settings` | `test_users.py::test_update_provider_profile` |

## Integrantes

- Fernando Terrazas Llanos
- Alejandro Ramirez Vallejos
