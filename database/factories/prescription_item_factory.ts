import factory from '@adonisjs/lucid/factories'
import PrescriptionItem from '#models/prescription_item'

export const PrescriptionItemFactory = factory
  .define(PrescriptionItem, async ({ faker }) => {
    return {
      prescriptionId: 1,
      medicationName: faker.commerce.productName(),
      dosage: '500mg',
      frequency: 'Cada 8 horas',
      durationDays: faker.number.int({ min: 1, max: 10 }),
      instructions: faker.lorem.sentence(),
    }
  })
  .build()
