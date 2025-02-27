import Appointment from '#models/appointment'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import AppointmentPolicy from '#policies/appointment_policy'

export default class IndexAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)

      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(AppointmentPolicy).authorize('view')

      const appointments = await Appointment.query().paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        appointments.toJSON().data,
        appointments.toJSON().meta,
        'Citas encontradas'
      )
    } catch (error) {
      return ApiResponse.error(ctx, 'Error al obtener las citas', 500, error.message)
    }
  }
}
