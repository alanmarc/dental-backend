import Appointment from '#models/appointment'
import { updateAppointmentValidator } from '#validators/update_appointment_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class UpdateAppointmentsController {
  public async handle({ params, request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateAppointmentValidator)

      const appointment = await Appointment.findOrFail(params.id)

      appointment.merge(data)

      await appointment.save()

      return response.ok({
        message: 'Cita actualizada correctamente',
        data: appointment,
      })
    } catch (error) {
      if (error.messages) {
        return response.badRequest({
          message: 'Error de validación',
          errors: error.messages,
        })
      }

      return response.badRequest({
        message: 'Error al actualizar la cita',
        error: error.message,
      })
    }
  }
}
