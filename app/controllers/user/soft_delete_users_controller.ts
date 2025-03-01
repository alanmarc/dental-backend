import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ApiResponse from '../../utils/api_response.js'
import UserPolicy from '#policies/user_policy'
import { handleControllerError } from '../../utils/error_handler.js'

export default class SoftDeleteUsersController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(UserPolicy).authorize('delete')

      const user = await User.findOrFail(ctx.params.id)

      user.deletedAt = DateTime.utc()
      await user.save()

      return ApiResponse.success(ctx, user.toJSON().data, 'Usuario eliminado (Soft)')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
