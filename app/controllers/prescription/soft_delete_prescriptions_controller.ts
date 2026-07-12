import Prescription from '#models/prescription'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ApiResponse from '#utils/api_response'
import PrescriptionPolicy from '#policies/prescription_policy'
import { handleControllerError } from '#utils/error_handler'

export default class SoftDeletePrescriptionsController {
  public async handle(ctx: HttpContext) {
    try {
      const prescription = await Prescription.query()
        .where('id', ctx.params.id)
        .preload('branch')
        .firstOrFail()
      await ctx.bouncer.with(PrescriptionPolicy).authorize('delete', prescription)

      prescription.deletedAt = DateTime.utc()
      await prescription.save()

      return ApiResponse.success(ctx, prescription.toJSON(), 'Receta eliminada (Soft)')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
