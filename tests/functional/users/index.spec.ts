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
    await UserFactory.merge({ roleId: actor.roleId }).createMany(15)

    const response = await client.get('/api/users?page=1&limit=5').loginAs(actor)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 5)
  })
})
