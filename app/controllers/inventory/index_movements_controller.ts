import InventoryMovement from '#models/inventory_movement'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import InventoryPolicy from '#policies/inventory_policy'
import { handleControllerError } from '#utils/error_handler'
import { getBranchIdsForActorHospital } from '#services/scope_service'

export default class IndexMovementsController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)
      const productId = ctx.request.input('productId')
      const branchId = ctx.request.input('branchId')
      const type = ctx.request.input('type')
      const actor = ctx.auth.user!

      await ctx.bouncer.with(InventoryPolicy).authorize('view')

      const query = InventoryMovement.query().orderBy('created_at', 'desc')

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
      if (type) {
        query.where('type', type)
      }

      const movements = await query.paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        movements.toJSON().data,
        movements.toJSON().meta,
        'Movimientos de inventario encontrados'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
