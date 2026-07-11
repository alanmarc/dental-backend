import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import Role from '#models/role'

test.group('Users store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene users.create', async ({ client }) => {
    const actor = await createUserWithPermissions([])

    const response = await client.post('/api/users').loginAs(actor).json({
      fullName: 'Nuevo',
      email: 'nuevo@test.com',
      password: 'secret123',
      branchId: actor.branchId,
      roleId: 2,
    })

    response.assertStatus(403)
  })

  test('422 si no se envía roleId', async ({ client }) => {
    const actor = await createUserWithPermissions(['users.create'])

    const response = await client.post('/api/users').loginAs(actor).json({
      fullName: 'Sin Rol',
      email: 'sinrol@test.com',
      password: 'secret123',
      branchId: actor.branchId,
    })

    response.assertStatus(422)
  })

  test('201 crea usuario con roleId y branchId asignados correctamente', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['users.create'])
    const role = await Role.create({ name: 'nuevo-rol-test' })

    const response = await client.post('/api/users').loginAs(actor).json({
      fullName: 'Con Rol',
      email: 'conrol@test.com',
      password: 'secret123',
      branchId: actor.branchId,
      roleId: role.id,
    })

    response.assertStatus(201)
    assert.equal(response.body().data.roleId, role.id)
    assert.equal(response.body().data.branchId, actor.branchId)
  })

  test('422 si el email ya existe', async ({ client }) => {
    const actor = await createUserWithPermissions(['users.create'])
    await client.post('/api/users').loginAs(actor).json({
      fullName: 'A',
      email: 'dup@test.com',
      password: 'secret123',
      branchId: actor.branchId,
      roleId: 3,
    })

    const response = await client.post('/api/users').loginAs(actor).json({
      fullName: 'B',
      email: 'dup@test.com',
      password: 'secret123',
      branchId: actor.branchId,
      roleId: 3,
    })

    response.assertStatus(422)
  })

  test('401 sin autenticación', async ({ client }) => {
    const response = await client.post('/api/users').json({
      fullName: 'X',
      email: 'x@test.com',
      password: 'secret123',
      branchId: 1,
      roleId: 2,
    })
    response.assertStatus(401)
  })
})
