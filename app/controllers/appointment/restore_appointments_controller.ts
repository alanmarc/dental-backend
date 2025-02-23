import Appointment from '#models/appointment'
import type { HttpContext } from '@adonisjs/core/http'

export default class RestoreAppointmentsController {
  public async handle({ params, response }: HttpContext) {
    try {
      const appointment = await Appointment.findOrFail(params.id)

      appointment.deletedAt = null
      await appointment.save()

      return response.ok({
        message: 'Cita restaurada correctamente',
        data: appointment,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al restaurar la cita',
        error: error.message,
      })
    }
  }
}
