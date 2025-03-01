import User from '#models/user'
import { updateUserValidator } from '#validators/update_user_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import UserPolicy from '#policies/user_policy'
import { handleControllerError } from '../../utils/error_handler.js'

export default class UpdateUserController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(UserPolicy).authorize('update')

      const data = await ctx.request.validateUsing(updateUserValidator)
      const user = await User.findOrFail(ctx.params.id)

      user.merge(data)

      await user.save()

      return ApiResponse.success(ctx, user.toJSON().data, 'Usuario actualizado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
