import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import BranchPolicy from '#policies/branch_policy'
import Hospital from '#models/hospital'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'

test.group('BranchPolicy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('permite ver si tiene branches.view', async ({ assert }) => {
    const actor = await createUserWithPermissions(['branches.view'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new BranchPolicy()
    assert.isTrue(await policy.view(actor))
  })

  test('permite crear si tiene branches.create.any o own', async ({ assert }) => {
    const actor = await createUserWithPermissions(['branches.create.own'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new BranchPolicy()
    assert.isTrue(await policy.create(actor))
  })

  test('permite update si tiene branches.update.any en cualquier sucursal', async ({ assert }) => {
    const actor = await createUserWithPermissions(['branches.update.any'])
    await actor.load('role', (q) => q.preload('permissions'))

    const otherHospital = await Hospital.create({ name: 'Otro' })
    const branch = await createBranch(otherHospital.id)

    const policy = new BranchPolicy()
    assert.isTrue(await policy.update(actor, branch))
  })

  test('permite update si tiene branches.update.own y pertenece al mismo hospital', async ({
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Mismo' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['branches.update.own'], branch.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const targetBranch = await createBranch(hospital.id)

    const policy = new BranchPolicy()
    assert.isTrue(await policy.update(actor, targetBranch))
  })

  test('niega update si tiene branches.update.own pero pertenece a distinto hospital', async ({
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['branches.update.own'], branchA.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const hospitalB = await Hospital.create({ name: 'B' })
    const branchB = await createBranch(hospitalB.id)

    const policy = new BranchPolicy()
    assert.isFalse(await policy.update(actor, branchB))
  })

  test('permite delete si tiene branches.delete.any', async ({ assert }) => {
    const actor = await createUserWithPermissions(['branches.delete.any'])
    await actor.load('role', (q) => q.preload('permissions'))

    const branch = await createBranch()

    const policy = new BranchPolicy()
    assert.isTrue(await policy.delete(actor, branch))
  })

  test('permite delete si tiene branches.delete.own y es del mismo hospital', async ({
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'H' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['branches.delete.own'], branch.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const policy = new BranchPolicy()
    assert.isTrue(await policy.delete(actor, branch))
  })

  test('niega delete si tiene branches.delete.own pero es de diferente hospital', async ({
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['branches.delete.own'], branchA.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const hospitalB = await Hospital.create({ name: 'B' })
    const branchB = await createBranch(hospitalB.id)

    const policy = new BranchPolicy()
    assert.isFalse(await policy.delete(actor, branchB))
  })
})
