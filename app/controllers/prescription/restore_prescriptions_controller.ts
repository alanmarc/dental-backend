import Prescription from '#models/prescription'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import { handleControllerError } from '#utils/error_handler'
import PrescriptionPolicy from '#policies/prescription_policy'

export default class RestorePrescriptionsController {
  public async handle(ctx: HttpContext) {
    try {
      const prescription = await Prescription.findOrFail(ctx.params.id)
      await ctx.bouncer.with(PrescriptionPolicy).authorize('restore', prescription)

      prescription.deletedAt = null
      await prescription.save()

      return ApiResponse.success(ctx, prescription.toJSON(), 'Receta restaurada')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
