import Appointment from '#models/appointment'
import { updateAppointmentValidator } from '#validators/update_appointment_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import { errors } from '@vinejs/vine'
import AppointmentPolicy from '#policies/appointment_policy'

export default class UpdateAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      const data = await ctx.request.validateUsing(updateAppointmentValidator)

      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(AppointmentPolicy).authorize('update')

      const appointment = await Appointment.findOrFail(ctx.params.id)

      appointment.merge(data)

      await appointment.save()

      return ApiResponse.success(ctx, appointment.toJSON().data, 'Cita actualizada')
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        const formattedErrors = error.messages.map((err) => ({
          field: err.field,
          message: err.message,
        }))

        return ApiResponse.error(ctx, 'Error de validación', 422, { errors: formattedErrors })
      }
      return ApiResponse.error(ctx, 'Error al editar la cita', 500, error.message)
    }
  }
}
