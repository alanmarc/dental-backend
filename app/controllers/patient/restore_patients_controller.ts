import Patient from '#models/patient'
import type { HttpContext } from '@adonisjs/core/http'

export default class RestorePatientsController {
  public async handle({ params, response }: HttpContext) {
    try {
      const patient = await Patient.findOrFail(params.id)

      patient.deletedAt = null
      await patient.save()

      return response.ok({
        message: 'Paciente restaurado correctamente',
        data: patient,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al restaurar al paciente',
        error: error.message,
      })
    }
  }
}
