import User from '#models/user'
import { updateUserValidator } from '#validators/update_user_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class UpdateUserController {
  public async handle({ params, request, response }: HttpContext) {
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
