import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#validators/register'
import ApiResponse from '../../utils/api_response.js'
import { errors as errorVine } from '@vinejs/vine'
import UserPolicy from '#policies/user_policy'
import { errors as errorBouncer } from '@adonisjs/bouncer'

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
      if (error instanceof errorBouncer.E_AUTHORIZATION_FAILURE) {
        return ApiResponse.error(ctx, 'No tienes los permisos necesarios', 403, error.message)
      }

      if (error instanceof errorVine.E_VALIDATION_ERROR) {
        const formattedErrors = error.messages.map((err: { field: string; message: string }) => ({
          field: err.field,
          message: err.message,
        }))

        return ApiResponse.error(ctx, 'Error de validación', 422, { errors: formattedErrors })
      }
      return ApiResponse.error(ctx, 'Error al registrar al usuario', 500, error.message)
    }
  }
}
