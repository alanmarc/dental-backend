import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'
import { AppointmentFactory } from '#database/factories/appointment_factory'
import { MedicalHistoryFactory } from '#database/factories/medical_history_factory'

test.group('Medical histories delete/restore', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // DELETE TESTS
  test('403 sin permiso medical_histories.delete', async ({ client }) => {
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
    const target = await MedicalHistoryFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.delete(`/api/medical_histories/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y hace soft delete si tiene medical_histories.delete.any y es del mismo hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['medical_histories.delete.any'])
    const otherDoctor = await createUserWithPermissions([], actor.branchId)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const appointment = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await MedicalHistoryFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client.delete(`/api/medical_histories/${target.id}`).loginAs(actor)
    response.assertStatus(200)
    assert.isNotNull(response.body().data.deletedAt)
  })

  test('403 si el actor tiene medical_histories.delete.any pero intenta eliminar un historial de otro hospital', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['medical_histories.delete.any'])
    const otherDoctor = await createUserWithPermissions([])
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const appointment = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await MedicalHistoryFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client.delete(`/api/medical_histories/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y hace soft delete si tiene medical_histories.delete.own y es su historial', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['medical_histories.delete.own'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const appointment = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()
    const target = await MedicalHistoryFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.delete(`/api/medical_histories/${target.id}`).loginAs(actor)
    response.assertStatus(200)
    assert.isNotNull(response.body().data.deletedAt)
  })

  test('403 si tiene medical_histories.delete.own pero es el historial de otro doctor', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['medical_histories.delete.own'])
    const otherDoctor = await createUserWithPermissions([])
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const appointment = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await MedicalHistoryFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client.delete(`/api/medical_histories/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  // RESTORE TESTS
  test('403 sin permiso medical_histories.restore', async ({ client }) => {
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
    const target = await MedicalHistoryFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.put(`/api/medical_histories/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y restaura si tiene medical_histories.restore.any y es del mismo hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions([
      'medical_histories.delete.any',
      'medical_histories.restore.any',
    ])
    const otherDoctor = await createUserWithPermissions([], actor.branchId)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const appointment = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await MedicalHistoryFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: otherDoctor.branchId,
    }).create()

    // Eliminar primero
    await client.delete(`/api/medical_histories/${target.id}`).loginAs(actor)

    const response = await client.put(`/api/medical_histories/${target.id}/restore`).loginAs(actor)
    response.assertStatus(200)
    assert.isNull(response.body().data.deletedAt)
  })

  test('403 si el actor tiene medical_histories.restore.any pero intenta restaurar un historial de otro hospital', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions([
      'medical_histories.delete.any',
      'medical_histories.restore.any',
    ])
    const otherDoctor = await createUserWithPermissions([]) // different hospital
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const appointment = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await MedicalHistoryFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: otherDoctor.branchId,
    }).create()

    // Soft-delete using a deleter in the other hospital
    const deleter = await createUserWithPermissions(
      ['medical_histories.delete.any'],
      otherDoctor.branchId
    )
    await client.delete(`/api/medical_histories/${target.id}`).loginAs(deleter)

    const response = await client.put(`/api/medical_histories/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y restaura si tiene medical_histories.restore.own y es su historial', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions([
      'medical_histories.delete.own',
      'medical_histories.restore.own',
    ])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const appointment = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()
    const target = await MedicalHistoryFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: actor.branchId,
    }).create()

    // Eliminar primero
    await client.delete(`/api/medical_histories/${target.id}`).loginAs(actor)

    const response = await client.put(`/api/medical_histories/${target.id}/restore`).loginAs(actor)
    response.assertStatus(200)
    assert.isNull(response.body().data.deletedAt)
  })

  test('403 si tiene medical_histories.restore.own pero es el historial de otro doctor', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions([
      'medical_histories.delete.any',
      'medical_histories.restore.own',
    ])
    const otherDoctor = await createUserWithPermissions([], actor.branchId)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const appointment = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await MedicalHistoryFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: otherDoctor.branchId,
    }).create()

    // Eliminar primero (con delete.any)
    await client.delete(`/api/medical_histories/${target.id}`).loginAs(actor)

    const response = await client.put(`/api/medical_histories/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })
})
