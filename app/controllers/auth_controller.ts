import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/login'
import hash from '@adonisjs/core/services/hash'
import ApiResponse from '#utils/api_response'

export default class AuthController {
  public async login(ctx: HttpContext) {
    const { email, password } = await ctx.request.validateUsing(loginValidator)
    try {
      const user = await User.query()
        .where('email', email)
        .whereNull('deleted_at')
        .preload('role')
        .first()

      if (!user || !user.password || !(await hash.verify(user.password, password))) {
        return ApiResponse.error(ctx, 'Credenciales inválidas', 401)
      }

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '1 day',
      })

      return ApiResponse.success(ctx, token, 'Acceso exitoso')
    } catch (error) {
      console.error('Login error:', error)
      return ApiResponse.error(ctx, 'Error al iniciar sesión', 401)
    }
  }
}
