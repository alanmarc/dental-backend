import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: StoreMedicalHistoriesController } = await import(
  '#controllers/medical_history/store_medical_histories_controller'
)

const medicalHistory = (): void => {
  router
    .group(() => {
      router.post('/', [StoreMedicalHistoriesController]).as('store')
      // router.get('/', [IndexUsersController]).as('medical_history.index')
      // router.put('/:id', [UpdateUserController]).as('medical_history.update')
      // router.delete('/:id', [SoftDeleteUsersController]).as('medical_history.delete')
      // router.put('/:id/restore', [RestoreUsersController]).as('medical_history.restore')
    })
    .prefix('/medical_history')
    .use(middleware.auth())
}

export default medicalHistory
