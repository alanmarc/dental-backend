import MedicalHistoriePolicy from '#policies/medical_historie_policy'
import { storeMedicalHistoriesValidator } from '#validators/medical_historie/store_medical_histories_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import { handleControllerError } from '#utils/error_handler'
import MedicalHistory from '#models/medical_history'

export default class StoreMedicalHistoriesController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.bouncer.with(MedicalHistoriePolicy).authorize('create')

      const data = await ctx.request.validateUsing(storeMedicalHistoriesValidator)

      const medicalHistory = await MedicalHistory.create(data)

      return ApiResponse.success(ctx, medicalHistory.toJSON(), 'Historia agregada', 201)
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
