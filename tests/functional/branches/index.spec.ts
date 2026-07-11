import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'

test.group('Branches index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene branches.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/branches').loginAs(actor)

    response.assertStatus(403)
  })

  test('200 y devuelve solo las sucursales de su propio hospital si es admin', async ({
    client,
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hospital A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['branches.view'], branchA.id)

    const hospitalB = await Hospital.create({ name: 'Hospital B' })
    const branchB = await createBranch(hospitalB.id)

    const response = await client.get('/api/branches').loginAs(actor)

    response.assertStatus(200)
    // El admin de Hospital A solo debe ver las branches de Hospital A
    const branchIds = response.body().data.map((b: any) => b.id)
    assert.include(branchIds, branchA.id)
    assert.notInclude(branchIds, branchB.id)
  })

  test('200 y devuelve todas las sucursales de todos los hospitales si es super_admin', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['branches.view', 'branches.view.any'])

    const hospitalA = await Hospital.create({ name: 'Hospital A' })
    const branchA = await createBranch(hospitalA.id)

    const hospitalB = await Hospital.create({ name: 'Hospital B' })
    const branchB = await createBranch(hospitalB.id)

    const response = await client.get('/api/branches').loginAs(actor)

    response.assertStatus(200)
    const branchIds = response.body().data.map((b: any) => b.id)
    assert.include(branchIds, branchA.id)
    assert.include(branchIds, branchB.id)
  })
})
