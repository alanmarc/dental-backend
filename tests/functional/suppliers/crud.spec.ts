import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'
import Supplier from '#models/supplier'

test.group('Suppliers CRUD', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene suppliers.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/suppliers').loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y devuelve solo proveedores de su hospital si no tiene view.any', async ({
    client,
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['suppliers.view'], branchA.id)

    const supplierA = await Supplier.create({ hospitalId: hospitalA.id, name: 'Supp A' })

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const supplierB = await Supplier.create({ hospitalId: hospitalB.id, name: 'Supp B' })

    const response = await client.get('/api/suppliers').loginAs(actor)
    response.assertStatus(200)

    const ids = response.body().data.map((s: any) => s.id)
    assert.include(ids, supplierA.id)
    assert.notInclude(ids, supplierB.id)
  })

  test('200 y devuelve todos los proveedores si tiene view.any', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['suppliers.view', 'suppliers.view.any'])

    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const supplierA = await Supplier.create({ hospitalId: hospitalA.id, name: 'Supp A' })

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const supplierB = await Supplier.create({ hospitalId: hospitalB.id, name: 'Supp B' })

    const response = await client.get('/api/suppliers').loginAs(actor)
    response.assertStatus(200)

    const ids = response.body().data.map((s: any) => s.id)
    assert.include(ids, supplierA.id)
    assert.include(ids, supplierB.id)
  })

  test('403 si crea sin suppliers.create', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.post('/api/suppliers').loginAs(actor).json({ name: 'Nuevo' })
    response.assertStatus(403)
  })

  test('201 y crea proveedor asignando hospital del actor', async ({ client, assert }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['suppliers.create'], branch.id)

    const response = await client.post('/api/suppliers').loginAs(actor).json({
      name: 'Nuevo Supp',
      phone: '123',
      email: 'supp@test.com',
      address: 'Calle 123',
    })

    response.assertStatus(201)
    assert.equal(response.body().data.hospitalId, hospital.id)
    assert.equal(response.body().data.name, 'Nuevo Supp')
    assert.equal(response.body().data.phone, '123')
    assert.equal(response.body().data.email, 'supp@test.com')
  })

  test('403 si edita proveedor de otro hospital', async ({ client }) => {
    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['suppliers.update'], branchA.id)

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const supplier = await Supplier.create({ hospitalId: hospitalB.id, name: 'Supp B' })

    const response = await client
      .put(`/api/suppliers/${supplier.id}`)
      .loginAs(actor)
      .json({ name: 'Editado' })

    response.assertStatus(403)
  })

  test('200 y edita proveedor de su propio hospital', async ({ client, assert }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['suppliers.update'], branch.id)

    const supplier = await Supplier.create({ hospitalId: hospital.id, name: 'Original' })

    const response = await client
      .put(`/api/suppliers/${supplier.id}`)
      .loginAs(actor)
      .json({ name: 'Editado' })

    response.assertStatus(200)
    assert.equal(response.body().data.name, 'Editado')
  })

  test('403 si elimina proveedor de otro hospital', async ({ client }) => {
    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['suppliers.delete'], branchA.id)

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const supplier = await Supplier.create({ hospitalId: hospitalB.id, name: 'Supp B' })

    const response = await client.delete(`/api/suppliers/${supplier.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y elimina proveedor de su propio hospital', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['suppliers.delete'], branch.id)

    const supplier = await Supplier.create({ hospitalId: hospital.id, name: 'A eliminar' })

    const response = await client.delete(`/api/suppliers/${supplier.id}`).loginAs(actor)
    response.assertStatus(200)
  })

  test('403 si restaura proveedor de otro hospital', async ({ client }) => {
    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['suppliers.restore'], branchA.id)

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const supplier = await Supplier.create({ hospitalId: hospitalB.id, name: 'Supp B' })

    const response = await client.put(`/api/suppliers/${supplier.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y restaura proveedor de su propio hospital', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['suppliers.restore'], branch.id)

    const supplier = await Supplier.create({ hospitalId: hospital.id, name: 'A restaurar' })

    const response = await client.put(`/api/suppliers/${supplier.id}/restore`).loginAs(actor)
    response.assertStatus(200)
  })
})
