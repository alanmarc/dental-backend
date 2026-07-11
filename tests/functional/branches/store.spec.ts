import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'

test.group('Branches store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene permisos de creacion de branches', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const hospital = await Hospital.create({ name: 'Hospital A' })

    const response = await client.post('/api/branches').loginAs(actor).json({
      hospitalId: hospital.id,
      name: 'Sucursal A',
      phone: '123',
      email: 'a@branch.com',
      address: 'Calle A',
    })

    response.assertStatus(403)
  })

  test('201 si el admin con branches.create.own crea branch en SU propio hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['branches.create.own'])
    await actor.load('branch')
    const myHospitalId = actor.branch.hospitalId

    const response = await client.post('/api/branches').loginAs(actor).json({
      hospitalId: myHospitalId,
      name: 'Sucursal Propia',
      phone: '123456789',
      email: 'propia@test.com',
      address: 'Calle Propia 123',
    })

    response.assertStatus(201)
    assert.equal(response.body().data.hospitalId, myHospitalId)
  })

  test('422 si el admin con branches.create.own intenta crear branch en OTRO hospital', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['branches.create.own'])
    const otherHospital = await Hospital.create({ name: 'Otro Hospital' })

    const response = await client.post('/api/branches').loginAs(actor).json({
      hospitalId: otherHospital.id,
      name: 'Sucursal Ajena',
      phone: '123456789',
      email: 'ajena@test.com',
      address: 'Calle Ajena 123',
    })

    response.assertStatus(422)
    response.assertTextIncludes('No puedes crear sucursales para otros hospitales')
  })

  test('201 si super_admin con branches.create.any crea branch en cualquier hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['branches.create.any'])
    const otherHospital = await Hospital.create({ name: 'Otro Hospital' })

    const response = await client.post('/api/branches').loginAs(actor).json({
      hospitalId: otherHospital.id,
      name: 'Sucursal Super',
      phone: '987654321',
      email: 'super@test.com',
      address: 'Calle Super 456',
    })

    response.assertStatus(201)
    assert.equal(response.body().data.hospitalId, otherHospital.id)
  })
})
