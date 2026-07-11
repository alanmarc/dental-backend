import factory from '@adonisjs/lucid/factories'
import Patient from '#models/patient'

export const PatientFactory = factory
  .define(Patient, async ({ faker }) => {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      dob: null,
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      note: faker.lorem.paragraph(),
      userId: 1, // Will be overridden in tests
      branchId: 1, // Will be overridden in tests
    }
  })
  .build()
