import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/login'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  public async login({ request, response, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    try {
      const user = await User.findBy('email', email)
      console.log(user?.$attributes)

      if (!user || !user.password || !(await hash.verify(user.password, password))) {
        return response.unauthorized({ message: 'Credenciales inválidas' })
      }

      // Generar un token de acceso
      const token = await auth
        .use('api')
        .authenticateAsClient(user, ['Client'], { expiresIn: 20000 })

      // Devolver el token JWT
      return response.ok({
        message: 'Login exitoso',
        token: token,
      })
    } catch (error) {
      return response.unauthorized({
        message: 'Error al iniciar sesión',
        error: error.message,
      })
    }
  }
}
