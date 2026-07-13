import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'
import Product from '#models/product'
import Supplier from '#models/supplier'
import Purchase from '#models/purchase'

test.group('Purchases store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene purchases.create.own o any', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.post('/api/purchases').loginAs(actor).json({
      supplierId: 1,
      branchId: 1,
      items: [],
    })
    response.assertStatus(403)
  })

  test('422 si tiene createOwn pero branchId no es su propia sucursal', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const ownBranch = await createBranch(hospital.id)
    const otherBranch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['purchases.create.own'], ownBranch.id)

    const supplier = await Supplier.create({ hospitalId: hospital.id, name: 'Supp' })
    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })

    const response = await client
      .post('/api/purchases')
      .loginAs(actor)
      .json({
        supplierId: supplier.id,
        branchId: otherBranch.id,
        items: [{ productId: product.id, quantity: 5 }],
      })

    response.assertStatus(422)
    response.assertTextIncludes('No puedes crear compras para otra sucursal')
  })

  test('201 crea compra en borrador draft sin generar movimientos', async ({ client, assert }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['purchases.create.own'], branch.id)

    const supplier = await Supplier.create({ hospitalId: hospital.id, name: 'Supp' })
    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })

    const response = await client
      .post('/api/purchases')
      .loginAs(actor)
      .json({
        supplierId: supplier.id,
        branchId: branch.id,
        items: [{ productId: product.id, quantity: 10, unitCost: 15.5 }],
      })

    response.assertStatus(201)
    assert.equal(response.body().data.status, 'draft')

    // Confirm no inventory movements were generated
    const purchase = await Purchase.findOrFail(response.body().data.id)
    await purchase.load('movements')
    assert.lengthOf(purchase.movements, 0)
  })

  test('422 si tiene createAny pero branchId pertenece a otro hospital', async ({ client }) => {
    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const ownBranch = await createBranch(hospitalA.id)
    const otherBranch = await createBranch(hospitalB.id)
    const actor = await createUserWithPermissions(['purchases.create.any'], ownBranch.id)

    const supplier = await Supplier.create({ hospitalId: hospitalB.id, name: 'Supp' })
    const product = await Product.create({ hospitalId: hospitalB.id, name: 'Prod' })

    const response = await client
      .post('/api/purchases')
      .loginAs(actor)
      .json({
        supplierId: supplier.id,
        branchId: otherBranch.id,
        items: [{ productId: product.id, quantity: 10, unitCost: 15.5 }],
      })

    response.assertStatus(422)
    response.assertTextIncludes('No puedes crear compras para un hospital distinto al tuyo')
  })
})
