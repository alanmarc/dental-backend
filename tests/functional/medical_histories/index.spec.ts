import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'
import { AppointmentFactory } from '#database/factories/appointment_factory'
import { MedicalHistoryFactory } from '#database/factories/medical_history_factory'

test.group('Medical histories index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 sin permiso medical_histories.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/medical_histories').loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y respeta paginación con medical_histories.view', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['medical_histories.view'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const appointment = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    // Crear historiales de prueba de forma secuencial para evitar advertencias de pg concurrente
    for (let i = 0; i < 15; i++) {
      await MedicalHistoryFactory.merge({
        userId: actor.id,
        patientId: patient.id,
        appointmentId: appointment.id,
        branchId: actor.branchId,
      }).create()
    }

    const response = await client.get('/api/medical_histories?page=1&limit=5').loginAs(actor)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 5)
  })

  test('200 y filtra por hospital si es admin con medical_histories.view', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['medical_histories.view'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const appointment = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    // Historial médico en el mismo hospital
    const sameHistory = await MedicalHistoryFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      appointmentId: appointment.id,
      branchId: actor.branchId,
    }).create()

    // Historial médico en otro hospital
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
    const otherHistory = await MedicalHistoryFactory.merge({
      userId: otherDoctor.id,
      patientId: otherPatient.id,
      appointmentId: otherAppointment.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client.get('/api/medical_histories').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((h: any) => h.id)
    assert.include(ids, sameHistory.id)
    assert.notInclude(ids, otherHistory.id)
  })

  test('200 y ve todo si es super_admin con medical_histories.view.any', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions([
      'medical_histories.view',
      'medical_histories.view.any',
    ])

    // Historial médico en otro hospital
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
    const otherHistory = await MedicalHistoryFactory.merge({
      userId: otherDoctor.id,
      patientId: otherPatient.id,
      appointmentId: otherAppointment.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client.get('/api/medical_histories').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((h: any) => h.id)
    assert.include(ids, otherHistory.id)
  })
})
