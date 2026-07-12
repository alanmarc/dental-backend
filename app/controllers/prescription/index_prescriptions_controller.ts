import Prescription from '#models/prescription'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import PrescriptionPolicy from '#policies/prescription_policy'
import { handleControllerError } from '#utils/error_handler'
import { getBranchIdsForActorHospital } from '#services/scope_service'

export default class IndexPrescriptionsController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)

      const actor = ctx.auth.user!

      await ctx.bouncer.with(PrescriptionPolicy).authorize('view')

      const query = Prescription.query().whereNull('deleted_at').preload('items')

      // Enforce hospital scoping
      if (!actor.hasPermission('prescriptions.view.any')) {
        const branchIds = await getBranchIdsForActorHospital(actor)
        query.whereIn('branch_id', branchIds)
      }

      const prescriptions = await query.paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        prescriptions.toJSON().data,
        prescriptions.toJSON().meta,
        'Recetas encontradas'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
