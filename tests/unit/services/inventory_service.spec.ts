import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import Hospital from '#models/hospital'
import Product from '#models/product'
import Inventory from '#models/inventory'
import { registerMovement } from '#services/inventory_service'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import InsufficientStockException from '#exceptions/insufficient_stock_exception'

test.group('InventoryService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('registra un movimiento in y confirma que Inventory.quantity aumenta correctamente', async ({
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })
    const user = await createUserWithPermissions([], branch.id)

    const trx = await db.transaction()

    try {
      const { movement, inventory: updatedInventory } = await registerMovement({
        branchId: branch.id,
        productId: product.id,
        type: 'adjustment_in',
        quantity: 10,
        direction: 'in',
        userId: user.id,
        trx,
      })

      await trx.commit()

      const inventory = await Inventory.query()
        .where('branch_id', branch.id)
        .where('product_id', product.id)
        .firstOrFail()

      assert.equal(inventory.quantity, 10)
      assert.equal(updatedInventory.quantity, 10)
      assert.equal(movement.quantity, 10)
      assert.equal(movement.type, 'adjustment_in')
    } catch (err) {
      await trx.rollback()
      throw err
    }
  })

  test('registra un movimiento out que dejaría saldo negativo con allowsNegativeStock=false lanza InsufficientStockException', async ({
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const product = await Product.create({
      hospitalId: hospital.id,
      name: 'Prod',
      allowsNegativeStock: false,
    })
    const user = await createUserWithPermissions([], branch.id)

    const trx = await db.transaction()

    await assert.rejects(async () => {
      try {
        await registerMovement({
          branchId: branch.id,
          productId: product.id,
          type: 'adjustment_out',
          quantity: 5,
          direction: 'out',
          userId: user.id,
          trx,
        })
        await trx.commit()
      } catch (err) {
        await trx.rollback()
        throw err
      }
    }, InsufficientStockException)
  })

  test('registra un movimiento out que dejaría saldo negativo con allowsNegativeStock=true permite el saldo negativo', async ({
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const product = await Product.create({
      hospitalId: hospital.id,
      name: 'Prod',
      allowsNegativeStock: true,
    })
    const user = await createUserWithPermissions([], branch.id)

    const trx = await db.transaction()

    try {
      await registerMovement({
        branchId: branch.id,
        productId: product.id,
        type: 'adjustment_out',
        quantity: 5,
        direction: 'out',
        userId: user.id,
        trx,
      })

      await trx.commit()

      const inventory = await Inventory.query()
        .where('branch_id', branch.id)
        .where('product_id', product.id)
        .firstOrFail()

      assert.equal(inventory.quantity, -5)
    } catch (err) {
      await trx.rollback()
      throw err
    }
  })

  test('dos movimientos consecutivos actualizan el saldo acumulativamente', async ({ assert }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })
    const user = await createUserWithPermissions([], branch.id)

    const trx1 = await db.transaction()
    try {
      await registerMovement({
        branchId: branch.id,
        productId: product.id,
        type: 'adjustment_in',
        quantity: 15,
        direction: 'in',
        userId: user.id,
        trx: trx1,
      })
      await trx1.commit()
    } catch (err) {
      await trx1.rollback()
      throw err
    }

    const trx2 = await db.transaction()
    try {
      await registerMovement({
        branchId: branch.id,
        productId: product.id,
        type: 'adjustment_out',
        quantity: 5,
        direction: 'out',
        userId: user.id,
        trx: trx2,
      })
      await trx2.commit()
    } catch (err) {
      await trx2.rollback()
      throw err
    }

    const inventory = await Inventory.query()
      .where('branch_id', branch.id)
      .where('product_id', product.id)
      .firstOrFail()

    assert.equal(inventory.quantity, 10)
  })
})
