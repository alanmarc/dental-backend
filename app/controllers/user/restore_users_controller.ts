import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class RestoreUsersController {
  public async handle({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)

      user.deletedAt = null
      await user.save()

      return response.ok({
        message: 'Usuario restaurado correctamente',
        data: user,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al restaurar al usuario',
        error: error.message,
      })
    }
  }
}
