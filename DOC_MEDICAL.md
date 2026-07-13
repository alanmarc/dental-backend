# Medical SaaS — Documentación técnica de arquitectura

**Stack:** AdonisJS 6 · Lucid ORM · PostgreSQL · Bouncer (autorización) · VineJS (validación) · Japa (testing)  
**Última actualización:** Julio 2026

Este documento describe la arquitectura, las decisiones de diseño y las convenciones establecidas en el proyecto. Su propósito es que cualquier módulo general o específico de especialidad que se agregue en el futuro pueda construirse sobre las mismas bases, sin reinventar patrones ni reintroducir problemas ya resueltos.

---

## 1. Resumen del sistema

**Medical SaaS** es un backend SaaS multi-tenant para la gestión integral de clínicas, hospitales y centros de salud multisede. Cada organización o red de clínicas es un tenant independiente (**Hospital**) que puede tener una o más sucursales (**Branch**). El sistema controla el acceso mediante roles y permisos granulares, aislando por completo los datos de cada organización del resto, salvo para el rol de alcance global (`super_admin`).

### Jerarquía de dominio

```text
Hospital (tenant)
└─ Branch (sucursal, N por hospital)
   ├─ User (staff: admin, doctor, assistant — N por sucursal)
   └─ Patient (paciente, N por sucursal)
      └─ Appointment (cita, belongsTo Patient + User/doctor + Branch)
         ├─ MedicalHistory (historial clínico, 0..1 por cita, opcional)
         └─ Prescription (receta, 0..N, opcionalmente ligada a Appointment y/o MedicalHistory)
            └─ PrescriptionItem (medicamento/ítem, N por receta)
```

`branch_id` es la fuente de verdad para determinar a qué sucursal pertenece un registro. El `hospital_id` nunca se guarda directamente en usuarios ni en registros clínicos; siempre se deriva transitivamente vía `registro.branch.hospitalId`. Esto evita una columna redundante que podría desincronizarse si un usuario o recurso cambia de sucursal.

---

## 2. Esquema de base de datos

### Tablas principales

| Tabla | Notas clave |
| :--- | :--- |
| **`hospitals`** | Tenant raíz. Incluye `deleted_at` (soft-delete). |
| **`branches`** | `hospital_id` `NOT NULL`, `RESTRICT`. Incluye `deleted_at`. |
| **`roles`** | `super_admin`, `admin`, `doctor`, `assistant`, `patient`. |
| **`permissions`** | Catálogo plano de strings (`recurso.accion[.alcance]`). |
| **`role_permission`**| Pivote. `role_id`/`permission_id` `NOT NULL`, `unique(['role_id','permission_id'])`, `CASCADE`. |
| **`users`** | `role_id` `NOT NULL RESTRICT`, `branch_id` `NOT NULL RESTRICT`. Incluye `deleted_at`. |
| **`auth_access_tokens`**| `tokenable_id` → `users`, `CASCADE` (el token muere con el usuario). Índice en hash (se consulta en cada request autenticado). |
| **`patients`** | `user_id` (médico de cabecera/asignado) `NOT NULL RESTRICT`, `branch_id` `NOT NULL RESTRICT`. Incluye `deleted_at`. |
| **`appointments`** | `patient_id`, `user_id` (médico), `branch_id` — todos `NOT NULL RESTRICT`. Incluye `deleted_at`. |
| **`medical_histories`**| `user_id`, `patient_id`, `branch_id` `NOT NULL RESTRICT`; `appointment_id` `nullable RESTRICT`. Incluye `deleted_at`. |
| **`prescriptions`** | `user_id`, `patient_id`, `branch_id` `NOT NULL RESTRICT`; `appointment_id` y `medical_history_id` `nullable RESTRICT`. Incluye `deleted_at`. |
| **`prescription_items`**| `prescription_id` `NOT NULL CASCADE` (un ítem no existe sin su receta padre). |
| *Módulos Futuros (Ej. `dental_odontograms`)* | *Extensiones específicas vinculadas a `patient_id` o `medical_history_id` con FK `NOT NULL RESTRICT` y su respectivo `branch_id`*. |

### Regla de cascadas
Todas las llaves foráneas (FK) entre entidades independientes usan **`RESTRICT`**, nunca `CASCADE`. Un borrado físico en la base de datos (poco frecuente, ya que el sistema opera con soft-delete) nunca debe arrastrar en cadena datos clínicos de niveles inferiores. 

Las únicas dos excepciones intencionales son:
1. `auth_access_tokens`: Un token de acceso no tiene sentido sin su usuario.
2. `prescription_items`: Un medicamento o renglón no tiene sentido sin su receta médica.

### Índices de rendimiento
PostgreSQL no indexa automáticamente columnas de FK. Se agregaron índices explícitos en las columnas de mayor tráfico:
* `auth_access_tokens.hash`: Se consulta en cada request autenticado.
* `(branch_id, deleted_at)` en las tablas `branches`, `users`, `patients`, `appointments`, `medical_histories` y `prescriptions`: Patrón base de todo el scoping multi-tenant.
* `appointments(user_id, date_time)`: Usado por la validación de disponibilidad y colisión de citas de los médicos.
* FKs sueltas (`patient_id`, `user_id`, `appointment_id`, `medical_history_id`, `prescription_id`) en las tablas donde se filtran individualmente.

---

## 3. Sistema de autenticación

* **Guard:** `tokensGuard` de `@adonisjs/auth/access_tokens`, provisto vía `DbAccessTokensProvider.forModel(User)`.
* La emisión de tokens utiliza exclusivamente `User.accessTokens.create(user, abilities, options)`. Nunca se debe utilizar `ctx.auth.use('api').authenticateAsClient(...)` en producción, ya que es un método pensado únicamente para simular autenticación en la suite de pruebas (`loginAs` de Japa).
* El flujo de login excluye explícitamente usuarios soft-eliminados (`whereNull('deletedAt')` en la query de autenticación); un usuario dado de baja no puede generar nuevos tokens.
* Las contraseñas se hashean automáticamente a través del mixin `withAuthFinder` del modelo `User` (utilizando scrypt). **Nunca** se debe pre-hashear manualmente una contraseña antes de enviarla a `User.create()` o `User.merge()`; el hook integrado ya se encarga de ello y duplicar el proceso produciría un hash inservible.

---

## 4. Sistema de permisos

### Convención de nombres
`recurso.accion[.alcance]` (por ejemplo: `patients.view`, `patients.create`, `patients.update.own`, `patients.update.any`).

### Patrón `own` / `any` (Convención estándar del proyecto)
Para todo módulo con un "dueño natural" (el médico que atiende al paciente, que agenda la cita, que registra la historia clínica o emite la receta):
* **`X.action.own`:** El actor solo puede operar sobre registros donde `target.userId === actor.id`.
* **`X.action.any`:** El actor puede operar sobre cualquier registro dentro de su propio hospital (organización). **Nunca es global**, salvo que el actor posea además un alcance explícito de super-administración.
* **`X.view` / `X.view.any`:** Mismo patrón pero aplicado a listados: `view` (sin sufijo) implica "de mi hospital", mientras que `view.any` implica alcance global cross-tenant.

`users` es la única excepción: No cuenta con variantes `own`/`any`. En su lugar, `users.update/delete/restore` son permisos planos que siempre comparan el hospital del actor contra el hospital del target, logrando el mismo efecto de scoping sin requerir la variante `.own` (la autoedición y asignación de roles se valida por reglas de negocio en el controlador).

> **¡Importante! `.any` nunca es sinónimo de "global"**
> En toda policy con alcance `.any`, la validación correcta debe verificar que pertenezcan a la misma organización:
> ```typescript
> if (actor.hasPermission('X.action.any')) {
>   return actor.branch.hospitalId === target.branch.hospitalId
> }
> ```
> Nunca se debe retornar `true` a secas. Si un módulo nuevo (médico general o extensión de especialidad) agrega su propia policy, esta comparación es obligatoria para resguardar el multi-tenancy.

### Roles y su alcance

| Rol | Alcance |
| :--- | :--- |
| **`super_admin`** | **Global.** Único rol capacitado para gestionar la tabla `hospitals`. Recibe todos los permisos del sistema, incluidos los `.any` de cada módulo y los `.view.any` explícitos. |
| **`admin`** | **Limitado a su propio hospital.** Gestiona las sucursales (`branches` con alcance `.own`), usuarios, y posee alcance `.any` (= "de mi hospital") sobre `patients`, `appointments`, `medical_histories` y `prescriptions`. |
| **`doctor`** | **Limitado a lo propio (`.own`).** Opera sobre `patients`, `appointments`, `medical_histories` y `prescriptions` que él mismo atiende, agenda o emite. |
| **`assistant`**| **Alcance operativo reducido.** Visualiza y crea pacientes/citas dentro de su sucursal, sin permisos de eliminación ni acceso a la gestión de prescripciones o historias clínicas. |
| **`patient`** | **Solo consultas propias.** Limitado a `appointments.view` para visualizar exclusivamente sus citas asignadas. |

### Regla de oro para permisos de campos sensibles
Autorizar la edición de un recurso no implica autorizar la modificación de un campo crítico de identidad dentro de él.
* `users.assign_role`: Permiso separado de `users.update`, requerido únicamente si el payload modifica el `roleId` respecto al valor actual en la base de datos.
* `branches`: El controlador valida que un `hospitalId` entrante en el body coincida con el hospital del actor si este no posee capacidades `.any`.
* Si un módulo nuevo o futuro cuenta con un campo que altere la pertenencia de un recurso (a otro médico, otra sucursal u otra organización), se debe comparar el valor actual en la base de datos contra el valor nuevo del payload y exigir un permiso específico para dicho cambio.

---

## 5. Multi-tenancy: Cómo se aplica el scoping

### Middleware
El `LoadPermissionsMiddleware` (configurado en toda ruta autenticada mediante `middleware.loadPermissions()`) precarga el `role.permissions` y la sucursal (`branch`) del actor en cada request. Esto garantiza que `actor.hasPermission(...)` y `actor.branch.hospitalId` se encuentren disponibles en memoria sin ejecutar queries redundantes dentro de las policies.

### En listados (`index`)
El scoping vive en el controlador, no en la policy (esta última solo autoriza un valor booleano de acceso). El controlador restringe la query:
```typescript
const query = Model.query().whereNull('deleted_at')

if (!actor.hasPermission('X.view.any')) {
  // getBranchIdsForActorHospital resuelve todas las sucursales de la organización del actor
  const branchIds = await getBranchIdsForActorHospital(actor) // app/services/scope_service.ts
  query.whereIn('branch_id', branchIds)
}
```
Cualquier módulo general o específico que se añada en el futuro que incorpore listados debe consumir el helper `getBranchIdsForActorHospital` para mantener la coherencia del aislamiento. *(Excepción: El modelo Branch tiene `hospital_id` directo, por lo que su index filtra mediante `where('hospital_id', actor.branch.hospitalId)`).*

### En operaciones de escritura (update, delete, restore)
El scoping se procesa en la policy, contrastando la organización del actor frente a la del recurso objetivo (`target`). Patrón obligatorio en los controladores:
```typescript
const target = await Model.query()
  .where('id', ctx.params.id)
  .preload('branch') // Evita la query N+1 dentro de la policy
  .firstOrFail()

await ctx.bouncer.with(ModelPolicy).authorize('update', target)
```

---

## 6. Patrones de controlador (Obligatorios en todo módulo nuevo)

* **Orden estricto de operaciones:** `findOrFail` (con `preload('branch')`) → `authorize(accion, target)` → Validar payload → Aplicar cambios en BD. Nunca se debe autorizar antes de recuperar el recurso real, ni pasar parámetros crudos (`ctx.params.id`) a una policy.
* **Respuestas unificadas:** Utilizar `ApiResponse.success(ctx, resource.toJSON(), mensaje, status)` para recursos individuales. No estructurar como `resource.toJSON().data`, ya que la propiedad `.data` pertenece exclusivamente a los resultados paginados (`paginate()`).
* **Manejo global de errores:** Implementar bloques `try/catch` delegando el error a `handleControllerError(ctx, error)` (`app/utils/error_handler.ts`). Esta utilidad centralizada ya mapea y responde de forma adecuada a excepciones de tipo `E_AUTHORIZATION_FAILURE` (403), `E_VALIDATION_ERROR` (422) y `E_ROW_NOT_FOUND` (404).
* **Coherencia de sucursal en datos clínicos:** Cuando un recurso vincula a un médico y a un paciente (ej. appointments, prescriptions), el `branch_id` del nuevo registro se hereda siempre del médico, nunca del cuerpo del request. Adicionalmente, se debe validar en el controlador que `patient.branchId === doctor.branchId` antes de persistir, arrojando un error 422 en caso de incongruencia.
* **Transacciones atómicas:** En flujos de creación compuesta (como una receta `Prescription` junto a sus renglones `PrescriptionItem`), es obligatorio usar `db.transaction()` con `commit()` y `rollback()` explícitos para evitar la presencia de registros huérfanos ante fallos intermedios.
* **Manejo de Soft-delete:** Asignar `deletedAt = DateTime.utc()` para bajas y `deletedAt = null` para restauraciones. Todas las consultas de lectura comunes deben omitir registros eliminados mediante `whereNull('deleted_at')`.

---

## 7. Validadores (VineJS)

* **Aislamiento por acción:** Se define un validador independiente por acción (`store_x_validator.ts`, `update_x_validator.ts`). No deben compartir esquemas completos directamente, dado que los campos requeridos y opcionales varían drásticamente entre la creación y la actualización.
* **Exclusión de campos calculados:** Los parámetros que el sistema calcula de forma interna (como el `branch_id` en registros clínicos) no deben formar parte del esquema del validador. Si un campo es expuesto pero ignorado, la firma de la API pierde claridad y veracidad.
* **Integridad en capa de validación:** Las comprobaciones de existencia y unicidad (`.exists()`, `.unique()`) se resuelven mediante consultas asíncronas directas contra la base de datos dentro del propio validador.
* **Validación de roles:** Si un parámetro requiere una condición de rol (por ejemplo, asegurar que el `user_id` en una cita corresponda efectivamente a un usuario con rol de médico), se debe validar mediante un método `.exists()` que realice un join contra la tabla `roles` filtrando por `roles.name`.

---

## 8. Testing

### Estructura de pruebas
* `tests/unit/policies/*.spec.ts`: Validaciones aisladas de las reglas de autorización, sin incurrir en peticiones HTTP.
* `tests/functional/{modulo}/{store,index,update,delete_restore}.spec.ts`: Ciclos completos transaccionales sobre la API HTTP.
* `tests/helpers/permissions.ts`: Expone utilidades clave como `createUserWithPermissions(permissions[], branchId?)` y `createBranch(hospitalId?)`, facilitando la simulación de actores con permisos minuciosos en entornos multi-tenant distribuidos.

### Configuración del entorno
* Base de datos de pruebas aislada, administrada por `.env.test`.
* En `tests/bootstrap.ts`: Se ejecutan las migraciones (`testUtils.db().migrate()`) en la etapa de setup, y se envuelve cada prueba en una transacción global (`testUtils.db().withGlobalTransaction()`) para garantizar un rollback automático sin necesidad de limpiar tablas manualmente.

### Casos de prueba obligatorios para nuevos módulos (Patrón own/any)
Para operaciones de escritura (`update`, `delete`, `restore`):
* `403 Forbidden` al carecer de permisos.
* `200 OK` al poseer permiso `.own` sobre un recurso propio.
* `403 Forbidden` al poseer permiso `.own` sobre un recurso de otro propietario.
* `200 OK` al poseer permiso `.any` sobre un recurso de otra sucursal de su mismo hospital.
* `403 Forbidden` al poseer permiso `.any` sobre un recurso perteneciente a otro hospital.

Para listados (`index`):
* `403 Forbidden` al carecer del permiso `X.view`.
* `200 OK` al contar con `X.view`, comprobando que solo se listen registros del hospital del actor.
* `200 OK` al contar con `X.view.any`, validando la lectura de todos los hospitales del sistema (exclusivo `super_admin`).
* `200 OK` que verifique la exclusión explícita de elementos con soft-delete.

---

## 9. Convenciones de nombres

* **Singularidad en backend:** Carpetas, archivos y clases deben declararse consistentemente en singular (`medical_history`, `prescription`). Las tablas en la base de datos se declaran en su plural correspondiente (`medical_histories`, `prescriptions`).
* **Claridad en unidades:** Las columnas con métricas o valores de tiempo ambiguos deben explicitar su unidad en el nombre. Por ejemplo, `duration_days` en ítems de recetas médicas para diferenciarlo netamente de `appointments.duration` (medido en minutos).
* **Consistencia de alias:** Importaciones resueltas mediante alias absolutos configurados en el `package.json` (`#models/*`, `#policies/*`, `#validators/*`, `#services/*`, `#utils/*`). Quedan prohibidas las rutas relativas profundas (`../../../../utils/`).

---

## 10. Checklist para agregar un nuevo módulo (General o de Especialidad)

- [ ] **Migración:** Incluir `branch_id NOT NULL RESTRICT`, `deleted_at` nullable, índices compuestos (`branch_id`, `deleted_at`) y las llaves foráneas correspondientes con `RESTRICT`.
- [ ] **Modelo:** Definir las relaciones `belongsTo` a sus padres naturales (`User`, `Patient`, `Branch`), evaluando la inversa (`hasMany`) en los padres para estrategias de `.preload()`.
- [ ] **Registro de permisos:** Actualizar `app/constants/permissions.ts` con la estructura de permisos del nuevo recurso.
- [ ] **Policy:** Implementar las políticas asegurando que la evaluación `.any` contraste estrictamente los identificadores de los hospitales.
- [ ] **Seeders:** Mapear los nuevos privilegios a los roles existentes resolviendo siempre por nombre (`Role.findByOrFail('name', ...)`), nunca mediante IDs estáticos.
- [ ] **Validators:** Diseñar esquemas independientes para store y update removiendo variables de cálculo interno del backend.
- [ ] **Controlador:** Aplicar la secuencia de recuperación, pre-carga de contexto de sucursal, autorización, validación, manejo de errores unificado con `handleControllerError` y alcance en listados vía `getBranchIdsForActorHospital`.
- [ ] **Rutas:** Proteger los endpoints con los middlewares de autenticación y carga de permisos (`middleware.auth()`, `middleware.loadPermissions()`).
- [ ] **Tests:** Completar la suite con los escenarios obligatorios explicados en la sección de testing.
- [ ] **Verificación:** Confirmar la integridad ejecutando `node ace test unit && node ace test functional` asegurando cero regresiones en el core del sistema.

---

## 11. Decisiones de negocio pendientes (A resolver cuando se retomen)

* **Reasignación de médico en appointments/prescriptions:** Hoy en día, un médico con el permiso `.own` que edita una cita o receta propia y modifica el `userId` para asignársela a otro doctor, técnicamente no requiere una autorización adicional para dicha transferencia en sí (la policy valida el estado del recurso justo antes del cambio). Si el frontend llegase a permitir "cambiar el doctor de esta cita de forma abierta", se debería estructurar una habilidad `reassign` separada, análoga al comportamiento de `users.assign_role`.
* **Purga real de soft-deletes:** El sistema nunca borra físicamente nada en sus flujos normales; todo se archiva y oculta vía `deleted_at`. No existe aún un mecanismo automatizado (como un comando de Ace o un Job programado) para purgar permanentemente registros históricos sumamente antiguos. Es una decisión consciente del negocio pendiente de definir cuándo y bajo qué criterios de retención aplicarla.
* **patient.note vs notes:** Existe una inconsistencia menor de nomenclatura sin impacto funcional (`patients.note` en singular frente al resto de las tablas que emplean `notes` en plural). Queda pendiente de unificación cosmética para cuando se realice un refactor o mantenimiento sobre el módulo de pacientes.

---

## 12. Estado actual (Referencia rápida)

* **Módulos completados con el patrón estructurado:** `hospitals`, `branches`, `users`, `patients`, `appointments`, `medical_histories`, `prescriptions` y `prescription_items` (como entidad dependiente/hijo).
* **Suite de pruebas activa:** 192 casos ejecutados de manera exitosa cubriendo el espectro unitario (policies) y funcional (HTTP completo), operando con cero regresiones conocidas hasta la fecha.