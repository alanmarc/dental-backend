import Patient from '#models/patient'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import { handleControllerError } from '../../utils/error_handler.js'
import PatientPolicy from '#policies/patient_policy'

export default class RestorePatientsController {
  public async handle(ctx: HttpContext) {
    try {
      const patient = await Patient.findOrFail(ctx.params.id)
      await ctx.bouncer.with(PatientPolicy).authorize('restore', patient)

      patient.deletedAt = null
      await patient.save()

      return ApiResponse.success(ctx, patient.toJSON(), 'Paciente restaurado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
