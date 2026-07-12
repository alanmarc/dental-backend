import Patient from '#models/patient'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import PatientPolicy from '#policies/patient_policy'
import { handleControllerError } from '#utils/error_handler'

import { getBranchIdsForActorHospital } from '#services/scope_service'

export default class IndexPatientsController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)

      const actor = ctx.auth.user!

      await ctx.bouncer.with(PatientPolicy).authorize('view')

      const query = Patient.query().whereNull('deleted_at')

      // Enforce hospital scoping
      if (!actor.hasPermission('patients.view.any')) {
        const branchIds = await getBranchIdsForActorHospital(actor)
        query.whereIn('branch_id', branchIds)
      }

      const patients = await query.paginate(page, limit)

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
