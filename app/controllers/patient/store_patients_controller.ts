import Patient from '#models/patient'
import { storePatientValidator } from '#validators/store_patient_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class StorePatientsController {
  public async handle({ request, response }: HttpContext) {
    const { userId, firstName, lastName } = await request.validateUsing(storePatientValidator)
    try {
      const patient = await Patient.create({
        userId,
        firstName,
        lastName,
      })
      return response.created(patient)
    } catch (error) {
      return response.badRequest({
        message: 'Error al registrar el paciente',
        error: error.message,
      })
    }
  }
}
