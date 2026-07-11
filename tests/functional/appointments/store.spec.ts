import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'
import { DateTime } from 'luxon'

test.group('Appointments store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene appointments.create', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .post('/api/appointments')
      .loginAs(actor)
      .json({
        userId: actor.id,
        patientId: patient.id,
        branchId: actor.branchId,
        dateTime: DateTime.now().plus({ days: 1 }).toISO(),
        duration: 30,
        status: 'scheduled',
        reason: 'Consulta general',
      })

    response.assertStatus(403)
  })

  test('201 y crea la cita si el actor tiene appointments.create', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['appointments.create'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const futureTime = DateTime.now()
      .plus({ days: 1 })
      .set({ hour: 10, minute: 0, second: 0, millisecond: 0 })

    const response = await client.post('/api/appointments').loginAs(actor).json({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
      dateTime: futureTime.toISO(),
      duration: 30,
      status: 'scheduled',
      reason: 'Consulta dental',
    })

    response.assertStatus(201)
    assert.equal(response.body().data.reason, 'Consulta dental')
    assert.equal(response.body().data.branchId, actor.branchId)
  })

  test('422 si hay conflicto de horario en la sucursal', async ({ client }) => {
    const actor = await createUserWithPermissions(['appointments.create'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const futureTime = DateTime.now()
      .plus({ days: 1 })
      .set({ hour: 10, minute: 0, second: 0, millisecond: 0 })

    // Crear la primera cita
    await client.post('/api/appointments').loginAs(actor).json({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
      dateTime: futureTime.toISO(),
      duration: 30,
      status: 'scheduled',
      reason: 'Cita 1',
    })

    // Intentar crear la segunda cita al mismo tiempo (traslapada)
    const response = await client
      .post('/api/appointments')
      .loginAs(actor)
      .json({
        userId: actor.id,
        patientId: patient.id,
        branchId: actor.branchId,
        dateTime: futureTime.plus({ minutes: 15 }).toISO(), // Se traslapa con la cita de 10:00 a 10:30
        duration: 30,
        status: 'scheduled',
        reason: 'Cita traslapada',
      })

    response.assertStatus(422)
    response.assertTextIncludes('Horario ocupado en esta sucursal')
  })

  test('422 si los IDs no existen', async ({ client }) => {
    const actor = await createUserWithPermissions(['appointments.create'])
    const response = await client
      .post('/api/appointments')
      .loginAs(actor)
      .json({
        userId: 999999,
        patientId: 999999,
        branchId: 999999,
        dateTime: DateTime.now().plus({ days: 1 }).toISO(),
        duration: 30,
        status: 'scheduled',
        reason: 'Consulta general',
      })

    response.assertStatus(422)
  })

  test('401 sin autenticación', async ({ client }) => {
    const response = await client.post('/api/appointments').json({
      userId: 1,
      patientId: 1,
      branchId: 1,
      dateTime: DateTime.now().plus({ days: 1 }).toISO(),
      duration: 30,
      status: 'scheduled',
      reason: 'X',
    })
    response.assertStatus(401)
  })
})
