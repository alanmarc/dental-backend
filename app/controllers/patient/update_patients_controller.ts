import Patient from '#models/patient'
import { updatePatientValidator } from '#validators/update_patient_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class UpdatePatientsController {
  public async handle({ params, request, response }: HttpContext) {
    const { firstName, lastName, email, dob, phone, address, note, userId } =
      await request.validateUsing(updatePatientValidator)

    try {
      const patient = await Patient.findOrFail(params.id)

      if (firstName) {
        patient.firstName = firstName
      }
      if (lastName) {
        patient.lastName = lastName
      }
      if (email) {
        patient.email = email
      }
      if (dob) {
        patient.dob = dob
      }
      if (phone) {
        patient.phone = phone
      }
      if (address) {
        patient.address = address
      }
      if (note) {
        patient.note = note
      }
      if (userId) {
        patient.userId = userId
      }

      await patient.save()

      return response.ok({
        message: 'Paciente actualizado correctamente',
        data: patient,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al actualizar el paciente',
        error: error.message,
      })
    }
  }
}
