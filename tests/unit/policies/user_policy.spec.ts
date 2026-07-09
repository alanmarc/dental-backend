// tests/unit/policies/user_policy.spec.ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import UserPolicy from '#policies/user_policy'
import { createUserWithPermissions } from '#tests/helpers/permissions'

test.group('UserPolicy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('permite update si el actor tiene users.update', async ({ assert }) => {
    const actor = await createUserWithPermissions(['users.update'])
    const target = await createUserWithPermissions([])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isTrue(await policy.update(actor, target))
  })

  test('niega update si el actor no tiene el permiso', async ({ assert }) => {
    const actor = await createUserWithPermissions([])
    const target = await createUserWithPermissions([])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isFalse(await policy.update(actor, target))
  })

  test('niega delete sobre uno mismo aunque tenga el permiso', async ({ assert }) => {
    const actor = await createUserWithPermissions(['users.delete'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isFalse(await policy.delete(actor, actor))
  })

  test('assignRole niega si el actor se autoasigna un rol', async ({ assert }) => {
    const actor = await createUserWithPermissions(['users.assign_role'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isFalse(await policy.assignRole(actor, actor))
  })

  test('assignRole permite si el actor tiene el permiso y no es el target', async ({ assert }) => {
    const actor = await createUserWithPermissions(['users.assign_role'])
    const target = await createUserWithPermissions([])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isTrue(await policy.assignRole(actor, target))
  })
})
