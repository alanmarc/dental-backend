import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import ProductPolicy from '#policies/product_policy'
import Hospital from '#models/hospital'
import Product from '#models/product'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'

test.group('ProductPolicy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('permite view si tiene products.view', async ({ assert }) => {
    const actor = await createUserWithPermissions(['products.view'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new ProductPolicy()
    assert.isTrue(await policy.view(actor))
  })

  test('permite create si tiene products.create', async ({ assert }) => {
    const actor = await createUserWithPermissions(['products.create'])
    await actor.load('role', (q) => q.preload('permissions'))

    const policy = new ProductPolicy()
    assert.isTrue(await policy.create(actor))
  })

  test('permite update si el actor y el target pertenecen al mismo hospital', async ({
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Mismo' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['products.update'], branch.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const product = await Product.create({
      hospitalId: hospital.id,
      name: 'Prod',
    })

    const policy = new ProductPolicy()
    assert.isTrue(await policy.update(actor, product))
  })

  test('niega update si el actor y el target pertenecen a distinto hospital', async ({
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['products.update'], branchA.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const hospitalB = await Hospital.create({ name: 'B' })
    const product = await Product.create({
      hospitalId: hospitalB.id,
      name: 'Prod',
    })

    const policy = new ProductPolicy()
    assert.isFalse(await policy.update(actor, product))
  })

  test('permite delete si el actor y el target pertenecen al mismo hospital', async ({
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Mismo' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['products.delete'], branch.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const product = await Product.create({
      hospitalId: hospital.id,
      name: 'Prod',
    })

    const policy = new ProductPolicy()
    assert.isTrue(await policy.delete(actor, product))
  })

  test('niega delete si el actor y el target pertenecen a distinto hospital', async ({
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['products.delete'], branchA.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const hospitalB = await Hospital.create({ name: 'B' })
    const product = await Product.create({
      hospitalId: hospitalB.id,
      name: 'Prod',
    })

    const policy = new ProductPolicy()
    assert.isFalse(await policy.delete(actor, product))
  })

  test('permite restore si el actor y el target pertenecen al mismo hospital', async ({
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Mismo' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['products.restore'], branch.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const product = await Product.create({
      hospitalId: hospital.id,
      name: 'Prod',
    })

    const policy = new ProductPolicy()
    assert.isTrue(await policy.restore(actor, product))
  })

  test('niega restore si el actor y el target pertenecen a distinto hospital', async ({
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['products.restore'], branchA.id)
    await actor.load('role', (q) => q.preload('permissions'))
    await actor.load('branch')

    const hospitalB = await Hospital.create({ name: 'B' })
    const product = await Product.create({
      hospitalId: hospitalB.id,
      name: 'Prod',
    })

    const policy = new ProductPolicy()
    assert.isFalse(await policy.restore(actor, product))
  })
})
