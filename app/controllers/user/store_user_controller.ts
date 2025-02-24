import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#validators/register'
import ApiResponse from '../../utils/api_response.js'
import { errors } from '@vinejs/vine'

export default class StoreUserController {
  public async handle(ctx: HttpContext) {
    try {
      const { fullName, email, password } = await ctx.request.validateUsing(registerValidator)
      const user = await User.create({
        fullName,
        email,
        password,
      })
      return ApiResponse.success(ctx, user.toJSON().data, 'Usuario registrado', 201)
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        const formattedErrors = error.messages.map((err) => ({
          field: err.field,
          message: err.message,
        }))

        return ApiResponse.error(ctx, 'Error de validación', 422, { errors: formattedErrors })
      }
      return ApiResponse.error(ctx, 'Error al registrar al usuario', 500, error.message)
    }
  }
}
