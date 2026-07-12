import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import PrescriptionPolicy from '#policies/prescription_policy'
import { handleControllerError } from '#utils/error_handler'
import { updatePrescriptionValidator } from '#validators/prescription/update_prescription_validator'
import User from '#models/user'
import Patient from '#models/patient'
import Appointment from '#models/appointment'
import MedicalHistory from '#models/medical_history'
import Prescription from '#models/prescription'

export default class UpdatePrescriptionsController {
  public async handle(ctx: HttpContext) {
    try {
      const { params } = ctx
      const prescription = await Prescription.query()
        .where('id', params.id)
        .whereNull('deleted_at')
        .firstOrFail()

      await ctx.bouncer.with(PrescriptionPolicy).authorize('update', prescription)

      const data = await ctx.request.validateUsing(updatePrescriptionValidator)

      const doctorId = data.userId ?? prescription.userId
      const patientId = data.patientId ?? prescription.patientId
      const appointmentId =
        data.appointmentId !== undefined ? data.appointmentId : prescription.appointmentId
      const medicalHistoryId =
        data.medicalHistoryId !== undefined ? data.medicalHistoryId : prescription.medicalHistoryId

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

      if (appointmentId) {
        const appointment = await Appointment.findOrFail(appointmentId)
        if (appointment.branchId !== doctor.branchId) {
          return ApiResponse.error(
            ctx,
            'La cita y el doctor pertenecen a sucursales distintas',
            422
          )
        }
      }

      if (medicalHistoryId) {
        const medicalHistory = await MedicalHistory.findOrFail(medicalHistoryId)
        if (medicalHistory.branchId !== doctor.branchId) {
          return ApiResponse.error(
            ctx,
            'El historial médico y el doctor pertenecen a sucursales distintas',
            422
          )
        }
      }

      prescription.userId = doctorId
      prescription.patientId = patientId
      prescription.appointmentId = appointmentId
      prescription.medicalHistoryId = medicalHistoryId
      prescription.branchId = doctor.branchId
      if (data.notes !== undefined) {
        prescription.notes = data.notes
      }

      await prescription.save()
      await prescription.load('items')

      return ApiResponse.success(ctx, prescription.toJSON(), 'Receta actualizada exitosamente')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
