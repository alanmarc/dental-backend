import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: IndexHospitalsController } =
  await import('#controllers/hospital/index_hospitals_controller')
const { default: StoreHospitalsController } =
  await import('#controllers/hospital/store_hospitals_controller')
const { default: UpdateHospitalsController } =
  await import('#controllers/hospital/update_hospitals_controller')
const { default: SoftDeleteHospitalsController } =
  await import('#controllers/hospital/soft_delete_hospitals_controller')
const { default: RestoreHospitalsController } =
  await import('#controllers/hospital/restore_hospitals_controller')

const hospitals = (): void => {
  router
    .group(() => {
      router.post('/', [StoreHospitalsController]).as('store')
      router.get('/', [IndexHospitalsController]).as('index')
      router.put('/:id', [UpdateHospitalsController]).as('update')
      router.delete('/:id', [SoftDeleteHospitalsController]).as('delete')
      router.put('/:id/restore', [RestoreHospitalsController]).as('restore')
    })
    .prefix('/hospitals')
    .use([middleware.auth(), middleware.loadPermissions()])
}

export default hospitals
