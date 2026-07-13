import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'
import Product from '#models/product'
import Prescription from '#models/prescription'
import PrescriptionItem from '#models/prescription_item'
import Inventory from '#models/inventory'
import InventoryMovement from '#models/inventory_movement'
import Patient from '#models/patient'

test.group('Prescriptions dispense', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene permisos para dispensar', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions([], branch.id)

    const patient = await Patient.create({
      firstName: 'Pat',
      lastName: 'Test',
      userId: actor.id,
      branchId: branch.id,
    })
    const prescription = await Prescription.create({
      userId: actor.id,
      patientId: patient.id,
      branchId: branch.id,
    })

    const item = await PrescriptionItem.create({
      prescriptionId: prescription.id,
      medicationName: 'Med',
      dosage: '1',
      frequency: '2',
      durationDays: 3,
      status: 'pending',
    })

    const response = await client
      .put(`/api/prescriptions/${prescription.id}/items/${item.id}/dispense`)
      .loginAs(actor)

    response.assertStatus(403)
  })

  test('403 si tiene dispenseOwn pero intenta dispensar de otra sucursal', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const ownBranch = await createBranch(hospital.id)
    const otherBranch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['prescriptions.dispense.own'], ownBranch.id)

    const patient = await Patient.create({
      firstName: 'Pat',
      lastName: 'Test',
      userId: actor.id,
      branchId: otherBranch.id,
    })
    const prescription = await Prescription.create({
      userId: actor.id,
      patientId: patient.id,
      branchId: otherBranch.id,
    })

    const item = await PrescriptionItem.create({
      prescriptionId: prescription.id,
      medicationName: 'Med',
      dosage: '1',
      frequency: '2',
      durationDays: 3,
      status: 'pending',
    })

    const response = await client
      .put(`/api/prescriptions/${prescription.id}/items/${item.id}/dispense`)
      .loginAs(actor)

    response.assertStatus(403)
  })

  test('200 dispenseOwn en la propia sucursal, genera movimiento consumption y reduce stock', async ({
    client,
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['prescriptions.dispense.own'], branch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })
    await Inventory.create({
      branchId: branch.id,
      productId: product.id,
      quantity: 10,
    })

    const patient = await Patient.create({
      firstName: 'Pat',
      lastName: 'Test',
      userId: actor.id,
      branchId: branch.id,
    })
    const prescription = await Prescription.create({
      userId: actor.id,
      patientId: patient.id,
      branchId: branch.id,
    })

    const item = await PrescriptionItem.create({
      prescriptionId: prescription.id,
      medicationName: 'Med',
      dosage: '1',
      frequency: '2',
      durationDays: 3,
      productId: product.id,
      status: 'pending',
    })

    const response = await client
      .put(`/api/prescriptions/${prescription.id}/items/${item.id}/dispense`)
      .loginAs(actor)

    response.assertStatus(200)
    assert.equal(response.body().data.status, 'dispensed')
    assert.isNotNull(response.body().data.dispensedAt)
    assert.equal(response.body().data.dispensedBy, actor.id)

    // Check inventory reduced
    const inventory = await Inventory.query()
      .where('branch_id', branch.id)
      .where('product_id', product.id)
      .firstOrFail()
    assert.equal(inventory.quantity, 9)

    // Check movement generated
    const movement = await InventoryMovement.query()
      .where('prescription_item_id', item.id)
      .firstOrFail()
    assert.equal(movement.type, 'consumption')
    assert.equal(movement.quantity, 1)
  })

  test('200 dispenseAny en cualquier sucursal de su hospital', async ({ client, assert }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const ownBranch = await createBranch(hospital.id)
    const otherBranch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['prescriptions.dispense.any'], ownBranch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'Prod' })
    await Inventory.create({
      branchId: otherBranch.id,
      productId: product.id,
      quantity: 5,
    })

    const patient = await Patient.create({
      firstName: 'Pat',
      lastName: 'Test',
      userId: actor.id,
      branchId: otherBranch.id,
    })
    const prescription = await Prescription.create({
      userId: actor.id,
      patientId: patient.id,
      branchId: otherBranch.id,
    })

    const item = await PrescriptionItem.create({
      prescriptionId: prescription.id,
      medicationName: 'Med',
      dosage: '1',
      frequency: '2',
      durationDays: 3,
      productId: product.id,
      status: 'pending',
    })

    const response = await client
      .put(`/api/prescriptions/${prescription.id}/items/${item.id}/dispense`)
      .loginAs(actor)

    response.assertStatus(200)

    const inventory = await Inventory.query()
      .where('branch_id', otherBranch.id)
      .where('product_id', product.id)
      .firstOrFail()
    assert.equal(inventory.quantity, 4)
  })

  test('422 si el item ya fue dispensado o declinado', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['prescriptions.dispense.own'], branch.id)

    const patient = await Patient.create({
      firstName: 'Pat',
      lastName: 'Test',
      userId: actor.id,
      branchId: branch.id,
    })
    const prescription = await Prescription.create({
      userId: actor.id,
      patientId: patient.id,
      branchId: branch.id,
    })

    const item = await PrescriptionItem.create({
      prescriptionId: prescription.id,
      medicationName: 'Med',
      dosage: '1',
      frequency: '2',
      durationDays: 3,
      status: 'dispensed',
    })

    const response = await client
      .put(`/api/prescriptions/${prescription.id}/items/${item.id}/dispense`)
      .loginAs(actor)

    response.assertStatus(422)
    response.assertTextIncludes('Este ítem ya fue procesado')
  })

  test('200 dispensando un item sin productId asociado (cambia estado pero no genera movimientos)', async ({
    client,
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['prescriptions.dispense.own'], branch.id)

    const patient = await Patient.create({
      firstName: 'Pat',
      lastName: 'Test',
      userId: actor.id,
      branchId: branch.id,
    })
    const prescription = await Prescription.create({
      userId: actor.id,
      patientId: patient.id,
      branchId: branch.id,
    })

    const item = await PrescriptionItem.create({
      prescriptionId: prescription.id,
      medicationName: 'Med',
      dosage: '1',
      frequency: '2',
      durationDays: 3,
      status: 'pending',
    })

    const response = await client
      .put(`/api/prescriptions/${prescription.id}/items/${item.id}/dispense`)
      .loginAs(actor)

    response.assertStatus(200)
    assert.equal(response.body().data.status, 'dispensed')

    // Confirm no movements exist
    const count = await InventoryMovement.query()
      .where('prescription_item_id', item.id)
      .count('* as total')
    assert.equal(Number(count[0].$extras.total), 0)
  })

  test('422 si dispensar dejaría stock negativo y el producto no lo permite', async ({
    client,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['prescriptions.dispense.own'], branch.id)

    const product = await Product.create({
      hospitalId: hospital.id,
      name: 'Prod',
      allowsNegativeStock: false,
    })

    await Inventory.create({
      branchId: branch.id,
      productId: product.id,
      quantity: 0,
    })

    const patient = await Patient.create({
      firstName: 'Pat',
      lastName: 'Test',
      userId: actor.id,
      branchId: branch.id,
    })
    const prescription = await Prescription.create({
      userId: actor.id,
      patientId: patient.id,
      branchId: branch.id,
    })

    const item = await PrescriptionItem.create({
      prescriptionId: prescription.id,
      medicationName: 'Med',
      dosage: '1',
      frequency: '2',
      durationDays: 3,
      productId: product.id,
      status: 'pending',
    })

    const response = await client
      .put(`/api/prescriptions/${prescription.id}/items/${item.id}/dispense`)
      .loginAs(actor)

    response.assertStatus(422)
    response.assertTextIncludes('Stock insuficiente')
  })

  test('200 declinar un item: status=declined, sin movimiento de inventario', async ({
    client,
    assert,
  }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['prescriptions.dispense.own'], branch.id)

    const patient = await Patient.create({
      firstName: 'Pat',
      lastName: 'Test',
      userId: actor.id,
      branchId: branch.id,
    })
    const prescription = await Prescription.create({
      userId: actor.id,
      patientId: patient.id,
      branchId: branch.id,
    })

    const item = await PrescriptionItem.create({
      prescriptionId: prescription.id,
      medicationName: 'Med',
      dosage: '1',
      frequency: '2',
      durationDays: 3,
      status: 'pending',
    })

    const response = await client
      .put(`/api/prescriptions/${prescription.id}/items/${item.id}/decline`)
      .loginAs(actor)

    response.assertStatus(200)
    assert.equal(response.body().data.status, 'declined')

    // Confirm no movements exist
    const count = await InventoryMovement.query()
      .where('prescription_item_id', item.id)
      .count('* as total')
    assert.equal(Number(count[0].$extras.total), 0)
  })
})
