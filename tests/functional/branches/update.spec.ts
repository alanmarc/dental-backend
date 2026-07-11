import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'

test.group('Branches update', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el admin con branches.update.own intenta editar una branch de otro hospital', async ({
    client,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hospital A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['branches.update.own'], branchA.id)

    const hospitalB = await Hospital.create({ name: 'Hospital B' })
    const branchB = await createBranch(hospitalB.id)

    const response = await client
      .put(`/api/branches/${branchB.id}`)
      .loginAs(actor)
      .json({ name: 'Sucursal B Modificada' })

    response.assertStatus(403)
  })

  test('200 si el admin con branches.update.own edita una branch de su propio hospital', async ({
    client,
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hospital A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['branches.update.own'], branchA.id)

    const branchA2 = await createBranch(hospitalA.id)

    const response = await client
      .put(`/api/branches/${branchA2.id}`)
      .loginAs(actor)
      .json({ name: 'Sucursal A2 Modificada' })

    response.assertStatus(200)
    assert.equal(response.body().data.name, 'Sucursal A2 Modificada')
  })

  test('200 si super_admin con branches.update.any edita cualquier sucursal', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['branches.update.any'])
    const branch = await createBranch()

    const response = await client
      .put(`/api/branches/${branch.id}`)
      .loginAs(actor)
      .json({ name: 'Sucursal Modificada por Super' })

    response.assertStatus(200)
    assert.equal(response.body().data.name, 'Sucursal Modificada por Super')
  })

  test('422 si el admin con branches.update.own intenta cambiar hospitalId a otro hospital', async ({
    client,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hospital A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['branches.update.own'], branchA.id)

    const hospitalB = await Hospital.create({ name: 'Hospital B' })

    const response = await client
      .put(`/api/branches/${branchA.id}`)
      .loginAs(actor)
      .json({ hospitalId: hospitalB.id })

    response.assertStatus(422)
    response.assertTextIncludes('No puedes cambiar la sucursal a otro hospital')
  })
})
