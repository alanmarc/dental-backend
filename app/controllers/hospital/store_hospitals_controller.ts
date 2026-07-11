import Hospital from '#models/hospital'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import HospitalPolicy from '#policies/hospital_policy'
import { storeHospitalValidator } from '#validators/hospital/store_hospital_validator'
import { handleControllerError } from '../../utils/error_handler.js'

export default class StoreHospitalsController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.bouncer.with(HospitalPolicy).authorize('create')

      const { name } = await ctx.request.validateUsing(storeHospitalValidator)

      const hospital = await Hospital.create({ name })

      return ApiResponse.success(ctx, hospital.toJSON(), 'Hospital registrado', 201)
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
