import { HttpContext } from '@adonisjs/core/http'
import { errors as errorVine } from '@vinejs/vine'
import { errors as errorBouncer } from '@adonisjs/bouncer'
import { errors as errorLucid } from '@adonisjs/lucid'
import ApiResponse from './api_response.js'
import InsufficientStockException from '#exceptions/insufficient_stock_exception'

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

  if (error instanceof errorLucid.E_ROW_NOT_FOUND) {
    return ApiResponse.error(ctx, 'Recurso no encontrado', 404)
  }

  if (error instanceof InsufficientStockException) {
    return ApiResponse.error(ctx, error.message, 422)
  }

  return ApiResponse.error(ctx, 'Error interno del servidor', 500, error.message)
}
