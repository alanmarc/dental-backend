import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'

test.group('Hospitals delete/restore', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 sin permiso hospitals.delete', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const hospital = await Hospital.create({ name: 'Hospital A' })

    const response = await client.delete(`/api/hospitals/${hospital.id}`).loginAs(actor)

    response.assertStatus(403)
  })

  test('200 y hace soft delete con hospitals.delete', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['hospitals.delete'])
    const hospital = await Hospital.create({ name: 'Hospital A' })

    const response = await client.delete(`/api/hospitals/${hospital.id}`).loginAs(actor)

    response.assertStatus(200)
    assert.isNotNull(response.body().data.deletedAt)
  })

  test('403 sin permiso hospitals.restore', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const hospital = await Hospital.create({ name: 'Hospital A' })

    const response = await client.put(`/api/hospitals/${hospital.id}/restore`).loginAs(actor)

    response.assertStatus(403)
  })

  test('200 y restaura con hospitals.restore', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['hospitals.restore'])
    const hospital = await Hospital.create({ name: 'Hospital A' })
    hospital.deletedAt = null
    await hospital.save()

    const response = await client.put(`/api/hospitals/${hospital.id}/restore`).loginAs(actor)

    response.assertStatus(200)
    assert.isNull(response.body().data.deletedAt)
  })
})
