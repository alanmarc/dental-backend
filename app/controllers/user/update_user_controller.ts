import User from '#models/user'
import { updateUserValidator } from '#validators/update_user_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import { errors as errorVine } from '@vinejs/vine'
import UserPolicy from '#policies/user_policy'
import { errors as errorBouncer } from '@adonisjs/bouncer'

export default class UpdateUserController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(UserPolicy).authorize('update')

      const data = await ctx.request.validateUsing(updateUserValidator)
      const user = await User.findOrFail(ctx.params.id)

      user.merge(data)

      await user.save()

      return ApiResponse.success(ctx, user.toJSON().data, 'Usuario actualizado')
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
      return ApiResponse.error(ctx, 'Error al editar el paciente', 500, error.message)
    }
  }
}
