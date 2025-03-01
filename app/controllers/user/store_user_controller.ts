import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#validators/register'
import ApiResponse from '../../utils/api_response.js'
import UserPolicy from '#policies/user_policy'
import { handleControllerError } from '../../utils/error_handler.js'

export default class StoreUserController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(UserPolicy).authorize('create')

      const { fullName, email, password } = await ctx.request.validateUsing(registerValidator)
      const user = await User.create({
        fullName,
        email,
        password,
      })
      return ApiResponse.success(ctx, user.toJSON().data, 'Usuario registrado', 201)
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
