import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import PurchasePolicy from '#policies/purchase_policy'
import { handleControllerError } from '#utils/error_handler'
import Purchase from '#models/purchase'
import { registerMovement } from '#services/inventory_service'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class ReceivePurchasesController {
  public async handle(ctx: HttpContext) {
    try {
      const actor = ctx.auth.user!

      // 1. Fetch with branch preloaded for N+1 optimization and policy bouncer check
      const purchase = await Purchase.query()
        .where('id', ctx.params.id)
        .preload('branch')
        .firstOrFail()

      await ctx.bouncer.with(PurchasePolicy).authorize('receive', purchase)

      // 2. Validate status is draft
      if (purchase.status !== 'draft') {
        return ApiResponse.error(ctx, 'Solo se puede recibir una compra en borrador', 422)
      }

      // 3. Register movements and update status inside a transaction
      const trx = await db.transaction()
      try {
        await purchase.load('items')

        for (const item of purchase.items) {
          await registerMovement({
            branchId: purchase.branchId,
            productId: item.productId,
            type: 'purchase',
            quantity: item.quantity,
            direction: 'in',
            userId: actor.id,
            purchaseId: purchase.id,
            trx,
          })
        }

        purchase.status = 'received'
        purchase.receivedAt = DateTime.utc()

        purchase.useTransaction(trx)
        await purchase.save()

        await trx.commit()

        await purchase.load('movements')

        return ApiResponse.success(ctx, purchase.toJSON(), 'Compra recibida y stock actualizado')
      } catch (err) {
        await trx.rollback()
        throw err
      }
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
