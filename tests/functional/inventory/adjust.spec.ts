import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'
import Product from '#models/product'

test.group('Inventory adjust', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene permisos de ajuste', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.post('/api/inventory/adjust').loginAs(actor).json({
      productId: 1,
      branchId: 1,
      quantity: 5,
      direction: 'in',
    })
    response.assertStatus(403)
  })

  test('422 si tiene adjustOwn pero intenta ajustar otra sucursal', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const ownBranch = await createBranch(hospital.id)
    const otherBranch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['inventory.adjust.own'], ownBranch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })

    const response = await client.post('/api/inventory/adjust').loginAs(actor).json({
      productId: product.id,
      branchId: otherBranch.id,
      quantity: 5,
      direction: 'in',
    })

    response.assertStatus(422)
    response.assertTextIncludes('No puedes ajustar inventario de otra sucursal')
  })

  test('200 si tiene adjustOwn y ajusta su propia sucursal', async ({ client, assert }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const ownBranch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['inventory.adjust.own'], ownBranch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })

    const response = await client.post('/api/inventory/adjust').loginAs(actor).json({
      productId: product.id,
      branchId: ownBranch.id,
      quantity: 5,
      direction: 'in',
    })

    response.assertStatus(200)
    assert.equal(response.body().data.newQuantity, 5)
    assert.equal(response.body().data.movement.type, 'adjustment_in')
  })

  test('200 si tiene adjustAny y ajusta cualquier sucursal de su hospital', async ({
    client,
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const ownBranch = await createBranch(hospital.id)
    const otherBranch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['inventory.adjust.any'], ownBranch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })

    const response = await client.post('/api/inventory/adjust').loginAs(actor).json({
      productId: product.id,
      branchId: otherBranch.id,
      quantity: 10,
      direction: 'in',
    })

    response.assertStatus(200)
    assert.equal(response.body().data.newQuantity, 10)
  })

  test('422 si resulta en stock negativo y el producto no lo permite', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const ownBranch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['inventory.adjust.own'], ownBranch.id)

    const product = await Product.create({
      hospitalId: hospital.id,
      name: 'Prod',
      allowsNegativeStock: false,
    })

    const response = await client.post('/api/inventory/adjust').loginAs(actor).json({
      productId: product.id,
      branchId: ownBranch.id,
      quantity: 5,
      direction: 'out',
    })

    response.assertStatus(422)
    response.assertTextIncludes('Stock insuficiente')
  })
})
