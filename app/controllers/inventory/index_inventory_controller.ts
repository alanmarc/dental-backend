import Inventory from '#models/inventory'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import InventoryPolicy from '#policies/inventory_policy'
import { handleControllerError } from '#utils/error_handler'
import { getBranchIdsForActorHospital } from '#services/scope_service'

export default class IndexInventoryController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)
      const productId = ctx.request.input('productId')
      const branchId = ctx.request.input('branchId')
      const actor = ctx.auth.user!

      await ctx.bouncer.with(InventoryPolicy).authorize('view')

      const query = Inventory.query()

      // Enforce scoping
      if (!actor.hasPermission('inventory.view.any')) {
        const branchIds = await getBranchIdsForActorHospital(actor)
        query.whereIn('branch_id', branchIds)
      }

      // Query filters
      if (productId) {
        query.where('product_id', productId)
      }
      if (branchId) {
        query.where('branch_id', branchId)
      }

      const inventories = await query.paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        inventories.toJSON().data,
        inventories.toJSON().meta,
        'Inventarios encontrados'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
