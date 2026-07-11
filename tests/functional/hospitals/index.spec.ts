import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'

test.group('Hospitals index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene hospitals.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/hospitals').loginAs(actor)

    response.assertStatus(403)
  })

  test('200 y lista los hospitales si tiene hospitals.view', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['hospitals.view'])
    await Hospital.createMany([{ name: 'Hospital A' }, { name: 'Hospital B' }])

    const response = await client.get('/api/hospitals').loginAs(actor)

    response.assertStatus(200)
    assert.isArray(response.body().data)
    assert.isAtLeast(response.body().data.length, 2)
  })
})
