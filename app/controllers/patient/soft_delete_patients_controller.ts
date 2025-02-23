import Patient from '#models/patient'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class SoftDeletePatientsController {
  public async handle({ params, response }: HttpContext) {
    try {
      const patient = await Patient.findOrFail(params.id)

      patient.deletedAt = DateTime.utc()
      await patient.save()

      return response.ok({
        message: 'Paciente eliminado correctamente (Soft Delete)',
        data: patient,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al eliminar al paciente',
        error: error.message,
      })
    }
  }
}
