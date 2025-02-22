import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: IndexAppointmentsController } = await import(
  '#controllers/appointment/index_appointments_controller'
)
const { default: StoreAppointmentsController } = await import(
  '#controllers/appointment/store_appointments_controller'
)

const appointments = (): void => {
  router
    .group(() => {
      router.post('/', [StoreAppointmentsController]).as('appointments.store')
      router.get('/', [IndexAppointmentsController]).as('appointments.index')
    })
    .prefix('/appointments')
    .use(middleware.auth())
}

export default appointments
