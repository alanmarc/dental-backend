import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: IndexAppointmentsController } = await import(
  '#controllers/appointment/index_appointments_controller'
)
const { default: StoreAppointmentsController } = await import(
  '#controllers/appointment/store_appointments_controller'
)
const { default: UpdateAppointmentsController } = await import(
  '#controllers/appointment/update_appointments_controller'
)
const { default: SoftDeleteAppointmentsController } = await import(
  '#controllers/appointment/soft_delete_appointments_controller'
)
const { default: RestoreAppointmentsController } = await import(
  '#controllers/appointment/restore_appointments_controller'
)

const appointments = (): void => {
  router
    .group(() => {
      router.post('/', [StoreAppointmentsController]).as('store')
      router.get('/', [IndexAppointmentsController]).as('index')
      router.put('/:id', [UpdateAppointmentsController]).as('update')
      router.delete('/:id', [SoftDeleteAppointmentsController]).as('delete')
      router.put('/:id/restore', [RestoreAppointmentsController]).as('restore')
    })
    .prefix('/appointments')
    .use(middleware.auth())
}

export default appointments
