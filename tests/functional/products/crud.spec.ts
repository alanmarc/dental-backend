import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions, createBranch } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'
import Product from '#models/product'

test.group('Products CRUD', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene products.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/products').loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y devuelve solo productos de su hospital si no tiene view.any', async ({
    client,
    assert,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['products.view'], branchA.id)

    const productA = await Product.create({ hospitalId: hospitalA.id, name: 'Prod A' })

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const productB = await Product.create({ hospitalId: hospitalB.id, name: 'Prod B' })

    const response = await client.get('/api/products').loginAs(actor)
    response.assertStatus(200)

    const ids = response.body().data.map((p: any) => p.id)
    assert.include(ids, productA.id)
    assert.notInclude(ids, productB.id)
  })

  test('200 y devuelve todos los productos si tiene view.any', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['products.view', 'products.view.any'])

    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const productA = await Product.create({ hospitalId: hospitalA.id, name: 'Prod A' })

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const productB = await Product.create({ hospitalId: hospitalB.id, name: 'Prod B' })

    const response = await client.get('/api/products').loginAs(actor)
    response.assertStatus(200)

    const ids = response.body().data.map((p: any) => p.id)
    assert.include(ids, productA.id)
    assert.include(ids, productB.id)
  })

  test('403 si crea sin products.create', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.post('/api/products').loginAs(actor).json({ name: 'Nuevo' })
    response.assertStatus(403)
  })

  test('201 y crea producto asignando hospital del actor', async ({ client, assert }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['products.create'], branch.id)

    const response = await client.post('/api/products').loginAs(actor).json({
      name: 'Nuevo Prod',
      code: '123',
      allowsNegativeStock: true,
    })

    response.assertStatus(201)
    assert.equal(response.body().data.hospitalId, hospital.id)
    assert.equal(response.body().data.name, 'Nuevo Prod')
    assert.equal(response.body().data.code, '123')
    assert.isTrue(response.body().data.allowsNegativeStock)
  })

  test('403 si edita producto de otro hospital', async ({ client }) => {
    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['products.update'], branchA.id)

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const product = await Product.create({ hospitalId: hospitalB.id, name: 'Prod B' })

    const response = await client
      .put(`/api/products/${product.id}`)
      .loginAs(actor)
      .json({ name: 'Editado' })

    response.assertStatus(403)
  })

  test('200 y edita producto de su propio hospital', async ({ client, assert }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['products.update'], branch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'Original' })

    const response = await client
      .put(`/api/products/${product.id}`)
      .loginAs(actor)
      .json({ name: 'Editado' })

    response.assertStatus(200)
    assert.equal(response.body().data.name, 'Editado')
  })

  test('403 si elimina producto de otro hospital', async ({ client }) => {
    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['products.delete'], branchA.id)

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const product = await Product.create({ hospitalId: hospitalB.id, name: 'Prod B' })

    const response = await client.delete(`/api/products/${product.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y elimina producto de su propio hospital', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['products.delete'], branch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'A eliminar' })

    const response = await client.delete(`/api/products/${product.id}`).loginAs(actor)
    response.assertStatus(200)
  })

  test('403 si restaura producto de otro hospital', async ({ client }) => {
    const hospitalA = await Hospital.create({ name: 'Hosp A' })
    const branchA = await createBranch(hospitalA.id)
    const actor = await createUserWithPermissions(['products.restore'], branchA.id)

    const hospitalB = await Hospital.create({ name: 'Hosp B' })
    const product = await Product.create({ hospitalId: hospitalB.id, name: 'Prod B' })

    const response = await client.put(`/api/products/${product.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y restaura producto de su propio hospital', async ({ client }) => {
    const hospital = await Hospital.create({ name: 'Hosp' })
    const branch = await createBranch(hospital.id)
    const actor = await createUserWithPermissions(['products.restore'], branch.id)

    const product = await Product.create({ hospitalId: hospital.id, name: 'A restaurar' })

    const response = await client.put(`/api/products/${product.id}/restore`).loginAs(actor)
    response.assertStatus(200)
  })
})
