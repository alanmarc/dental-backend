import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import UserPolicy from '#policies/user_policy'
import { createUserWithPermissions } from '#tests/helpers/permissions'

test.group('UserPolicy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // --- UPDATE TESTS ---
  test('permite update si el actor tiene users.update y el target es del mismo hospital', async ({
    assert,
  }) => {
    const actor = await createUserWithPermissions(['users.update'])
    const target = await createUserWithPermissions([], actor.branchId)
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isTrue(await policy.update(actor, target))
  })

  test('niega update si el actor tiene users.update pero el target es de otro hospital', async ({
    assert,
  }) => {
    const actor = await createUserWithPermissions(['users.update'])
    const target = await createUserWithPermissions([]) // different hospital
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isFalse(await policy.update(actor, target))
  })

  test('niega update si el actor no tiene el permiso', async ({ assert }) => {
    const actor = await createUserWithPermissions([])
    const target = await createUserWithPermissions([], actor.branchId)
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isFalse(await policy.update(actor, target))
  })

  // --- DELETE TESTS ---
  test('permite delete si el actor tiene users.delete y el target es del mismo hospital', async ({
    assert,
  }) => {
    const actor = await createUserWithPermissions(['users.delete'])
    const target = await createUserWithPermissions([], actor.branchId)
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isTrue(await policy.delete(actor, target))
  })

  test('niega delete si el actor tiene users.delete pero el target es de otro hospital', async ({
    assert,
  }) => {
    const actor = await createUserWithPermissions(['users.delete'])
    const target = await createUserWithPermissions([]) // different hospital
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isFalse(await policy.delete(actor, target))
  })

  test('niega delete sobre uno mismo aunque tenga el permiso', async ({ assert }) => {
    const actor = await createUserWithPermissions(['users.delete'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isFalse(await policy.delete(actor, actor))
  })

  // --- RESTORE TESTS ---
  test('permite restore si el actor tiene users.restore y el target es del mismo hospital', async ({
    assert,
  }) => {
    const actor = await createUserWithPermissions(['users.restore'])
    const target = await createUserWithPermissions([], actor.branchId)
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isTrue(await policy.restore(actor, target))
  })

  test('niega restore si el actor tiene users.restore pero el target es de otro hospital', async ({
    assert,
  }) => {
    const actor = await createUserWithPermissions(['users.restore'])
    const target = await createUserWithPermissions([]) // different hospital
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isFalse(await policy.restore(actor, target))
  })

  // --- ASSIGNROLE TESTS ---
  test('assignRole permite si el actor tiene el permiso y el target es del mismo hospital', async ({
    assert,
  }) => {
    const actor = await createUserWithPermissions(['users.assign_role'])
    const target = await createUserWithPermissions([], actor.branchId)
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isTrue(await policy.assignRole(actor, target))
  })

  test('assignRole niega si el actor tiene el permiso pero el target es de otro hospital', async ({
    assert,
  }) => {
    const actor = await createUserWithPermissions(['users.assign_role'])
    const target = await createUserWithPermissions([]) // different hospital
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isFalse(await policy.assignRole(actor, target))
  })

  test('assignRole niega si el actor se autoasigna un rol', async ({ assert }) => {
    const actor = await createUserWithPermissions(['users.assign_role'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new UserPolicy()
    assert.isFalse(await policy.assignRole(actor, actor))
  })
})
