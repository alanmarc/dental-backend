import MedicalHistory from '#models/medical_history'
import type { HttpContext } from '@adonisjs/core/http'
import MedicalHistoryPolicy from '#policies/medical_history_policy'
import { updateMedicalHistoriesValidator } from '#validators/medical_history/update_medical_histories_validator'
import { handleControllerError } from '#utils/error_handler'
import ApiResponse from '#utils/api_response'
import { handlerEmptyRequest } from '#utils/empty_request_handler'

export default class UpdateMedicalHistoriesController {
  public async handle(ctx: HttpContext) {
    try {
      const medicalHistory = await MedicalHistory.query()
        .where('id', ctx.params.id)
        .preload('branch')
        .firstOrFail()
      await ctx.bouncer.with(MedicalHistoryPolicy).authorize('update', medicalHistory)

      const data = await ctx.request.validateUsing(updateMedicalHistoriesValidator)
      handlerEmptyRequest(data)

      medicalHistory.merge(data)

      await medicalHistory.save()

      return ApiResponse.success(ctx, medicalHistory.toJSON(), 'Historial actualizado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
