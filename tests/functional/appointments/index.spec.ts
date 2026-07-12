import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { AppointmentFactory } from '#database/factories/appointment_factory'
import { PatientFactory } from '#database/factories/patient_factory'
import { DateTime } from 'luxon'

test.group('Appointments index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 sin permiso appointments.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/appointments').loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y respeta paginación con appointments.view', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['appointments.view'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).createMany(5)

    const response = await client.get('/api/appointments?page=1&limit=2').loginAs(actor)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 2)
  })

  test('200 y filtra por hospital si es admin con appointments.view', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['appointments.view'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    // Cita en el mismo hospital
    const sameAppointment = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    // Cita en otro hospital
    const otherDoctor = await createUserWithPermissions([])
    const otherPatient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const otherAppointment = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: otherPatient.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client.get('/api/appointments').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((a: any) => a.id)
    assert.include(ids, sameAppointment.id)
    assert.notInclude(ids, otherAppointment.id)
  })

  test('200 y ve todo si es super_admin con appointments.view.any', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['appointments.view', 'appointments.view.any'])

    // Cita en otro hospital
    const otherDoctor = await createUserWithPermissions([])
    const otherPatient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const otherAppointment = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: otherPatient.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client.get('/api/appointments').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((a: any) => a.id)
    assert.include(ids, otherAppointment.id)
  })

  test('200 y excluye citas soft-eliminadas', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['appointments.view'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const appointmentA = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const appointmentB = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    // Soft-eliminar appointmentB
    appointmentB.deletedAt = DateTime.utc()
    await appointmentB.save()

    const response = await client.get('/api/appointments').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((a: any) => a.id)
    assert.include(ids, appointmentA.id)
    assert.notInclude(ids, appointmentB.id)
  })
})
