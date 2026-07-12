import Hospital from '#models/hospital'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import HospitalPolicy from '#policies/hospital_policy'
import { handleControllerError } from '#utils/error_handler'

export default class IndexHospitalsController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)

      await ctx.bouncer.with(HospitalPolicy).authorize('view')

      const hospitals = await Hospital.query().whereNull('deleted_at').paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        hospitals.toJSON().data,
        hospitals.toJSON().meta,
        'Hospitales encontrados'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
