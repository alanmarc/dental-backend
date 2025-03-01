import MedicalHistories from '#models/medical_histories'
import MedicalHistoriePolicy from '#policies/medical_historie_policy'
import { storeMedicalHistoriesValidator } from '#validators/medical_historie/store_medical_histories_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import { handleControllerError } from '../../utils/error_handler.js'

export default class StoreMedicalHistoriesController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(MedicalHistoriePolicy).authorize('create')

      const data = await ctx.request.validateUsing(storeMedicalHistoriesValidator)

      const medicalHistories = await MedicalHistories.create(data)

      return ApiResponse.success(ctx, medicalHistories.toJSON().data, 'Historia agregada', 201)
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
