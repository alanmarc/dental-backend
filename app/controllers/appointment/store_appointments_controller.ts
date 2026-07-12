import Appointment from '#models/appointment'
import { storeAppointmentsValidator } from '#validators/appointment/store_appointments_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import AppointmentPolicy from '#policies/appointment_policy'
import { handleControllerError } from '#utils/error_handler'
import { isAppointmentAvailable } from '#utils/validate_availability'
import Patient from '#models/patient'
import User from '#models/user'

export default class StoreAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.bouncer.with(AppointmentPolicy).authorize('create')

      const { patientId, userId, dateTime, duration, status, reason } =
        await ctx.request.validateUsing(storeAppointmentsValidator)

      const [patient, doctor] = await Promise.all([
        Patient.findOrFail(patientId),
        User.findOrFail(userId),
      ])

      if (patient.branchId !== doctor.branchId) {
        return ApiResponse.error(
          ctx,
          'El paciente y el doctor pertenecen a sucursales distintas',
          422
        )
      }

      const isAvailable = await isAppointmentAvailable(userId, dateTime, duration)

      if (!isAvailable) {
        return ApiResponse.error(ctx, 'Horario ocupado en esta sucursal', 422)
      }

      const appointment = await Appointment.create({
        patientId,
        userId,
        branchId: doctor.branchId,
        dateTime,
        duration,
        status,
        reason,
      })

      return ApiResponse.success(ctx, appointment.toJSON(), 'Cita registrada', 201)
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
