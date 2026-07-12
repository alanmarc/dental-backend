import factory from '@adonisjs/lucid/factories'
import Prescription from '#models/prescription'
import { PrescriptionItemFactory } from './prescription_item_factory.js'

export const PrescriptionFactory = factory
  .define(Prescription, async ({ faker }) => {
    return {
      userId: 1,
      patientId: 1,
      appointmentId: null,
      medicalHistoryId: null,
      branchId: 1,
      notes: faker.lorem.sentence(),
    }
  })
  .relation('items', () => PrescriptionItemFactory)
  .build()
