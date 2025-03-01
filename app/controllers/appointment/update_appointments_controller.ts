import Appointment from '#models/appointment'
import { updateAppointmentValidator } from '#validators/appointment/update_appointment_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import AppointmentPolicy from '#policies/appointment_policy'
import { handleControllerError } from '../../utils/error_handler.js'

export default class UpdateAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(AppointmentPolicy).authorize('update')

      const appointment = await Appointment.findOrFail(ctx.params.id)

      const data = await ctx.request.validateUsing(updateAppointmentValidator)

      appointment.merge(data)

      await appointment.save()

      return ApiResponse.success(ctx, appointment.toJSON().data, 'Cita actualizada')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
