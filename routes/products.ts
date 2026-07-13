import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: IndexProductsController } =
  await import('#controllers/product/index_products_controller')
const { default: StoreProductsController } =
  await import('#controllers/product/store_products_controller')
const { default: UpdateProductsController } =
  await import('#controllers/product/update_products_controller')
const { default: SoftDeleteProductsController } =
  await import('#controllers/product/soft_delete_products_controller')
const { default: RestoreProductsController } =
  await import('#controllers/product/restore_products_controller')

const products = (): void => {
  router
    .group(() => {
      router.post('/', [StoreProductsController]).as('store')
      router.get('/', [IndexProductsController]).as('index')
      router.put('/:id', [UpdateProductsController]).as('update')
      router.delete('/:id', [SoftDeleteProductsController]).as('delete')
      router.put('/:id/restore', [RestoreProductsController]).as('restore')
    })
    .prefix('/products')
    .use([middleware.auth(), middleware.loadPermissions()])
}

export default products
