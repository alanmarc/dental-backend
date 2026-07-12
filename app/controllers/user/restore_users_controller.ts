import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import UserPolicy from '#policies/user_policy'
import { handleControllerError } from '#utils/error_handler'

export default class RestoreUsersController {
  public async handle(ctx: HttpContext) {
    try {
      const target = await User.findOrFail(ctx.params.id)

      await ctx.bouncer.with(UserPolicy).authorize('delete', target)

      target.deletedAt = null
      await target.save()

      return ApiResponse.success(ctx, target.toJSON(), 'Usuario restaurado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
