import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ApiResponse from '../../utils/api_response.js'
import UserPolicy from '#policies/user_policy'
import { handleControllerError } from '../../utils/error_handler.js'

export default class SoftDeleteUsersController {
  public async handle(ctx: HttpContext) {
    try {
      const target = await User.findOrFail(ctx.params.id)

      await ctx.bouncer.with(UserPolicy).authorize('delete', target)

      target.deletedAt = DateTime.utc()
      await target.save()

      return ApiResponse.success(ctx, target.toJSON().data, 'Usuario eliminado (Soft)')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
