import Appointment from '#models/appointment'
import { storeAppointmentsValidator } from '#validators/store_appointments_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import { errors } from '@vinejs/vine'
import AppointmentPolicy from '#policies/appointment_policy'

export default class StoreAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      const { patientId, userId, dateTime, duration, status, reason } =
        await ctx.request.validateUsing(storeAppointmentsValidator)

      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(AppointmentPolicy).authorize('create')

      const appointment = await Appointment.create({
        patientId,
        userId,
        dateTime,
        duration,
        status,
        reason,
      })

      return ApiResponse.success(ctx, appointment.toJSON().data, 'Cita registrada', 201)
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        const formattedErrors = error.messages.map((err) => ({
          field: err.field,
          message: err.message,
        }))

        return ApiResponse.error(ctx, 'Error de validación', 422, { errors: formattedErrors })
      }
      return ApiResponse.error(ctx, 'Error al registrar la cita', 500, error.message)
    }
  }
}
