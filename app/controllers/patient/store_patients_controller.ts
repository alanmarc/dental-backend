import Patient from '#models/patient'
import { storePatientValidator } from '#validators/patient/store_patient_validator'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import PatientPolicy from '#policies/patient_policy'
import { handleControllerError } from '#utils/error_handler'
import { DateTime } from 'luxon'
import User from '#models/user'

export default class StorePatientsController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.bouncer.with(PatientPolicy).authorize('create')

      const patientData = await ctx.request.validateUsing(storePatientValidator)
      let branchId = ctx.auth.user?.branchId
      if (ctx.auth.user?.id !== patientData.userId) {
        const patientUser = await User.findOrFail(patientData.userId)
        branchId = patientUser.branchId
      }

      if (!branchId) {
        return ApiResponse.error(ctx, 'El médico asignado debe tener una sucursal vinculada.', 400)
      }

      const patient = await Patient.create({
        userId: patientData.userId,
        branchId: branchId!,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email,
        dob: patientData.dob ? DateTime.fromJSDate(patientData.dob) : null,
        phone: patientData.phone,
        address: patientData.address,
        note: patientData.note,
      })
      return ApiResponse.success(ctx, patient.toJSON(), 'Paciente registrado', 201)
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
