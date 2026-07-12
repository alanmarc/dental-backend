import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import UserPolicy from '#policies/user_policy'
import { handleControllerError } from '#utils/error_handler'

import { getBranchIdsForActorHospital } from '#services/scope_service'

export default class IndexUsersController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)

      const actor = ctx.auth.user!

      await ctx.bouncer.with(UserPolicy).authorize('view')

      const query = User.query().whereNull('deleted_at')

      // Enforce multi-tenant scoping if not super_admin
      if (!actor.hasPermission('users.view.any')) {
        const branchIds = await getBranchIdsForActorHospital(actor)
        query.whereIn('branch_id', branchIds)
      }

      const users = await query.paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        users.toJSON().data,
        users.toJSON().meta,
        'Usuarios encontrados'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
