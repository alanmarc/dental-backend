import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import ApiResponse from '../utils/api_response.js'

export default class AuthMiddleware {
  /**
   * Redirigir a esta ruta si el usuario no está autenticado
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    try {
      // Autenticar al usuario usando los guards especificados
      await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })

      // Continuar con la siguiente operación (por ejemplo, el controlador)
      return next()
    } catch (error) {
      return ApiResponse.error(ctx, 'Usuario no autenticado', 401, error.message)
    }
  }
}
