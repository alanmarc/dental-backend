import { HttpContext } from '@adonisjs/core/http'
import { errors as errorVine } from '@vinejs/vine'
import { errors as errorBouncer } from '@adonisjs/bouncer'
import ApiResponse from './api_response.js'

export function handleControllerError(ctx: HttpContext, error: any) {
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

  return ApiResponse.error(ctx, 'Error interno del servidor', 500, error.message)
}
