import { errors } from '@vinejs/vine'
import Patient from '#models/patient'
import { storePatientValidator } from '#validators/store_patient_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'

export default class StorePatientsController {
  public async handle(ctx: HttpContext) {
    try {
      const { userId, firstName, lastName } = await ctx.request.validateUsing(storePatientValidator)
      const patient = await Patient.create({
        userId,
        firstName,
        lastName,
      })
      return ApiResponse.success(ctx, patient.toJSON().data, 'Paciente registrado', 201)
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        const formattedErrors = error.messages.map((err) => ({
          field: err.field,
          message: err.message,
        }))

        return ApiResponse.error(ctx, 'Error de validación', 422, { errors: formattedErrors })
      }
      return ApiResponse.error(ctx, 'Error al registrar el paciente', 500, error.message)
    }
  }
}
