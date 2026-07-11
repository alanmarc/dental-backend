import Patient from '#models/patient'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import PatientPolicy from '#policies/patient_policy'
import { handleControllerError } from '../../utils/error_handler.js'

export default class IndexPatientsController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)

      await ctx.bouncer.with(PatientPolicy).authorize('view')

      const patients = await Patient.query().paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        patients.toJSON().data,
        patients.toJSON().meta,
        'Pacientes encontrados'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
