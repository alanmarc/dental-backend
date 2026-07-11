import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'

test.group('Patients index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 sin permiso patients.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/patients').loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y respeta paginación con patients.view', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['patients.view'])

    // Crear algunos pacientes de prueba asignados al actor
    await PatientFactory.merge({ userId: actor.id, branchId: actor.branchId }).createMany(15)

    const response = await client.get('/api/patients?page=1&limit=5').loginAs(actor)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 5)
  })
})
