import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'
import Product from '#models/product'
import Supplier from '#models/supplier'
import Purchase from '#models/purchase'
import PurchaseItem from '#models/purchase_item'
import Inventory from '#models/inventory'

test.group('Purchases receive', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene permisos para recibir', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions([], branch.id)
    const supplier = await Supplier.create({ hospitalId: hospital.id, name: 'Supp' })

    const purchase = await Purchase.create({
      supplierId: supplier.id,
      branchId: branch.id,
      createdBy: actor.id,
      status: 'draft',
    })

    const response = await client.put(`/api/purchases/${purchase.id}/receive`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 al recibir actualiza estado, fecha de recepción y stock', async ({
    client,
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['purchases.receive.own'], branch.id)

    const supplier = await Supplier.create({ hospitalId: hospital.id, name: 'Supp' })
    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })

    const purchase = await Purchase.create({
      supplierId: supplier.id,
      branchId: branch.id,
      createdBy: actor.id,
      status: 'draft',
    })

    await PurchaseItem.create({
      purchaseId: purchase.id,
      productId: product.id,
      quantity: 15,
      unitCost: 10,
    })

    const response = await client.put(`/api/purchases/${purchase.id}/receive`).loginAs(actor)
    response.assertStatus(200)
    assert.equal(response.body().data.status, 'received')
    assert.isNotNull(response.body().data.receivedAt)

    // Check inventory update
    const inventory = await Inventory.query()
      .where('branch_id', branch.id)
      .where('product_id', product.id)
      .firstOrFail()

    assert.equal(inventory.quantity, 15)

    // Check movements generated
    await purchase.load('movements')
    assert.lengthOf(purchase.movements, 1)
    assert.equal(purchase.movements[0].type, 'purchase')
    assert.equal(purchase.movements[0].quantity, 15)
  })

  test('422 al recibir una compra ya recibida', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['purchases.receive.own'], branch.id)

    const supplier = await Supplier.create({ hospitalId: hospital.id, name: 'Supp' })

    const purchase = await Purchase.create({
      supplierId: supplier.id,
      branchId: branch.id,
      createdBy: actor.id,
      status: 'received',
    })

    const response = await client.put(`/api/purchases/${purchase.id}/receive`).loginAs(actor)
    response.assertStatus(422)
    response.assertTextIncludes('Solo se puede recibir una compra en borrador')
  })
})
