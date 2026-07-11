import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'

test.group('Branches delete/restore', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el admin con branches.delete.own intenta eliminar una branch de otro hospital', async ({
    client,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hospital A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['branches.delete.own'], branchA.id)

    const hospitalB = await Hospital.create({ name: 'Hospital B' })
    const branchB = await createBranch(hospitalB.id)

    const response = await client.delete(`/api/branches/${branchB.id}`).loginAs(actor)

    response.assertStatus(403)
  })

  test('200 si el admin con branches.delete.own elimina sucursal de su propio hospital', async ({
    client,
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hospital A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['branches.delete.own'], branchA.id)

    const response = await client.delete(`/api/branches/${branchA.id}`).loginAs(actor)

    response.assertStatus(200)
    assert.isNotNull(response.body().data.deletedAt)
  })

  test('200 si el admin con branches.restore.own restaura sucursal de su propio hospital', async ({
    client,
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hospital A' })
    const branchA = await createBranch(hospitalA.id)
    branchA.deletedAt = null
    await branchA.save()

    const actor = await createUserWithPermissions(['branches.restore.own'], branchA.id)

    const response = await client.put(`/api/branches/${branchA.id}/restore`).loginAs(actor)

    response.assertStatus(200)
    assert.isNull(response.body().data.deletedAt)
  })
})
