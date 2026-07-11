import MedicalHistoriePolicy from '#policies/medical_historie_policy'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import { handleControllerError } from '../../utils/error_handler.js'
import MedicalHistory from '#models/medical_history'

import { getBranchIdsForActorHospital } from '../../services/scope_service.js'

export default class IndexMedicalHistoriesController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.bouncer.with(MedicalHistoriePolicy).authorize('view')

      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)
      const actor = ctx.auth.user!

      const query = MedicalHistory.query()

      // Enforce hospital scoping
      if (!actor.hasPermission('medical_histories.view.any')) {
        const branchIds = await getBranchIdsForActorHospital(actor)
        query.whereIn('branch_id', branchIds)
      }

      const medicalHistories = await query.paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        medicalHistories.toJSON().data,
        medicalHistories.toJSON().meta,
        'Historial encontrado'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
