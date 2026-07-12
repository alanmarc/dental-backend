import User from '#models/user'
import { updateUserValidator } from '#validators/update_user_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import UserPolicy from '#policies/user_policy'
import { handleControllerError } from '#utils/error_handler'

export default class UpdateUserController {
  public async handle(ctx: HttpContext) {
    try {
      const target = await User.findOrFail(ctx.params.id)

      await ctx.bouncer.with(UserPolicy).authorize('update', target)

      const data = await ctx.request.validateUsing(updateUserValidator)

      if (data.roleId !== undefined && data.roleId !== target.roleId) {
        await ctx.bouncer.with(UserPolicy).authorize('assignRole', target)
      }

      target.merge(data)
      await target.save()

      return ApiResponse.success(ctx, target.toJSON(), 'Usuario actualizado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
