import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: StoreMedicalHistoriesController } = await import(
  '#controllers/medical_history/store_medical_histories_controller'
)
const { default: IndexMedicalHistoriesController } = await import(
  '#controllers/medical_history/index_medical_histories_controller'
)
const { default: UpdateMedicalHistoriesController } = await import(
  '#controllers/medical_history/update_medical_histories_controller'
)

const medicalHistories = (): void => {
  router
    .group(() => {
      router.post('/', [StoreMedicalHistoriesController]).as('store')
      router.get('/', [IndexMedicalHistoriesController]).as('index')
      router.put('/:id', [UpdateMedicalHistoriesController]).as('update')
      // router.delete('/:id', [SoftDeleteUsersController]).as('medical_history.delete')
      // router.put('/:id/restore', [RestoreUsersController]).as('medical_history.restore')
    })
    .prefix('/medical_histories')
    .use(middleware.auth())
}

export default medicalHistories
