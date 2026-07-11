import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: StoreMedicalHistoriesController } =
  await import('#controllers/medical_history/store_medical_histories_controller')
const { default: IndexMedicalHistoriesController } =
  await import('#controllers/medical_history/index_medical_histories_controller')
const { default: UpdateMedicalHistoriesController } =
  await import('#controllers/medical_history/update_medical_histories_controller')
const { default: SoftDeleteMedicalHistoriesController } =
  await import('#controllers/medical_history/soft_delete_medical_histories_controller')
const { default: RestoreMedicalHistoriesController } =
  await import('#controllers/medical_history/restore_medical_histories_controller')

const medicalHistories = (): void => {
  router
    .group(() => {
      router.post('/', [StoreMedicalHistoriesController]).as('store')
      router.get('/', [IndexMedicalHistoriesController]).as('index')
      router.put('/:id', [UpdateMedicalHistoriesController]).as('update')
      router.delete('/:id', [SoftDeleteMedicalHistoriesController]).as('delete')
      router.put('/:id/restore', [RestoreMedicalHistoriesController]).as('restore')
    })
    .prefix('/medical_histories')
    .use([middleware.auth(), middleware.loadPermissions()])
}

export default medicalHistories
