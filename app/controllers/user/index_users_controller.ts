import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class IndexUsersController {
  public async handle({ response }: HttpContext) {
    try {
      const users = await User.all()
      return response.ok(users)
    } catch (error) {
      return response.badRequest({ message: 'Error al ver los usuarios', error: error.message })
    }
  }
}
