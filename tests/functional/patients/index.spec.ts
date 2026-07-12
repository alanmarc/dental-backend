import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'
import { DateTime } from 'luxon'

test.group('Patients index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 sin permiso patients.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/patients').loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y respeta paginación con patients.view', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['patients.view'])

    // Crear algunos pacientes de prueba asignados al actor de forma secuencial
    for (let i = 0; i < 15; i++) {
      await PatientFactory.merge({ userId: actor.id, branchId: actor.branchId }).create()
    }

    const response = await client.get('/api/patients?page=1&limit=5').loginAs(actor)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 5)
  })

  test('200 y filtra por hospital si es admin con patients.view', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['patients.view'])

    // Paciente en el mismo hospital/branch
    const samePatient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    // Paciente en otro hospital/branch
    const otherDoctor = await createUserWithPermissions([])
    const otherPatient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client.get('/api/patients').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((p: any) => p.id)
    assert.include(ids, samePatient.id)
    assert.notInclude(ids, otherPatient.id)
  })

  test('200 y ve todo si es super_admin con patients.view.any', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['patients.view', 'patients.view.any'])

    // Paciente en otro hospital/branch
    const otherDoctor = await createUserWithPermissions([])
    const otherPatient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client.get('/api/patients').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((p: any) => p.id)
    assert.include(ids, otherPatient.id)
  })

  test('200 y excluye pacientes soft-eliminados', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['patients.view'])

    const patientA = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const patientB = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    // Soft-eliminar patientB
    patientB.deletedAt = DateTime.utc()
    await patientB.save()

    const response = await client.get('/api/patients').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((p: any) => p.id)
    assert.include(ids, patientA.id)
    assert.notInclude(ids, patientB.id)
  })
})
