import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: IndexInventoryController } =
  await import('#controllers/inventory/index_inventory_controller')
const { default: IndexMovementsController } =
  await import('#controllers/inventory/index_movements_controller')
const { default: AdjustInventoryController } =
  await import('#controllers/inventory/adjust_inventory_controller')

const inventory = (): void => {
  router
    .group(() => {
      router.get('/', [IndexInventoryController]).as('index')
      router.get('/movements', [IndexMovementsController]).as('movements')
      router.post('/adjust', [AdjustInventoryController]).as('adjust')
    })
    .prefix('/inventory')
    .use([middleware.auth(), middleware.loadPermissions()])
}

export default inventory
