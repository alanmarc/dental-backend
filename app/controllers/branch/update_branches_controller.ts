import Branch from '#models/branch'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import BranchPolicy from '#policies/branch_policy'
import { updateBranchValidator } from '#validators/branch/update_branch_validator'
import { handleControllerError } from '../../utils/error_handler.js'

export default class UpdateBranchesController {
  public async handle(ctx: HttpContext) {
    try {
      const branch = await Branch.findOrFail(ctx.params.id)
      const actor = ctx.auth.user!

      await ctx.bouncer.with(BranchPolicy).authorize('update', branch)

      const data = await ctx.request.validateUsing(updateBranchValidator)

      if (
        !actor.hasPermission('branches.update.any') &&
        data.hospitalId !== undefined &&
        data.hospitalId !== actor.branch.hospitalId
      ) {
        return ApiResponse.error(ctx, 'No puedes cambiar la sucursal a otro hospital', 422)
      }

      branch.merge(data)
      await branch.save()

      return ApiResponse.success(ctx, branch.toJSON(), 'Sucursal actualizada')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
