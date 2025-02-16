import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'

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
    // Autenticar al usuario usando los guards especificados
    await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })

    // Continuar con la siguiente operación (por ejemplo, el controlador)
    return next()
  }
}
