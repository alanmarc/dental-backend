import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'
import { AppointmentFactory } from '#database/factories/appointment_factory'

test.group('Appointments update', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene ningún permiso de actualización de citas', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .put(`/api/appointments/${target.id}`)
      .loginAs(actor)
      .json({ reason: 'Motivo modificado' })

    response.assertStatus(403)
  })

  test('200 si el actor tiene appointments.update.any y edita cualquier cita', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['appointments.update.any'])
    const otherDoctor = await createUserWithPermissions([])
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client
      .put(`/api/appointments/${target.id}`)
      .loginAs(actor)
      .json({ reason: 'Editado por admin' })

    response.assertStatus(200)
    assert.equal(response.body().data.reason, 'Editado por admin')
  })

  test('200 si el actor tiene appointments.update.own y edita SU propia cita', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['appointments.update.own'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .put(`/api/appointments/${target.id}`)
      .loginAs(actor)
      .json({ reason: 'Editado por mí' })

    response.assertStatus(200)
    assert.equal(response.body().data.reason, 'Editado por mí')
  })

  test('403 si el actor tiene appointments.update.own pero intenta editar la cita de otro doctor', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['appointments.update.own'])
    const otherDoctor = await createUserWithPermissions([])
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client
      .put(`/api/appointments/${target.id}`)
      .loginAs(actor)
      .json({ reason: 'No permitido' })

    response.assertStatus(403)
  })

  test('404 si la cita no existe', async ({ client }) => {
    const actor = await createUserWithPermissions(['appointments.update.any'])
    const response = await client
      .put('/api/appointments/999999')
      .loginAs(actor)
      .json({ reason: 'X' })

    response.assertStatus(404)
  })
})
