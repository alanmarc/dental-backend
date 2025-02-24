import Patient from '#models/patient'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ApiResponse from '../../utils/api_response.js'

export default class SoftDeletePatientsController {
  public async handle(ctx: HttpContext) {
    try {
      const patient = await Patient.findOrFail(ctx.params.id)

      patient.deletedAt = DateTime.utc()
      await patient.save()
      return ApiResponse.success(ctx, patient.toJSON().data, 'Paciente eliminado (Soft)')
    } catch (error) {
      return ApiResponse.error(ctx, 'Error al eliminar al paciente', 500, error.message)
    }
  }
}
