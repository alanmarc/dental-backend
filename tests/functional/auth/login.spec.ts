import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/user_factory'
import Hospital from '#models/hospital'
import Branch from '#models/branch'
import Role from '#models/role'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

test.group('Auth login', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('200 y retorna un token real con credenciales válidas', async ({ client, assert }) => {
    const role = await Role.create({ name: 'test-role' })
    const hospital = await Hospital.create({ name: 'Test Hospital' })
    const branch = await Branch.create({
      hospitalId: hospital.id,
      name: 'Test Branch',
      phone: '123456',
      email: 'test@branch.com',
      address: '123 Test St',
    })
    const user = await UserFactory.merge({
      roleId: role.id,
      branchId: branch.id,
      email: 'login-test@test.com',
      password: 'secret123',
    }).create()

    const response = await client.post('/api/login').json({
      email: 'login-test@test.com',
      password: 'secret123',
    })

    response.assertStatus(200)
    assert.exists(response.body().data.token)

    // El token debe funcionar en una petición autenticada subsecuente
    const authedResponse = await client.get('/api/tokens').loginAs(user)
    authedResponse.assertStatus(200)
  })

  test('401 con contraseña incorrecta', async ({ client }) => {
    const role = await Role.create({ name: 'test-role' })
    const hospital = await Hospital.create({ name: 'Test Hospital' })
    const branch = await Branch.create({
      hospitalId: hospital.id,
      name: 'Test Branch',
      phone: '123456',
      email: 'test@branch.com',
      address: '123 Test St',
    })
    await UserFactory.merge({
      roleId: role.id,
      branchId: branch.id,
      email: 'wrongpass@test.com',
      password: await hash.make('correcta123'),
    }).create()

    const response = await client.post('/api/login').json({
      email: 'wrongpass@test.com',
      password: 'incorrecta',
    })

    response.assertStatus(401)
  })

  test('401 si el usuario está soft-eliminado', async ({ client }) => {
    const role = await Role.create({ name: 'test-role' })
    const hospital = await Hospital.create({ name: 'Test Hospital' })
    const branch = await Branch.create({
      hospitalId: hospital.id,
      name: 'Test Branch',
      phone: '123456',
      email: 'test@branch.com',
      address: '123 Test St',
    })
    await UserFactory.merge({
      roleId: role.id,
      branchId: branch.id,
      email: 'deleted@test.com',
      password: await hash.make('secret123'),
      deletedAt: DateTime.utc(),
    }).create()

    const response = await client.post('/api/login').json({
      email: 'deleted@test.com',
      password: 'secret123',
    })

    response.assertStatus(401)
  })

  test('401 con email inexistente', async ({ client }) => {
    const response = await client.post('/api/login').json({
      email: 'noexiste@test.com',
      password: 'cualquiera',
    })
    response.assertStatus(401)
  })
})
