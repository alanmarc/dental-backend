import Appointment from '#models/appointment'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import AppointmentPolicy from '#policies/appointment_policy'

export default class RestoreAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      const appointment = await Appointment.findOrFail(ctx.params.id)

      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(AppointmentPolicy).authorize('delete', appointment)

      appointment.deletedAt = null
      await appointment.save()

      return ApiResponse.success(ctx, appointment.toJSON().data, 'Cita restaurada')
    } catch (error) {
      return ApiResponse.error(ctx, 'Error al restaurar la cita', 500, error.message)
    }
  }
}
