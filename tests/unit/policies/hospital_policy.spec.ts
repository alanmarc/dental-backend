import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import HospitalPolicy from '#policies/hospital_policy'
import { createUserWithPermissions } from '#tests/helpers/permissions'

test.group('HospitalPolicy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('permite ver si tiene hospitals.view', async ({ assert }) => {
    const actor = await createUserWithPermissions(['hospitals.view'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new HospitalPolicy()
    assert.isTrue(await policy.view(actor))
  })

  test('niega ver si no tiene hospitals.view', async ({ assert }) => {
    const actor = await createUserWithPermissions([])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new HospitalPolicy()
    assert.isFalse(await policy.view(actor))
  })

  test('permite crear si tiene hospitals.create', async ({ assert }) => {
    const actor = await createUserWithPermissions(['hospitals.create'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new HospitalPolicy()
    assert.isTrue(await policy.create(actor))
  })

  test('permite actualizar si tiene hospitals.update', async ({ assert }) => {
    const actor = await createUserWithPermissions(['hospitals.update'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new HospitalPolicy()
    assert.isTrue(await policy.update(actor))
  })

  test('permite eliminar si tiene hospitals.delete', async ({ assert }) => {
    const actor = await createUserWithPermissions(['hospitals.delete'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new HospitalPolicy()
    assert.isTrue(await policy.delete(actor))
  })

  test('permite restaurar si tiene hospitals.restore', async ({ assert }) => {
    const actor = await createUserWithPermissions(['hospitals.restore'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new HospitalPolicy()
    assert.isTrue(await policy.restore(actor))
  })
})
