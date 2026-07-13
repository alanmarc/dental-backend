import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: StorePurchasesController } =
  await import('#controllers/purchase/store_purchases_controller')
const { default: IndexPurchasesController } =
  await import('#controllers/purchase/index_purchases_controller')
const { default: ReceivePurchasesController } =
  await import('#controllers/purchase/receive_purchases_controller')
const { default: CancelPurchasesController } =
  await import('#controllers/purchase/cancel_purchases_controller')
const { default: ReturnPurchasesController } =
  await import('#controllers/purchase/return_purchases_controller')

const purchases = (): void => {
  router
    .group(() => {
      router.post('/', [StorePurchasesController]).as('store')
      router.get('/', [IndexPurchasesController]).as('index')
      router.put('/:id/receive', [ReceivePurchasesController]).as('receive')
      router.put('/:id/cancel', [CancelPurchasesController]).as('cancel')
      router.post('/:id/return', [ReturnPurchasesController]).as('return')
    })
    .prefix('/purchases')
    .use([middleware.auth(), middleware.loadPermissions()])
}

export default purchases
