import User from '#models/user'
import { updateUserValidator } from '#validators/update_user_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class UpdateUserController {
  public async handle({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateUserValidator)

      const user = await User.findOrFail(params.id)

      user.merge(data)

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
