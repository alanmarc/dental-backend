import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'

test.group('Hospitals store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene hospitals.create', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client
      .post('/api/hospitals')
      .loginAs(actor)
      .json({ name: 'Nuevo Hospital' })

    response.assertStatus(403)
  })

  test('201 y crea el hospital si el actor tiene hospitals.create', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['hospitals.create'])
    const response = await client
      .post('/api/hospitals')
      .loginAs(actor)
      .json({ name: 'Hospital de Especialidades' })

    response.assertStatus(201)
    assert.equal(response.body().data.name, 'Hospital de Especialidades')
  })

  test('422 si el nombre está vacío', async ({ client }) => {
    const actor = await createUserWithPermissions(['hospitals.create'])
    const response = await client.post('/api/hospitals').loginAs(actor).json({ name: '' })

    response.assertStatus(422)
  })
})
