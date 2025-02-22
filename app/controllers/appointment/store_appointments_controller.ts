import Appointment from '#models/appointment'
import { storeAppointmentsValidator } from '#validators/store_appointments_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class StoreAppointmentsController {
  public async handle({ request, response }: HttpContext) {
    const { patientId, userId, dateTime, duration, status, reason } = await request.validateUsing(
      storeAppointmentsValidator
    )

    try {
      const appointment = await Appointment.create({
        patientId,
        userId,
        dateTime,
        duration,
        status,
        reason,
      })
      return response.created(appointment)
    } catch (error) {
      return response.badRequest({
        message: 'Error al registrar la cita',
        error: error.message,
      })
    }
  }
}
