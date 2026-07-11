import Appointment from '#models/appointment'
import { updateAppointmentValidator } from '#validators/appointment/update_appointment_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '../../utils/api_response.js'
import AppointmentPolicy from '#policies/appointment_policy'
import { handleControllerError } from '../../utils/error_handler.js'
import { isAppointmentAvailable } from '../../utils/validate_availability.js'
import Patient from '#models/patient'
import User from '#models/user'

export default class UpdateAppointmentsController {
  public async handle(ctx: HttpContext) {
    try {
      const appointment = await Appointment.findOrFail(ctx.params.id)
      await ctx.bouncer.with(AppointmentPolicy).authorize('update', appointment)

      const data = await ctx.request.validateUsing(updateAppointmentValidator)

      const doctorId = data.userId ?? appointment.userId
      const patientId = data.patientId ?? appointment.patientId

      const [patient, doctor] = await Promise.all([
        Patient.findOrFail(patientId),
        User.findOrFail(doctorId),
      ])

      if (patient.branchId !== doctor.branchId) {
        return ApiResponse.error(
          ctx,
          'El paciente y el doctor pertenecen a sucursales distintas',
          422
        )
      }

      const branchId = doctor.branchId
      const dateTime = data.dateTime ?? appointment.dateTime
      const duration = data.duration ?? appointment.duration

      const isAvailable = await isAppointmentAvailable(doctorId, dateTime, duration, appointment.id)

      if (!isAvailable) {
        return ApiResponse.error(ctx, 'Horario ocupado en esta sucursal', 422)
      }

      appointment.merge({ ...data, branchId })

      await appointment.save()

      return ApiResponse.success(ctx, appointment.toJSON(), 'Cita actualizada')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
