import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'

test.group('Users store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene users.create', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client
      .post('/api/users')
      .loginAs(actor)
      .json({ fullName: 'Nuevo', email: 'nuevo@test.com', password: 'secret123' })

    response.assertStatus(403)
  })

  test('201 y crea el usuario si el actor tiene users.create', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['users.create'])
    const response = await client.post('/api/users').loginAs(actor).json({
      fullName: 'Nuevo',
      email: 'nuevo@test.com',
      password: 'secret123',
      branchId: actor.branchId,
    })

    response.assertStatus(201)
    assert.equal(response.body().data.email, 'nuevo@test.com')
  })

  test('422 si el email ya existe', async ({ client }) => {
    const actor = await createUserWithPermissions(['users.create'])
    await client.post('/api/users').loginAs(actor).json({
      fullName: 'A',
      email: 'dup@test.com',
      password: 'secret123',
      branchId: actor.branchId,
    })

    const response = await client.post('/api/users').loginAs(actor).json({
      fullName: 'B',
      email: 'dup@test.com',
      password: 'secret123',
      branchId: actor.branchId,
    })

    response.assertStatus(422)
  })

  test('401 sin autenticación', async ({ client }) => {
    const response = await client.post('/api/users').json({
      fullName: 'X',
      email: 'x@test.com',
      password: 'secret123',
    })
    response.assertStatus(401)
  })
})
