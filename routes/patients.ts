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

const patients = (): void => {
  router
    .group(() => {
      router.post('/', [StorePatientsController]).as('patients.store')
      router.get('/', [IndexPatientsController]).as('patients.index')
      router.put('/:id', [UpdatePatientsController]).as('patients.update')
    })
    .prefix('/patients')
    .use(middleware.auth())
}

export default patients
