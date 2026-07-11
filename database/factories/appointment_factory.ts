import factory from '@adonisjs/lucid/factories'
import Appointment from '#models/appointment'
import { DateTime } from 'luxon'

export const AppointmentFactory = factory
  .define(Appointment, async ({ faker }) => {
    return {
      patientId: 1, // Will be overridden in tests
      userId: 1, // Will be overridden in tests
      branchId: 1, // Will be overridden in tests
      dateTime: DateTime.now().plus({ days: faker.number.int({ min: 1, max: 10 }) }),
      duration: 30,
      status: 'scheduled' as const,
      reason: faker.lorem.sentence(),
      notes: faker.lorem.paragraph(),
    }
  })
  .build()
