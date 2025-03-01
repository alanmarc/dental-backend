import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import UserPolicy from '#policies/user_policy'
import { handleControllerError } from '../../utils/error_handler.js'

export default class IndexUsersController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)

      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(UserPolicy).authorize('view')

      const users = await User.query().paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        users.toJSON().data,
        users.toJSON().meta,
        'Usuarios encontrados'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
