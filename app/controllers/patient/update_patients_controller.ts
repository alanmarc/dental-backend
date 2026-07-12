import Patient from '#models/patient'
import { updatePatientValidator } from '#validators/patient/update_patient_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import { handleControllerError } from '#utils/error_handler'
import PatientPolicy from '#policies/patient_policy'

export default class UpdatePatientsController {
  public async handle(ctx: HttpContext) {
    try {
      const patient = await Patient.query()
        .where('id', ctx.params.id)
        .preload('branch')
        .firstOrFail()
      await ctx.bouncer.with(PatientPolicy).authorize('update', patient)

      const data = await ctx.request.validateUsing(updatePatientValidator)
      patient.merge(data)
      await patient.save()

      return ApiResponse.success(ctx, patient.toJSON(), 'Paciente actualizado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
