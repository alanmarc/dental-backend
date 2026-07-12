import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PrescriptionFactory } from '#database/factories/prescription_factory'
import { PatientFactory } from '#database/factories/patient_factory'
import { DateTime } from 'luxon'

test.group('Prescriptions index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 sin permiso prescriptions.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/prescriptions').loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y respeta paginación con prescriptions.view', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['prescriptions.view'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    for (let i = 0; i < 15; i++) {
      await PrescriptionFactory.merge({
        userId: actor.id,
        patientId: patient.id,
        branchId: actor.branchId,
      }).create()
    }

    const response = await client.get('/api/prescriptions?page=1&limit=5').loginAs(actor)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 5)
  })

  test('200 y filtra por hospital si es admin con prescriptions.view', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['prescriptions.view'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const samePrescription = await PrescriptionFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const otherDoctor = await createUserWithPermissions([])
    const otherPatient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const otherPrescription = await PrescriptionFactory.merge({
      userId: otherDoctor.id,
      patientId: otherPatient.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client.get('/api/prescriptions').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((p: any) => p.id)
    assert.include(ids, samePrescription.id)
    assert.notInclude(ids, otherPrescription.id)
  })

  test('200 y ve todo si es super_admin con prescriptions.view.any', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['prescriptions.view', 'prescriptions.view.any'])

    const otherDoctor = await createUserWithPermissions([])
    const otherPatient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const otherPrescription = await PrescriptionFactory.merge({
      userId: otherDoctor.id,
      patientId: otherPatient.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client.get('/api/prescriptions').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((p: any) => p.id)
    assert.include(ids, otherPrescription.id)
  })

  test('200 y excluye recetas soft-eliminadas', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['prescriptions.view'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const activePrescription = await PrescriptionFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const softDeletedPrescription = await PrescriptionFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
      deletedAt: DateTime.utc(),
    }).create()

    const response = await client.get('/api/prescriptions').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((p: any) => p.id)
    assert.include(ids, activePrescription.id)
    assert.notInclude(ids, softDeletedPrescription.id)
  })
})
