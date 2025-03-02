import MedicalHistories from '#models/medical_histories'
import MedicalHistoriePolicy from '#policies/medical_historie_policy'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import { handleControllerError } from '../../utils/error_handler.js'

export default class IndexMedicalHistoriesController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(MedicalHistoriePolicy).authorize('view')

      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)

      const medicalHistorie = await MedicalHistories.query().paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        medicalHistorie.toJSON().data,
        medicalHistorie.toJSON().meta,
        'Historial encontrado'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
