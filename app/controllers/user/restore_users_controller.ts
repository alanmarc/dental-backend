import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import UserPolicy from '#policies/user_policy'
import { errors } from '@adonisjs/bouncer'

export default class RestoreUsersController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(UserPolicy).authorize('delete')

      const user = await User.findOrFail(ctx.params.id)

      user.deletedAt = null
      await user.save()

      return ApiResponse.success(ctx, user.toJSON().data, 'Usuario restaurado')
    } catch (error) {
      if (error instanceof errors.E_AUTHORIZATION_FAILURE) {
        return ApiResponse.error(ctx, 'No tienes los permisos necesarios', 403, error.message)
      }
      return ApiResponse.error(ctx, 'Error al restaurar al usuario', 500, error.message)
    }
  }
}
