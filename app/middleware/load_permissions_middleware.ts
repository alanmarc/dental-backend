import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class LoadPermissionsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (ctx.auth.user) {
      await ctx.auth.user.load('role', (roleQuery) => {
        roleQuery.preload('permissions')
      })
      await ctx.auth.user.load('branch')
    }
    return next()
  }
}
