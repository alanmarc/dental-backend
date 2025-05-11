import Appointment from '#models/appointment'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import AppointmentPolicy from '#policies/appointment_policy'
import { handleControllerError } from '../../utils/error_handler.js'

export default class IndexAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(AppointmentPolicy).authorize('view')

      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)
      const status = ctx.request.input('status', undefined)

      // Inicia la consulta
      const query = Appointment.query().preload('patient').preload('user').preload('branch')

      // Aplica el filtro si existe
      if (status) {
        query.where('status', status)
        // O usando el scope (ambas formas funcionan):
        // query.apply(scope => scope.byStatus(status))
      }

      // Ejecuta la consulta CON los filtros aplicados
      const appointments = await query.paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        appointments.toJSON().data,
        appointments.toJSON().meta,
        'Citas encontradas'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
