import Appointment from '#models/appointment'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import ApiResponse from '../../utils/api_response.js'
import AppointmentPolicy from '#policies/appointment_policy'

export default class SoftDeleteAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      const appointment = await Appointment.findOrFail(ctx.params.id)

      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(AppointmentPolicy).authorize('delete', appointment)

      appointment.deletedAt = DateTime.utc()
      await appointment.save()

      return ApiResponse.success(ctx, appointment.toJSON().data, 'Cita eliminada (Soft)')
    } catch (error) {
      return ApiResponse.error(ctx, 'Error al eliminar la cita', 500, error.message)
    }
  }
}
