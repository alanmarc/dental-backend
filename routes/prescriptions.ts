import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: IndexPrescriptionsController } =
  await import('#controllers/prescription/index_prescriptions_controller')
const { default: StorePrescriptionsController } =
  await import('#controllers/prescription/store_prescriptions_controller')
const { default: UpdatePrescriptionsController } =
  await import('#controllers/prescription/update_prescriptions_controller')
const { default: SoftDeletePrescriptionsController } =
  await import('#controllers/prescription/soft_delete_prescriptions_controller')
const { default: RestorePrescriptionsController } =
  await import('#controllers/prescription/restore_prescriptions_controller')

const prescriptions = (): void => {
  router
    .group(() => {
      router.post('/', [StorePrescriptionsController]).as('store')
      router.get('/', [IndexPrescriptionsController]).as('index')
      router.put('/:id', [UpdatePrescriptionsController]).as('update')
      router.delete('/:id', [SoftDeletePrescriptionsController]).as('delete')
      router.put('/:id/restore', [RestorePrescriptionsController]).as('restore')
    })
    .prefix('/prescriptions')
    .use([middleware.auth(), middleware.loadPermissions()])
}

export default prescriptions
