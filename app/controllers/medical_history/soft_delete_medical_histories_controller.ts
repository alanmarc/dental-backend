import MedicalHistory from '#models/medical_history'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ApiResponse from '../../utils/api_response.js'
import MedicalHistoriePolicy from '#policies/medical_historie_policy'
import { handleControllerError } from '../../utils/error_handler.js'

export default class SoftDeleteMedicalHistoriesController {
  public async handle(ctx: HttpContext) {
    try {
      const medicalHistory = await MedicalHistory.findOrFail(ctx.params.id)
      await ctx.bouncer.with(MedicalHistoriePolicy).authorize('delete', medicalHistory)

      medicalHistory.deletedAt = DateTime.utc()
      await medicalHistory.save()

      return ApiResponse.success(ctx, medicalHistory.toJSON(), 'Historial eliminado (Soft)')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
