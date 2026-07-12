import Branch from '#models/branch'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import BranchPolicy from '#policies/branch_policy'
import { handleControllerError } from '#utils/error_handler'

export default class RestoreBranchesController {
  public async handle(ctx: HttpContext) {
    try {
      const branch = await Branch.findOrFail(ctx.params.id)
      await ctx.bouncer.with(BranchPolicy).authorize('restore', branch)

      branch.deletedAt = null
      await branch.save()

      return ApiResponse.success(ctx, branch.toJSON(), 'Sucursal restaurada')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
