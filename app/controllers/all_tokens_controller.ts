import AuthAccessToken from '#models/access_token'
import type { HttpContext } from '@adonisjs/core/http'

export default class AllTokensController {
  public async handle({ response }: HttpContext) {
    try {
      // console.log(auth.authenticateUsing)
      console.log('pasa controller')
      const tokens = await AuthAccessToken.all()
      console.log(tokens)
      return response.ok(tokens)
    } catch (error) {
      return response.badRequest({ message: 'Error al ver los tokens', error: error.message })
    }
  }
}
