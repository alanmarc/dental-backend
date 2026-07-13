import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import PrescriptionPolicy from '#policies/prescription_policy'
import { handleControllerError } from '#utils/error_handler'
import { storePrescriptionValidator } from '#validators/prescription/store_prescription_validator'
import User from '#models/user'
import Patient from '#models/patient'
import Appointment from '#models/appointment'
import MedicalHistory from '#models/medical_history'
import Prescription from '#models/prescription'
import PrescriptionItem from '#models/prescription_item'
import Product from '#models/product'
import db from '@adonisjs/lucid/services/db'

export default class StorePrescriptionsController {
  public async handle(ctx: HttpContext) {
    try {
      await ctx.bouncer.with(PrescriptionPolicy).authorize('create')

      const data = await ctx.request.validateUsing(storePrescriptionValidator)

      const [patient, doctor] = await Promise.all([
        Patient.findOrFail(data.patientId),
        User.findOrFail(data.userId),
      ])

      if (patient.branchId !== doctor.branchId) {
        return ApiResponse.error(
          ctx,
          'El paciente y el doctor pertenecen a sucursales distintas',
          422
        )
      }

      if (data.appointmentId) {
        const appointment = await Appointment.findOrFail(data.appointmentId)
        if (appointment.branchId !== doctor.branchId) {
          return ApiResponse.error(
            ctx,
            'La cita y el doctor pertenecen a sucursales distintas',
            422
          )
        }
      }

      if (data.medicalHistoryId) {
        const medicalHistory = await MedicalHistory.findOrFail(data.medicalHistoryId)
        if (medicalHistory.branchId !== doctor.branchId) {
          return ApiResponse.error(
            ctx,
            'El historial médico y el doctor pertenecen a sucursales distintas',
            422
          )
        }
      }

      // Check hospital alignment for any provided products
      for (const item of data.items) {
        if (item.productId) {
          const product = await Product.findOrFail(item.productId)
          if (!doctor.branch) await doctor.load('branch')
          if (product.hospitalId !== doctor.branch.hospitalId) {
            return ApiResponse.error(
              ctx,
              `El producto ${product.name} no pertenece al mismo hospital que el médico`,
              422
            )
          }
        }
      }

      const trx = await db.transaction()
      try {
        const prescription = new Prescription()
        prescription.userId = data.userId
        prescription.patientId = data.patientId
        prescription.appointmentId = data.appointmentId || null
        prescription.medicalHistoryId = data.medicalHistoryId || null
        prescription.branchId = doctor.branchId
        prescription.notes = data.notes || null

        prescription.useTransaction(trx)
        await prescription.save()

        for (const item of data.items) {
          const prescriptionItem = new PrescriptionItem()
          prescriptionItem.prescriptionId = prescription.id
          prescriptionItem.medicationName = item.medicationName
          prescriptionItem.dosage = item.dosage
          prescriptionItem.frequency = item.frequency
          prescriptionItem.durationDays = item.durationDays
          prescriptionItem.instructions = item.instructions || null
          prescriptionItem.productId = item.productId || null

          prescriptionItem.useTransaction(trx)
          await prescriptionItem.save()
        }

        await trx.commit()

        await prescription.load('items')

        return ApiResponse.success(ctx, prescription.toJSON(), 'Receta creada exitosamente', 201)
      } catch (err) {
        await trx.rollback()
        throw err
      }
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
