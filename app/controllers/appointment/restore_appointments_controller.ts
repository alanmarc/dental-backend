import Appointment from '#models/appointment'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import AppointmentPolicy from '#policies/appointment_policy'
import { handleControllerError } from '#utils/error_handler'

export default class RestoreAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      const appointment = await Appointment.query()
        .where('id', ctx.params.id)
        .preload('branch')
        .firstOrFail()

      await ctx.bouncer.with(AppointmentPolicy).authorize('restore', appointment)

      appointment.deletedAt = null
      await appointment.save()

      return ApiResponse.success(ctx, appointment.toJSON(), 'Cita restaurada')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
