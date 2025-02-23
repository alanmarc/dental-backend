import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class SoftDeleteUsersController {
  public async handle({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)

      user.deletedAt = DateTime.utc()
      await user.save()

      return response.ok({
        message: 'Usuario eliminado correctamente (Soft Delete)',
        data: user,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al eliminar al usuario',
        error: error.message,
      })
    }
  }
}
