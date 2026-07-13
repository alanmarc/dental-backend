import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: IndexSuppliersController } =
  await import('#controllers/supplier/index_suppliers_controller')
const { default: StoreSuppliersController } =
  await import('#controllers/supplier/store_suppliers_controller')
const { default: UpdateSuppliersController } =
  await import('#controllers/supplier/update_suppliers_controller')
const { default: SoftDeleteSuppliersController } =
  await import('#controllers/supplier/soft_delete_suppliers_controller')
const { default: RestoreSuppliersController } =
  await import('#controllers/supplier/restore_suppliers_controller')

const suppliers = (): void => {
  router
    .group(() => {
      router.post('/', [StoreSuppliersController]).as('store')
      router.get('/', [IndexSuppliersController]).as('index')
      router.put('/:id', [UpdateSuppliersController]).as('update')
      router.delete('/:id', [SoftDeleteSuppliersController]).as('delete')
      router.put('/:id/restore', [RestoreSuppliersController]).as('restore')
    })
    .prefix('/suppliers')
    .use([middleware.auth(), middleware.loadPermissions()])
}

export default suppliers
