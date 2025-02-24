import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/login'
import hash from '@adonisjs/core/services/hash'
import ApiResponse from '../utils/api_response.js'

export default class AuthController {
  public async login(ctx: HttpContext) {
    const { email, password } = await ctx.request.validateUsing(loginValidator)
    try {
      const user = await User.findBy('email', email)

      if (!user || !user.password || !(await hash.verify(user.password, password))) {
        return ApiResponse.error(ctx, 'Credenciales inválidas', 401)
      }

      const token = await ctx.auth
        .use('api')
        .authenticateAsClient(user, ['Client'], { expiresIn: 20000 })

      return ApiResponse.success(ctx, token, 'Accesso exitoso')
    } catch (error) {
      return ApiResponse.error(ctx, 'Error al iniciar sesion', 401, error.message)
    }
  }
}
