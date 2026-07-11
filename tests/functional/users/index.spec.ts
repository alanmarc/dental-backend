import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { UserFactory } from '#database/factories/user_factory'

test.group('Users index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 sin permiso users.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/users').loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y respeta paginación con users.view', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['users.view'])
    for (let i = 0; i < 15; i++) {
      await UserFactory.merge({ roleId: actor.roleId, branchId: actor.branchId }).create()
    }

    const response = await client.get('/api/users?page=1&limit=5').loginAs(actor)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 5)
  })

  test('200 y filtra por hospital si es admin con users.view', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['users.view'])

    // Usuario en el mismo hospital (misma branch)
    const sameUser = await UserFactory.merge({
      roleId: actor.roleId,
      branchId: actor.branchId,
    }).create()

    // Usuario en otro hospital/branch
    const otherDoctor = await createUserWithPermissions([])

    const response = await client.get('/api/users').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((u: any) => u.id)
    assert.include(ids, actor.id)
    assert.include(ids, sameUser.id)
    assert.notInclude(ids, otherDoctor.id)
  })

  test('200 y ve todo si es super_admin con users.view.any', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['users.view', 'users.view.any'])

    // Usuario en otro hospital/branch
    const otherDoctor = await createUserWithPermissions([])

    const response = await client.get('/api/users').loginAs(actor)

    response.assertStatus(200)
    const ids = response.body().data.map((u: any) => u.id)
    assert.include(ids, actor.id)
    assert.include(ids, otherDoctor.id)
  })
})
