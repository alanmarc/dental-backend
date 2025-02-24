import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'

export default class IndexUsersController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)
      const users = await User.query().paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        users.toJSON().data,
        users.toJSON().meta,
        'Usuarios encontrados'
      )
    } catch (error) {
      return ApiResponse.error(ctx, 'Error al obtener los usuarios', 500, error.message)
    }
  }
}
