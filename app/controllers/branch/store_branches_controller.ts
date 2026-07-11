import Branch from '#models/branch'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import BranchPolicy from '#policies/branch_policy'
import { storeBranchValidator } from '#validators/branch/store_branch_validator'
import { handleControllerError } from '../../utils/error_handler.js'

export default class StoreBranchesController {
  public async handle(ctx: HttpContext) {
    try {
      const actor = ctx.auth.user!
      await ctx.bouncer.with(BranchPolicy).authorize('create')

      const data = await ctx.request.validateUsing(storeBranchValidator)

      if (
        !actor.hasPermission('branches.create.any') &&
        data.hospitalId !== actor.branch.hospitalId
      ) {
        return ApiResponse.error(ctx, 'No puedes crear sucursales para otros hospitales', 422)
      }

      const branch = await Branch.create(data)

      return ApiResponse.success(ctx, branch.toJSON(), 'Sucursal registrada', 201)
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
