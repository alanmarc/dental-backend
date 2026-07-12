import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'
import { AppointmentFactory } from '#database/factories/appointment_factory'
import { MedicalHistoryFactory } from '#database/factories/medical_history_factory'

test.group('Medical histories update', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene ningún permiso de actualización de historiales', async ({
    client,
  }) => {
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

    const response = await client
      .put(`/api/medical_histories/${target.id}`)
      .loginAs(actor)
      .json({ diagnosis: 'Caries grave' })

    response.assertStatus(403)
  })

  test('200 si el actor tiene medical_histories.update.any y edita cualquier historial del mismo hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['medical_histories.update.any'])
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

    const response = await client
      .put(`/api/medical_histories/${target.id}`)
      .loginAs(actor)
      .json({ diagnosis: 'Editado por admin' })

    response.assertStatus(200)
    assert.equal(response.body().data.diagnosis, 'Editado por admin')
  })

  test('403 si el actor tiene medical_histories.update.any pero intenta editar un historial de otro hospital', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['medical_histories.update.any'])
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

    const response = await client
      .put(`/api/medical_histories/${target.id}`)
      .loginAs(actor)
      .json({ diagnosis: 'Editado por admin de otro hospital' })

    response.assertStatus(403)
  })

  test('200 si el actor tiene medical_histories.update.own y edita SU propio historial', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['medical_histories.update.own'])
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

    const response = await client
      .put(`/api/medical_histories/${target.id}`)
      .loginAs(actor)
      .json({ diagnosis: 'Editado por mí' })

    response.assertStatus(200)
    assert.equal(response.body().data.diagnosis, 'Editado por mí')
  })

  test('403 si el actor tiene medical_histories.update.own pero intenta editar el historial de otro doctor', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['medical_histories.update.own'])
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

    const response = await client
      .put(`/api/medical_histories/${target.id}`)
      .loginAs(actor)
      .json({ diagnosis: 'No permitido' })

    response.assertStatus(403)
  })

  test('404 si el historial no existe', async ({ client }) => {
    const actor = await createUserWithPermissions(['medical_histories.update.any'])
    const response = await client
      .put('/api/medical_histories/999999')
      .loginAs(actor)
      .json({ diagnosis: 'X' })

    response.assertStatus(404)
  })
})
