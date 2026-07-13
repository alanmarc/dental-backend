import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: IndexInventoryController } =
  await import('#controllers/inventory/index_inventory_controller')
const { default: IndexMovementsController } =
  await import('#controllers/inventory/index_movements_controller')
const { default: AdjustInventoryController } =
  await import('#controllers/inventory/adjust_inventory_controller')
const { default: StoreInventoryTransfersController } =
  await import('#controllers/inventory/store_inventory_transfers_controller')
const { default: IndexInventoryTransfersController } =
  await import('#controllers/inventory/index_inventory_transfers_controller')

const inventory = (): void => {
  router
    .group(() => {
      router.get('/', [IndexInventoryController]).as('index')
      router.get('/movements', [IndexMovementsController]).as('movements')
      router.post('/adjust', [AdjustInventoryController]).as('adjust')
      router.post('/transfers', [StoreInventoryTransfersController]).as('transfers.store')
      router.get('/transfers', [IndexInventoryTransfersController]).as('transfers.index')
    })
    .prefix('/inventory')
    .use([middleware.auth(), middleware.loadPermissions()])
}

export default inventory
