import Patient from '#models/patient'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'

export default class RestorePatientsController {
  public async handle(ctx: HttpContext) {
    try {
      const patient = await Patient.findOrFail(ctx.params.id)

      patient.deletedAt = null
      await patient.save()

      return ApiResponse.success(ctx, patient.toJSON().data, 'Paciente restaurado')
    } catch (error) {
      return ApiResponse.error(ctx, 'Error al restaurar al paciente', 500, error.message)
    }
  }
}
