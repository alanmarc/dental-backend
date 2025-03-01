import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: IndexPatientsController } = await import(
  '#controllers/patient/index_patients_controller'
)
const { default: StorePatientsController } = await import(
  '#controllers/patient/store_patients_controller'
)
const { default: UpdatePatientsController } = await import(
  '#controllers/patient/update_patients_controller'
)
const { default: SoftDeletePatientsController } = await import(
  '#controllers/patient/soft_delete_patients_controller'
)

const { default: RestorePatientsController } = await import(
  '#controllers/patient/restore_patients_controller'
)

const patients = (): void => {
  router
    .group(() => {
      router.post('/', [StorePatientsController]).as('store')
      router.get('/', [IndexPatientsController]).as('index')
      router.put('/:id', [UpdatePatientsController]).as('update')
      router.delete('/:id', [SoftDeletePatientsController]).as('delete')
      router.put('/:id/restore', [RestorePatientsController]).as('restore')
    })
    .prefix('/patients')
    .use(middleware.auth())
}

export default patients
