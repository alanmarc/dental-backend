import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'
import Product from '#models/product'
import Inventory from '#models/inventory'

test.group('Inventory index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene inventory.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/inventory').loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y devuelve solo saldos del mismo hospital si no tiene view.any', async ({
    client,
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['inventory.view'], branchA.id)

    const productA = await Product.create({ hospitalId: hospitalA.id, name: 'Prod A' })
    const invA = await Inventory.create({
      branchId: branchA.id,
      productId: productA.id,
      quantity: 10,
    })

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const branchB = await createBranch(hospitalB.id)
    const productB = await Product.create({ hospitalId: hospitalB.id, name: 'Prod B' })
    const invB = await Inventory.create({
      branchId: branchB.id,
      productId: productB.id,
      quantity: 20,
    })

    const response = await client.get('/api/inventory').loginAs(actor)
    response.assertStatus(200)

    const ids = response.body().data.map((i: any) => i.id)
    assert.include(ids, invA.id)
    assert.notInclude(ids, invB.id)
  })

  test('200 y devuelve todos los saldos si tiene view.any', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['inventory.view', 'inventory.view.any'])

    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const branchA = await createBranch(hospitalA.id)
    const productA = await Product.create({ hospitalId: hospitalA.id, name: 'Prod A' })
    const invA = await Inventory.create({
      branchId: branchA.id,
      productId: productA.id,
      quantity: 10,
    })

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const branchB = await createBranch(hospitalB.id)
    const productB = await Product.create({ hospitalId: hospitalB.id, name: 'Prod B' })
    const invB = await Inventory.create({
      branchId: branchB.id,
      productId: productB.id,
      quantity: 20,
    })

    const response = await client.get('/api/inventory').loginAs(actor)
    response.assertStatus(200)

    const ids = response.body().data.map((i: any) => i.id)
    assert.include(ids, invA.id)
    assert.include(ids, invB.id)
  })
})
