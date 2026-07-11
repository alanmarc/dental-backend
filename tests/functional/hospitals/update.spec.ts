import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'

test.group('Hospitals update', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene hospitals.update', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const hospital = await Hospital.create({ name: 'Hospital A' })

    const response = await client
      .put(`/api/hospitals/${hospital.id}`)
      .loginAs(actor)
      .json({ name: 'Hospital Modificado' })

    response.assertStatus(403)
  })

  test('200 y actualiza si tiene hospitals.update', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['hospitals.update'])
    const hospital = await Hospital.create({ name: 'Hospital A' })

    const response = await client
      .put(`/api/hospitals/${hospital.id}`)
      .loginAs(actor)
      .json({ name: 'Hospital Modificado' })

    response.assertStatus(200)
    assert.equal(response.body().data.name, 'Hospital Modificado')
  })

  test('404 si el hospital no existe', async ({ client }) => {
    const actor = await createUserWithPermissions(['hospitals.update'])
    const response = await client
      .put('/api/hospitals/999999')
      .loginAs(actor)
      .json({ name: 'Inexistente' })

    response.assertStatus(404)
  })
})
