import Patient from '#models/patient'
import { updatePatientValidator } from '#validators/update_patient_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import { errors } from '@vinejs/vine'

export default class UpdatePatientsController {
  public async handle(ctx: HttpContext) {
    try {
      const data = await ctx.request.validateUsing(updatePatientValidator)

      const patient = await Patient.findOrFail(ctx.params.id)

      patient.merge(data)

      await patient.save()

      return ApiResponse.success(ctx, patient.toJSON().data, 'Paciente actualizado')
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
