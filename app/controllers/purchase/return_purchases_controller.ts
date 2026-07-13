import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import PurchasePolicy from '#policies/purchase_policy'
import { handleControllerError } from '#utils/error_handler'
import { returnPurchaseValidator } from '#validators/purchase/return_purchase_validator'
import Purchase from '#models/purchase'
import PurchaseItem from '#models/purchase_item'
import { registerMovement } from '#services/inventory_service'
import db from '@adonisjs/lucid/services/db'

export default class ReturnPurchasesController {
  public async handle(ctx: HttpContext) {
    try {
      const actor = ctx.auth.user!

      // 1. Fetch with branch preloaded
      const purchase = await Purchase.query()
        .where('id', ctx.params.id)
        .preload('branch')
        .firstOrFail()

      await ctx.bouncer.with(PurchasePolicy).authorize('receive', purchase)

      // 2. Validate status
      if (purchase.status !== 'received') {
        return ApiResponse.error(
          ctx,
          'Solo se puede realizar devolución de una compra ya recibida',
          422
        )
      }

      const data = await ctx.request.validateUsing(returnPurchaseValidator)

      // 3. Check quantities and items ownership
      const itemsToReturn: { productId: number; quantity: number }[] = []
      for (const item of data.items) {
        const dbItem = await PurchaseItem.findOrFail(item.purchaseItemId)
        if (dbItem.purchaseId !== purchase.id) {
          return ApiResponse.error(ctx, 'El item no pertenece a esta compra', 422)
        }

        // Sum up already returned quantity
        const result = await db
          .from('inventory_movements')
          .where('purchase_id', purchase.id)
          .where('product_id', dbItem.productId)
          .where('type', 'purchase_return')
          .sum('quantity as total')

        const alreadyReturned = Number(result[0]?.total || 0)

        if (alreadyReturned + item.quantity > dbItem.quantity) {
          return ApiResponse.error(
            ctx,
            `La cantidad devuelta excede la cantidad comprada disponible para el producto`,
            422
          )
        }

        itemsToReturn.push({
          productId: dbItem.productId,
          quantity: item.quantity,
        })
      }

      // 4. Register returns inside transaction
      const trx = await db.transaction()
      const movements: any[] = []
      try {
        for (const item of itemsToReturn) {
          const movement = await registerMovement({
            branchId: purchase.branchId,
            productId: item.productId,
            type: 'purchase_return',
            quantity: item.quantity,
            direction: 'out',
            userId: actor.id,
            purchaseId: purchase.id,
            trx,
          })
          movements.push(movement.toJSON())
        }

        await trx.commit()

        return ApiResponse.success(ctx, { movements }, 'Devolución registrada correctamente')
      } catch (err) {
        await trx.rollback()
        throw err
      }
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
