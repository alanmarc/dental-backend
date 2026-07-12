import MedicalHistory from '#models/medical_history'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ApiResponse from '#utils/api_response'
import MedicalHistoryPolicy from '#policies/medical_history_policy'
import { handleControllerError } from '#utils/error_handler'

export default class SoftDeleteMedicalHistoriesController {
  public async handle(ctx: HttpContext) {
    try {
      const medicalHistory = await MedicalHistory.query()
        .where('id', ctx.params.id)
        .preload('branch')
        .firstOrFail()
      await ctx.bouncer.with(MedicalHistoryPolicy).authorize('delete', medicalHistory)

      medicalHistory.deletedAt = DateTime.utc()
      await medicalHistory.save()

      return ApiResponse.success(ctx, medicalHistory.toJSON(), 'Historial eliminado (Soft)')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
