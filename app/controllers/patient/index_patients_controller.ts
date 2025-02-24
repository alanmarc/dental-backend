import Patient from '#models/patient'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'

export default class IndexPatientsController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)
      const patients = await Patient.query().paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        patients.toJSON().data,
        patients.toJSON().meta,
        'Pacientes encontrados'
      )
    } catch (error) {
      return ApiResponse.error(ctx, 'Error al obtener los pacientes', 500, error.message)
    }
  }
}
