import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

// const { default: GetUsersController } = await import('#controllers/user/get_users_controller')
const { default: StorePatientsController } = await import(
  '#controllers/patient/store_patients_controller'
)

const patients = (): void => {
  router
    .group(() => {
      router.post('/', [StorePatientsController]).as('patients.store')
      // router.get('/', [GetUsersController]).as('patients.index')
    })
    .prefix('/patients')
    .use(middleware.auth())
}

export default patients
