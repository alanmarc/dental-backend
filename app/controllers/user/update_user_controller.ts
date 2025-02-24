import User from '#models/user'
import { updateUserValidator } from '#validators/update_user_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import { errors } from '@vinejs/vine'

export default class UpdateUserController {
  public async handle(ctx: HttpContext) {
    try {
      const data = await ctx.request.validateUsing(updateUserValidator)

      const user = await User.findOrFail(ctx.params.id)

      user.merge(data)

      await user.save()

      return ApiResponse.success(ctx, user.toJSON().data, 'Usuario actualizado')
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        const formattedErrors = error.messages.map((err) => ({
          field: err.field,
          message: err.message,
        }))

        return ApiResponse.error(ctx, 'Error de validación', 422, { errors: formattedErrors })
      }
      return ApiResponse.error(ctx, 'Error al editar el paciente', 500, error.message)
    }
  }
}
