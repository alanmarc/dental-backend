import Appointment from '#models/appointment'
import type { HttpContext } from '@adonisjs/core/http'

export default class IndexAppointmentsController {
  public async handle({ response }: HttpContext) {
    try {
      const appointments = await Appointment.all()
      return response.ok(appointments)
    } catch (error) {
      return response.badRequest({ message: 'Error al ver las citas  ', error: error.message })
    }
  }
}
