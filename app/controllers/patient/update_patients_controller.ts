import Patient from '#models/patient'
import { updatePatientValidator } from '#validators/update_patient_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class UpdatePatientsController {
  public async handle({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updatePatientValidator)

      const patient = await Patient.findOrFail(params.id)

      patient.merge(data)

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
