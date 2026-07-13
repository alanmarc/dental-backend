import InventoryTransfer from '#models/inventory_transfer'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import InventoryPolicy from '#policies/inventory_policy'
import { handleControllerError } from '#utils/error_handler'
import { getBranchIdsForActorHospital } from '#services/scope_service'

export default class IndexInventoryTransfersController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)
      const actor = ctx.auth.user!

      await ctx.bouncer.with(InventoryPolicy).authorize('view')

      const query = InventoryTransfer.query().orderBy('created_at', 'desc')

      // Scoping transfers inside the actor's hospital branches
      const branchIds = await getBranchIdsForActorHospital(actor)
      query.where((q) => {
        q.whereIn('from_branch_id', branchIds).orWhereIn('to_branch_id', branchIds)
      })

      const transfers = await query.paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        transfers.toJSON().data,
        transfers.toJSON().meta,
        'Traspasos encontrados'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
