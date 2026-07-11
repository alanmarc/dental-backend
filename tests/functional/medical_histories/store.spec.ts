import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'
import { AppointmentFactory } from '#database/factories/appointment_factory'

test.group('Medical histories store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene medical_histories.create', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const appointment = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.post('/api/medical_histories').loginAs(actor).json({
      userId: actor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: actor.branchId,
      diagnosis: 'Caries simple',
      treatment: 'Resina',
    })

    response.assertStatus(403)
  })

  test('201 y crea el historial si el actor tiene medical_histories.create', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['medical_histories.create'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const appointment = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.post('/api/medical_histories').loginAs(actor).json({
      userId: actor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: actor.branchId,
      diagnosis: 'Caries simple',
      treatment: 'Resina',
      notes: 'Notas adicionales',
    })

    response.assertStatus(201)
    assert.equal(response.body().data.diagnosis, 'Caries simple')
    assert.equal(response.body().data.branchId, actor.branchId)
  })

  test('422 si los IDs no existen', async ({ client }) => {
    const actor = await createUserWithPermissions(['medical_histories.create'])
    const response = await client.post('/api/medical_histories').loginAs(actor).json({
      userId: 999999,
      patientId: 999999,
      appointmentId: 999999,
      branchId: 999999,
      diagnosis: 'X',
      treatment: 'Y',
    })

    response.assertStatus(422)
  })

  test('401 sin autenticación', async ({ client }) => {
    const response = await client.post('/api/medical_histories').json({
      userId: 1,
      patientId: 1,
      appointmentId: 1,
      branchId: 1,
      diagnosis: 'X',
      treatment: 'Y',
    })
    response.assertStatus(401)
  })
})
