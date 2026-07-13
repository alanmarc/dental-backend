import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'
import Product from '#models/product'
import Inventory from '#models/inventory'
import InventoryTransfer from '#models/inventory_transfer'

test.group('Inventory transfers', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene permisos de traspaso', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.post('/api/inventory/transfers').loginAs(actor).json({
      productId: 1,
      fromBranchId: 1,
      toBranchId: 2,
      quantity: 5,
    })
    response.assertStatus(403)
  })

  test('403 si tiene transferOwn pero NINGUNA sucursal es la propia', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const ownBranch = await createBranch(hospital.id)
    const branchA = await createBranch(hospital.id)
    const branchB = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['inventory.transfer.own'], ownBranch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })

    const response = await client.post('/api/inventory/transfers').loginAs(actor).json({
      productId: product.id,
      fromBranchId: branchA.id,
      toBranchId: branchB.id,
      quantity: 5,
    })

    response.assertStatus(403)
    response.assertTextIncludes('No tienes permiso para realizar este traspaso')
  })

  test('422 si las sucursales pertenecen a otro hospital', async ({ client }) => {
    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const ownBranch = await createBranch(hospitalA.id)
    const branchA = await createBranch(hospitalB.id)
    const branchB = await createBranch(hospitalB.id)
    const actor = await createUserWithPermissions(['inventory.transfer.any'], ownBranch.id)

    const product = await Product.create({ hospitalId: hospitalB.id, name: 'Prod' })

    const response = await client.post('/api/inventory/transfers').loginAs(actor).json({
      productId: product.id,
      fromBranchId: branchA.id,
      toBranchId: branchB.id,
      quantity: 5,
    })

    response.assertStatus(422)
    response.assertTextIncludes('No puedes operar sobre una sucursal de otro hospital')
  })

  test('422 si fromBranchId === toBranchId', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['inventory.transfer.any'], branch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })

    const response = await client.post('/api/inventory/transfers').loginAs(actor).json({
      productId: product.id,
      fromBranchId: branch.id,
      toBranchId: branch.id,
      quantity: 5,
    })

    response.assertStatus(422)
    response.assertTextIncludes('La sucursal de origen y destino no pueden ser iguales')
  })

  test('422 si deja stock negativo en el origen y no lo permite', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branchA = await createBranch(hospital.id)
    const branchB = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['inventory.transfer.own'], branchA.id)

    const product = await Product.create({
      hospitalId: hospital.id,
      name: 'Prod',
      allowsNegativeStock: false,
    })

    await Inventory.create({
      branchId: branchA.id,
      productId: product.id,
      quantity: 3,
    })

    const response = await client.post('/api/inventory/transfers').loginAs(actor).json({
      productId: product.id,
      fromBranchId: branchA.id,
      toBranchId: branchB.id,
      quantity: 5,
    })

    response.assertStatus(422)
    response.assertTextIncludes('Stock insuficiente')
  })

  test('200/201 transferOwn moviendo DESDE su propia sucursal hacia otra', async ({
    client,
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const ownBranch = await createBranch(hospital.id)
    const otherBranch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['inventory.transfer.own'], ownBranch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })

    await Inventory.create({
      branchId: ownBranch.id,
      productId: product.id,
      quantity: 20,
    })

    await Inventory.create({
      branchId: otherBranch.id,
      productId: product.id,
      quantity: 5,
    })

    const response = await client.post('/api/inventory/transfers').loginAs(actor).json({
      productId: product.id,
      fromBranchId: ownBranch.id,
      toBranchId: otherBranch.id,
      quantity: 8,
    })

    response.assertStatus(201)

    const sourceInv = await Inventory.query()
      .where('branch_id', ownBranch.id)
      .where('product_id', product.id)
      .firstOrFail()
    const destInv = await Inventory.query()
      .where('branch_id', otherBranch.id)
      .where('product_id', product.id)
      .firstOrFail()

    assert.equal(sourceInv.quantity, 12)
    assert.equal(destInv.quantity, 13)

    const transfer = await InventoryTransfer.findOrFail(response.body().data.id)
    await transfer.load('movements')
    assert.lengthOf(transfer.movements, 2)

    const outMovement = transfer.movements.find((m) => m.type === 'transfer_out')
    const inMovement = transfer.movements.find((m) => m.type === 'transfer_in')

    assert.isDefined(outMovement)
    assert.isDefined(inMovement)
    assert.equal(outMovement!.branchId, ownBranch.id)
    assert.equal(inMovement!.branchId, otherBranch.id)
    assert.equal(outMovement!.quantity, 8)
    assert.equal(inMovement!.quantity, 8)
  })

  test('200/201 transferOwn recibiendo HACIA su propia sucursal desde otra', async ({
    client,
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const ownBranch = await createBranch(hospital.id)
    const otherBranch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['inventory.transfer.own'], ownBranch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })

    await Inventory.create({
      branchId: otherBranch.id,
      productId: product.id,
      quantity: 10,
    })

    const response = await client.post('/api/inventory/transfers').loginAs(actor).json({
      productId: product.id,
      fromBranchId: otherBranch.id,
      toBranchId: ownBranch.id,
      quantity: 4,
    })

    response.assertStatus(201)

    const sourceInv = await Inventory.query()
      .where('branch_id', otherBranch.id)
      .where('product_id', product.id)
      .firstOrFail()
    const destInv = await Inventory.query()
      .where('branch_id', ownBranch.id)
      .where('product_id', product.id)
      .firstOrFail()

    assert.equal(sourceInv.quantity, 6)
    assert.equal(destInv.quantity, 4)
  })

  test('200/201 transferAny entre dos sucursales cualquiera del hospital', async ({
    client,
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const ownBranch = await createBranch(hospital.id)
    const branchA = await createBranch(hospital.id)
    const branchB = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['inventory.transfer.any'], ownBranch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })

    await Inventory.create({
      branchId: branchA.id,
      productId: product.id,
      quantity: 15,
    })

    const response = await client.post('/api/inventory/transfers').loginAs(actor).json({
      productId: product.id,
      fromBranchId: branchA.id,
      toBranchId: branchB.id,
      quantity: 10,
    })

    response.assertStatus(201)

    const sourceInv = await Inventory.query()
      .where('branch_id', branchA.id)
      .where('product_id', product.id)
      .firstOrFail()
    const destInv = await Inventory.query()
      .where('branch_id', branchB.id)
      .where('product_id', product.id)
      .firstOrFail()

    assert.equal(sourceInv.quantity, 5)
    assert.equal(destInv.quantity, 10)
  })
})
