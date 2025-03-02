import MedicalHistories from '#models/medical_histories'
import type { HttpContext } from '@adonisjs/core/http'
import MedicalHistoriePolicy from '#policies/medical_historie_policy'
import { updateMedicalHistoriesValidator } from '#validators/medical_historie/update_medical_histories_validator'
import { handleControllerError } from '../../utils/error_handler.js'
import ApiResponse from '../../utils/api_response.js'
import { handlerEmptyRequest } from '../../utils/empty_request_handler.js'

export default class UpdateMedicalHistoriesController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(MedicalHistoriePolicy).authorize('update')

      const medicalHistorie = await MedicalHistories.findOrFail(ctx.params.id)

      const data = await ctx.request.validateUsing(updateMedicalHistoriesValidator)
      handlerEmptyRequest(data)

      medicalHistorie.merge(data)

      await medicalHistorie.save()

      return ApiResponse.success(ctx, medicalHistorie.toJSON().data, 'Historial actualizado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
