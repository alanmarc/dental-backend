import Appointment from '#models/appointment'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ApiResponse from '../../utils/api_response.js'

export default class SoftDeleteAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      const appointment = await Appointment.findOrFail(ctx.params.id)

      appointment.deletedAt = DateTime.utc()
      await appointment.save()

      return ApiResponse.success(ctx, appointment.toJSON().data, 'Cita eliminada (Soft)')
    } catch (error) {
      return ApiResponse.error(ctx, 'Error al eliminar la cita', 500, error.message)
    }
  }
}
