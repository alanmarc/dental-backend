import User from '#models/user'
import { updateUserValidator } from '#validators/update_user_validator'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class UpdateUsersController {
  public async handle({ params, request, response }: HttpContext) {
    // Validar los datos de entrada
    const { fullName, email } = await request.validateUsing(updateUserValidator)

    try {
      const user = await User.findOrFail(params.id)

      if (fullName) {
        user.fullName = fullName
      }
      if (email) {
        user.email = email
      }

      await user.save()

      return response.ok({
        message: 'Usuario actualizado correctamente',
        data: user,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al actualizar el usuario',
        error: error.message,
      })
    }
  }
}
