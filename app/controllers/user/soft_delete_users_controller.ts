import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ApiResponse from '../../utils/api_response.js'

export default class SoftDeleteUsersController {
  public async handle(ctx: HttpContext) {
    try {
      const user = await User.findOrFail(ctx.params.id)

      user.deletedAt = DateTime.utc()
      await user.save()

      return ApiResponse.success(ctx, user.toJSON().data, 'Usuario eliminado (Soft)')
    } catch (error) {
      return ApiResponse.error(ctx, 'Error al eliminar al usuario', 500, error.message)
    }
  }
}
