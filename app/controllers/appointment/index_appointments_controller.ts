import Appointment from '#models/appointment'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import AppointmentPolicy from '#policies/appointment_policy'
import { errors } from '@adonisjs/bouncer'

export default class IndexAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(AppointmentPolicy).authorize('view')

      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)

      const appointments = await Appointment.query().paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        appointments.toJSON().data,
        appointments.toJSON().meta,
        'Citas encontradas'
      )
    } catch (error) {
      if (error instanceof errors.E_AUTHORIZATION_FAILURE) {
        return ApiResponse.error(ctx, 'No tienes los permisos necesarios', 403, error.message)
      }
      return ApiResponse.error(ctx, 'Error al obtener las citas', 500, error.message)
    }
  }
}
