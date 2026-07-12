import Branch from '#models/branch'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import BranchPolicy from '#policies/branch_policy'
import { handleControllerError } from '#utils/error_handler'

export default class IndexBranchesController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)
      const actor = ctx.auth.user!

      await ctx.bouncer.with(BranchPolicy).authorize('view')

      let query = Branch.query().whereNull('deleted_at')

      // Si el actor no tiene branches.view.any, limitamos la búsqueda
      // a las sucursales de su propio hospital
      if (!actor.hasPermission('branches.view.any')) {
        query = query.where('hospital_id', actor.branch.hospitalId)
      }

      const branches = await query.paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        branches.toJSON().data,
        branches.toJSON().meta,
        'Sucursales encontradas'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
