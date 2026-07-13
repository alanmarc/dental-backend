import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import SupplierPolicy from '#policies/supplier_policy'
import Hospital from '#models/hospital'
import Supplier from '#models/supplier'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'

test.group('SupplierPolicy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('permite view si tiene suppliers.view', async ({ assert }) => {
    const actor = await createUserWithPermissions(['suppliers.view'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new SupplierPolicy()
    assert.isTrue(await policy.view(actor))
  })

  test('permite create si tiene suppliers.create', async ({ assert }) => {
    const actor = await createUserWithPermissions(['suppliers.create'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new SupplierPolicy()
    assert.isTrue(await policy.create(actor))
  })

  test('permite update si el actor y el target pertenecen al mismo hospital', async ({
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Mismo' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['suppliers.update'], branch.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const supplier = await Supplier.create({
      hospitalId: hospital.id,
      name: 'Supp',
    })

    const policy = new SupplierPolicy()
    assert.isTrue(await policy.update(actor, supplier))
  })

  test('niega update si el actor y el target pertenecen a distinto hospital', async ({
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['suppliers.update'], branchA.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const hospitalB = await Hospital.create({ name: 'B' })
    const supplier = await Supplier.create({
      hospitalId: hospitalB.id,
      name: 'Supp',
    })

    const policy = new SupplierPolicy()
    assert.isFalse(await policy.update(actor, supplier))
  })

  test('permite delete si el actor y el target pertenecen al mismo hospital', async ({
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Mismo' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['suppliers.delete'], branch.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const supplier = await Supplier.create({
      hospitalId: hospital.id,
      name: 'Supp',
    })

    const policy = new SupplierPolicy()
    assert.isTrue(await policy.delete(actor, supplier))
  })

  test('niega delete si el actor y el target pertenecen a distinto hospital', async ({
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['suppliers.delete'], branchA.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const hospitalB = await Hospital.create({ name: 'B' })
    const supplier = await Supplier.create({
      hospitalId: hospitalB.id,
      name: 'Supp',
    })

    const policy = new SupplierPolicy()
    assert.isFalse(await policy.delete(actor, supplier))
  })

  test('permite restore si el actor y el target pertenecen al mismo hospital', async ({
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Mismo' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['suppliers.restore'], branch.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const supplier = await Supplier.create({
      hospitalId: hospital.id,
      name: 'Supp',
    })

    const policy = new SupplierPolicy()
    assert.isTrue(await policy.restore(actor, supplier))
  })

  test('niega restore si el actor y el target pertenecen a distinto hospital', async ({
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['suppliers.restore'], branchA.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const hospitalB = await Hospital.create({ name: 'B' })
    const supplier = await Supplier.create({
      hospitalId: hospitalB.id,
      name: 'Supp',
    })

    const policy = new SupplierPolicy()
    assert.isFalse(await policy.restore(actor, supplier))
  })
})
