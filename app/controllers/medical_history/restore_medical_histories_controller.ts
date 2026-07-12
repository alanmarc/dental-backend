import MedicalHistory from '#models/medical_history'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import MedicalHistoriePolicy from '#policies/medical_historie_policy'
import { handleControllerError } from '#utils/error_handler'

export default class RestoreMedicalHistoriesController {
  public async handle(ctx: HttpContext) {
    try {
      const medicalHistory = await MedicalHistory.findOrFail(ctx.params.id)
      await ctx.bouncer.with(MedicalHistoriePolicy).authorize('restore', medicalHistory)

      medicalHistory.deletedAt = null
      await medicalHistory.save()

      return ApiResponse.success(ctx, medicalHistory.toJSON(), 'Historial restaurado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
