import Hospital from '#models/hospital'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import HospitalPolicy from '#policies/hospital_policy'
import { updateHospitalValidator } from '#validators/hospital/update_hospital_validator'
import { handleControllerError } from '../../utils/error_handler.js'

export default class UpdateHospitalsController {
  public async handle(ctx: HttpContext) {
    try {
      const hospital = await Hospital.findOrFail(ctx.params.id)
      await ctx.bouncer.with(HospitalPolicy).authorize('update')

      const data = await ctx.request.validateUsing(updateHospitalValidator)

      hospital.merge(data)
      await hospital.save()

      return ApiResponse.success(ctx, hospital.toJSON(), 'Hospital actualizado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
