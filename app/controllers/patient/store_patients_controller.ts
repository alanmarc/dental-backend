import Patient from '#models/patient'
import { storePatientValidator } from '#validators/store_patient_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import PatientPolicy from '#policies/patient_policy'
import { handleControllerError } from '../../utils/error_handler.js'

export default class StorePatientsController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(PatientPolicy).authorize('create')

      const { userId, firstName, lastName } = await ctx.request.validateUsing(storePatientValidator)
      const patient = await Patient.create({
        userId,
        firstName,
        lastName,
      })
      return ApiResponse.success(ctx, patient.toJSON().data, 'Paciente registrado', 201)
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
