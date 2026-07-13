import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'
import Supplier from '#models/supplier'
import Purchase from '#models/purchase'

test.group('Purchases cancel', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene permisos para cancelar', async ({ client }) => {
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

    const response = await client.put(`/api/purchases/${purchase.id}/cancel`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 al cancelar una compra en borrador draft', async ({ client, assert }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['purchases.cancel.own'], branch.id)

    const supplier = await Supplier.create({ hospitalId: hospital.id, name: 'Supp' })

    const purchase = await Purchase.create({
      supplierId: supplier.id,
      branchId: branch.id,
      createdBy: actor.id,
      status: 'draft',
    })

    const response = await client.put(`/api/purchases/${purchase.id}/cancel`).loginAs(actor)
    response.assertStatus(200)
    assert.equal(response.body().data.status, 'cancelled')
  })

  test('422 al cancelar una compra ya recibida', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['purchases.cancel.own'], branch.id)

    const supplier = await Supplier.create({ hospitalId: hospital.id, name: 'Supp' })

    const purchase = await Purchase.create({
      supplierId: supplier.id,
      branchId: branch.id,
      createdBy: actor.id,
      status: 'received',
    })

    const response = await client.put(`/api/purchases/${purchase.id}/cancel`).loginAs(actor)
    response.assertStatus(422)
    response.assertTextIncludes('No se puede cancelar una compra ya recibida')
  })
})
