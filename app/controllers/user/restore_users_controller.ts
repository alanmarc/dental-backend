import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'

export default class RestoreUsersController {
  public async handle(ctx: HttpContext) {
    try {
      const user = await User.findOrFail(ctx.params.id)

      user.deletedAt = null
      await user.save()

      return ApiResponse.success(ctx, user.toJSON().data, 'Usuario restaurado')
    } catch (error) {
      return ApiResponse.error(ctx, 'Error al restaurar al usuario', 500, error.message)
    }
  }
}
