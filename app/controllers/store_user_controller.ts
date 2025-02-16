import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#validators/register'

export default class StoreUserController {
  public async handle({ request, response }: HttpContext) {
    // Validar los datos usando VineJS
    const data = await request.validateUsing(registerValidator)

    try {
      const user = await User.create(data)
      return response.created(user)
    } catch (error) {
      return response.badRequest({ message: 'Error al registrar el usuario', error: error.message })
    }
  }
}
