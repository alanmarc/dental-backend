import Patient from '#models/patient'
import type { HttpContext } from '@adonisjs/core/http'

export default class IndexPatientsController {
  public async handle({ response }: HttpContext) {
    try {
      const patients = await Patient.all()
      return response.ok(patients)
    } catch (error) {
      return response.badRequest({ message: 'Error al ver los pacientes', error: error.message })
    }
  }
}
