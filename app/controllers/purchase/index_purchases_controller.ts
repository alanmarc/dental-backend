import Purchase from '#models/purchase'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import PurchasePolicy from '#policies/purchase_policy'
import { handleControllerError } from '#utils/error_handler'
import { getBranchIdsForActorHospital } from '#services/scope_service'

export default class IndexPurchasesController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)
      const actor = ctx.auth.user!

      await ctx.bouncer.with(PurchasePolicy).authorize('view')

      const query = Purchase.query().whereNull('deleted_at').orderBy('created_at', 'desc')

      // Enforce scoping
      if (!actor.hasPermission('purchases.view.any')) {
        const branchIds = await getBranchIdsForActorHospital(actor)
        query.whereIn('branch_id', branchIds)
      }

      const purchases = await query.paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        purchases.toJSON().data,
        purchases.toJSON().meta,
        'Compras encontradas'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
