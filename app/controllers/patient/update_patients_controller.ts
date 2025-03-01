import Patient from '#models/patient'
import { updatePatientValidator } from '#validators/update_patient_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import { handleControllerError } from '../../utils/error_handler.js'
import PatientPolicy from '#policies/patient_policy'

export default class UpdatePatientsController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(PatientPolicy).authorize('update')

      const patient = await Patient.findOrFail(ctx.params.id)
      const data = await ctx.request.validateUsing(updatePatientValidator)

      patient.merge(data)

      await patient.save()

      return ApiResponse.success(ctx, patient.toJSON().data, 'Paciente actualizado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
