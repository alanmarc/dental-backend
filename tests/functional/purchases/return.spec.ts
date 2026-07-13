import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'
import Product from '#models/product'
import Supplier from '#models/supplier'
import Purchase from '#models/purchase'
import PurchaseItem from '#models/purchase_item'
import Inventory from '#models/inventory'

test.group('Purchases return', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene permisos para retornar/recibir', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions([], branch.id)
    const supplier = await Supplier.create({ hospitalId: hospital.id, name: 'Supp' })

    const purchase = await Purchase.create({
      supplierId: supplier.id,
      branchId: branch.id,
      createdBy: actor.id,
      status: 'received',
    })

    const response = await client
      .post(`/api/purchases/${purchase.id}/return`)
      .loginAs(actor)
      .json({ items: [] })
    response.assertStatus(403)
  })

  test('200 devolución parcial genera movimiento purchase_return y reduce saldo', async ({
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
      status: 'received',
    })

    const item = await PurchaseItem.create({
      purchaseId: purchase.id,
      productId: product.id,
      quantity: 10,
      unitCost: 5,
    })

    // Prepare initial inventory quantity
    await Inventory.create({
      branchId: branch.id,
      productId: product.id,
      quantity: 10,
    })

    const response = await client
      .post(`/api/purchases/${purchase.id}/return`)
      .loginAs(actor)
      .json({
        items: [{ purchaseItemId: item.id, quantity: 4 }],
      })

    response.assertStatus(200)

    // Check inventory reduced
    const inventory = await Inventory.query()
      .where('branch_id', branch.id)
      .where('product_id', product.id)
      .firstOrFail()
    assert.equal(inventory.quantity, 6)

    // Check movement generated
    await purchase.load('movements')
    const returnMovement = purchase.movements.find((m) => m.type === 'purchase_return')
    assert.isDefined(returnMovement)
    assert.equal(returnMovement!.quantity, 4)
  })

  test('422 devolución que excede el saldo disponible en un producto sin allowsNegativeStock', async ({
    client,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['purchases.receive.own'], branch.id)

    const supplier = await Supplier.create({ hospitalId: hospital.id, name: 'Supp' })
    const product = await Product.create({
      hospitalId: hospital.id,
      name: 'Prod',
      allowsNegativeStock: false,
    })

    const purchase = await Purchase.create({
      supplierId: supplier.id,
      branchId: branch.id,
      createdBy: actor.id,
      status: 'received',
    })

    const item = await PurchaseItem.create({
      purchaseId: purchase.id,
      productId: product.id,
      quantity: 10,
      unitCost: 5,
    })

    // Setup inventory with less than the return quantity
    await Inventory.create({
      branchId: branch.id,
      productId: product.id,
      quantity: 3, // only 3 in stock, but trying to return 5
    })

    const response = await client
      .post(`/api/purchases/${purchase.id}/return`)
      .loginAs(actor)
      .json({
        items: [{ purchaseItemId: item.id, quantity: 5 }],
      })

    response.assertStatus(422)
    response.assertTextIncludes('Stock insuficiente')
  })
})
