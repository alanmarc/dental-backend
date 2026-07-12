import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'
import { AppointmentFactory } from '#database/factories/appointment_factory'

test.group('Appointments delete/restore', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // DELETE TESTS
  test('403 sin permiso appointments.delete', async ({ client }) => {
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

    const response = await client.delete(`/api/appointments/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y hace soft delete si tiene appointments.delete.any y es del mismo hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['appointments.delete.any'])
    const otherDoctor = await createUserWithPermissions([], actor.branchId)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client.delete(`/api/appointments/${target.id}`).loginAs(actor)
    response.assertStatus(200)
    assert.isNotNull(response.body().data.deletedAt)
  })

  test('403 si el actor tiene appointments.delete.any pero intenta eliminar cita de otro hospital', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['appointments.delete.any'])
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

    const response = await client.delete(`/api/appointments/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y hace soft delete si tiene appointments.delete.own y es su cita', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['appointments.delete.own'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.delete(`/api/appointments/${target.id}`).loginAs(actor)
    response.assertStatus(200)
    assert.isNotNull(response.body().data.deletedAt)
  })

  test('403 si tiene appointments.delete.own pero es la cita de otro doctor', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['appointments.delete.own'])
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

    const response = await client.delete(`/api/appointments/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  // RESTORE TESTS
  test('403 sin permiso appointments.restore', async ({ client }) => {
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

    const response = await client.put(`/api/appointments/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y restaura si tiene appointments.restore.any y es del mismo hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions([
      'appointments.delete.any',
      'appointments.restore.any',
    ])
    const otherDoctor = await createUserWithPermissions([], actor.branchId)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()

    // Eliminar primero
    await client.delete(`/api/appointments/${target.id}`).loginAs(actor)

    const response = await client.put(`/api/appointments/${target.id}/restore`).loginAs(actor)
    response.assertStatus(200)
    assert.isNull(response.body().data.deletedAt)
  })

  test('403 si el actor tiene appointments.restore.any pero intenta restaurar cita de otro hospital', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions([
      'appointments.delete.any',
      'appointments.restore.any',
    ])
    const otherDoctor = await createUserWithPermissions([]) // different hospital
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()

    // Soft-delete target using a deleter in the other hospital
    const deleter = await createUserWithPermissions(
      ['appointments.delete.any'],
      otherDoctor.branchId
    )
    await client.delete(`/api/appointments/${target.id}`).loginAs(deleter)

    const response = await client.put(`/api/appointments/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y restaura si tiene appointments.restore.own y es su cita', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions([
      'appointments.delete.own',
      'appointments.restore.own',
    ])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    // Eliminar primero
    await client.delete(`/api/appointments/${target.id}`).loginAs(actor)

    const response = await client.put(`/api/appointments/${target.id}/restore`).loginAs(actor)
    response.assertStatus(200)
    assert.isNull(response.body().data.deletedAt)
  })

  test('403 si tiene appointments.restore.own pero es la cita de otro doctor', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions([
      'appointments.delete.any',
      'appointments.restore.own',
    ])
    const otherDoctor = await createUserWithPermissions([], actor.branchId)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()

    // Eliminar primero (con delete.any)
    await client.delete(`/api/appointments/${target.id}`).loginAs(actor)

    const response = await client.put(`/api/appointments/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })
})
