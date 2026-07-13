import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'
import Product from '#models/product'
import InventoryMovement from '#models/inventory_movement'

test.group('Inventory movements index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene inventory.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/inventory/movements').loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y devuelve solo movimientos de su hospital si no tiene view.any', async ({
    client,
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['inventory.view'], branchA.id)

    const productA = await Product.create({ hospitalId: hospitalA.id, name: 'Prod A' })
    const movA = await InventoryMovement.create({
      branchId: branchA.id,
      productId: productA.id,
      type: 'adjustment_in',
      quantity: 10,
      userId: actor.id,
    })

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const branchB = await createBranch(hospitalB.id)
    const productB = await Product.create({ hospitalId: hospitalB.id, name: 'Prod B' })
    const movB = await InventoryMovement.create({
      branchId: branchB.id,
      productId: productB.id,
      type: 'adjustment_in',
      quantity: 20,
      userId: actor.id,
    })

    const response = await client.get('/api/inventory/movements').loginAs(actor)
    response.assertStatus(200)

    const ids = response.body().data.map((m: any) => m.id)
    assert.include(ids, movA.id)
    assert.notInclude(ids, movB.id)
  })

  test('200 y devuelve todos los movimientos si tiene view.any', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['inventory.view', 'inventory.view.any'])

    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const branchA = await createBranch(hospitalA.id)
    const productA = await Product.create({ hospitalId: hospitalA.id, name: 'Prod A' })
    const movA = await InventoryMovement.create({
      branchId: branchA.id,
      productId: productA.id,
      type: 'adjustment_in',
      quantity: 10,
      userId: actor.id,
    })

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const branchB = await createBranch(hospitalB.id)
    const productB = await Product.create({ hospitalId: hospitalB.id, name: 'Prod B' })
    const movB = await InventoryMovement.create({
      branchId: branchB.id,
      productId: productB.id,
      type: 'adjustment_in',
      quantity: 20,
      userId: actor.id,
    })

    const response = await client.get('/api/inventory/movements').loginAs(actor)
    response.assertStatus(200)

    const ids = response.body().data.map((m: any) => m.id)
    assert.include(ids, movA.id)
    assert.include(ids, movB.id)
  })
})
