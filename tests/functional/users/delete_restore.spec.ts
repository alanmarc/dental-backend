import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'

test.group('Users delete/restore', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 sin permiso users.delete', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const target = await createUserWithPermissions([], actor.branchId)

    const response = await client.delete(`/api/users/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y hace soft delete con el permiso correcto', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['users.delete'])
    const target = await createUserWithPermissions([], actor.branchId)

    const response = await client.delete(`/api/users/${target.id}`).loginAs(actor)
    response.assertStatus(200)
    assert.isNotNull(response.body().data.deletedAt)
  })

  test('403 si el actor tiene users.delete pero el target pertenece a otro hospital', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['users.delete'])
    const target = await createUserWithPermissions([]) // different hospital

    const response = await client.delete(`/api/users/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  // 🔴 Valida la regla de "no auto-eliminarse"
  test('403 si el actor intenta eliminarse a sí mismo', async ({ client }) => {
    const actor = await createUserWithPermissions(['users.delete'])
    const response = await client.delete(`/api/users/${actor.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('403 sin permiso users.restore', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const target = await createUserWithPermissions([], actor.branchId)

    const response = await client.put(`/api/users/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 restaura con el permiso correcto', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['users.delete', 'users.restore'])
    const target = await createUserWithPermissions([], actor.branchId)

    await client.delete(`/api/users/${target.id}`).loginAs(actor)
    const response = await client.put(`/api/users/${target.id}/restore`).loginAs(actor)

    response.assertStatus(200)
    assert.isNull(response.body().data.deletedAt)
  })

  test('403 si el actor tiene users.restore pero el target pertenece a otro hospital', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['users.delete', 'users.restore'])
    const target = await createUserWithPermissions([]) // different hospital

    // Since we can't delete cross-hospital either, we have to mark the user as deleted via DB directly or via the other hospital actor
    const targetHospitalActor = await createUserWithPermissions(['users.delete'], target.branchId)
    await client.delete(`/api/users/${target.id}`).loginAs(targetHospitalActor)

    const response = await client.put(`/api/users/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })
})
