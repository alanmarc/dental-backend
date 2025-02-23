import Appointment from '#models/appointment'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class SoftDeleteAppointmentsController {
  public async handle({ params, response }: HttpContext) {
    try {
      const appointment = await Appointment.findOrFail(params.id)

      appointment.deletedAt = DateTime.utc()
      await appointment.save()

      return response.ok({
        message: 'Cita eliminada correctamente (Soft Delete)',
        data: appointment,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Error al eliminar la cita',
        error: error.message,
      })
    }
  }
}
