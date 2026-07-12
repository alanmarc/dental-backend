import Patient from '#models/patient'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ApiResponse from '#utils/api_response'
import PatientPolicy from '#policies/patient_policy'
import { handleControllerError } from '#utils/error_handler'

export default class SoftDeletePatientsController {
  public async handle(ctx: HttpContext) {
    try {
      const patient = await Patient.query()
        .where('id', ctx.params.id)
        .preload('branch')
        .firstOrFail()
      await ctx.bouncer.with(PatientPolicy).authorize('delete', patient)

      patient.deletedAt = DateTime.utc()
      await patient.save()

      return ApiResponse.success(ctx, patient.toJSON(), 'Paciente eliminado (Soft)')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
