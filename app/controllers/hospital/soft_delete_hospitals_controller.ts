import Hospital from '#models/hospital'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import HospitalPolicy from '#policies/hospital_policy'
import { handleControllerError } from '#utils/error_handler'
import { DateTime } from 'luxon'

export default class SoftDeleteHospitalsController {
  public async handle(ctx: HttpContext) {
    try {
      const hospital = await Hospital.findOrFail(ctx.params.id)
      await ctx.bouncer.with(HospitalPolicy).authorize('delete')

      hospital.deletedAt = DateTime.utc()
      await hospital.save()

      return ApiResponse.success(ctx, hospital.toJSON(), 'Hospital eliminado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
