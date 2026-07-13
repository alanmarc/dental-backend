import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import PurchasePolicy from '#policies/purchase_policy'
import { handleControllerError } from '#utils/error_handler'
import Purchase from '#models/purchase'

export default class CancelPurchasesController {
  public async handle(ctx: HttpContext) {
    try {
      // 1. Fetch with branch preloaded for N+1 optimization and bouncer check
      const purchase = await Purchase.query()
        .where('id', ctx.params.id)
        .preload('branch')
        .firstOrFail()

      await ctx.bouncer.with(PurchasePolicy).authorize('cancel', purchase)

      // 2. Validate status
      if (purchase.status === 'received') {
        return ApiResponse.error(
          ctx,
          'No se puede cancelar una compra ya recibida — usa una devolución en su lugar',
          422
        )
      }

      // 3. Cancel
      purchase.status = 'cancelled'
      await purchase.save()

      return ApiResponse.success(ctx, purchase.toJSON(), 'Compra cancelada exitosamente')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
