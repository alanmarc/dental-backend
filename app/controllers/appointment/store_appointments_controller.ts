import Appointment from '#models/appointment'
import { storeAppointmentsValidator } from '#validators/appointment/store_appointments_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import AppointmentPolicy from '#policies/appointment_policy'
import { handleControllerError } from '../../utils/error_handler.js'
import { isAppointmentAvailable } from '../../utils/validate_availability.js'

export default class StoreAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.auth.user?.load('role')
      await ctx.bouncer.with(AppointmentPolicy).authorize('create')

      const { patientId, branchId, userId, dateTime, duration, status, reason } =
        await ctx.request.validateUsing(storeAppointmentsValidator)

      const isAvailable = await isAppointmentAvailable(branchId, dateTime, duration)

      if (!isAvailable) {
        return ApiResponse.error(ctx, 'Horario ocupado en esta sucursal', 422)
      }

      const appointment = await Appointment.create({
        patientId,
        userId,
        branchId,
        dateTime,
        duration,
        status,
        reason,
      })

      return ApiResponse.success(ctx, appointment.toJSON().data, 'Cita registrada', 201)
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
