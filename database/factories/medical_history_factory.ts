import factory from '@adonisjs/lucid/factories'
import MedicalHistory from '#models/medical_history'

export const MedicalHistoryFactory = factory
  .define(MedicalHistory, async ({ faker }) => {
    return {
      userId: 1, // Will be overridden in tests
      patientId: 1, // Will be overridden in tests
      appointmentId: 1, // Will be overridden in tests
      branchId: 1, // Will be overridden in tests
      diagnosis: faker.lorem.sentence(),
      treatment: faker.lorem.sentence(),
      notes: faker.lorem.paragraph(),
    }
  })
  .build()
