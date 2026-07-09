import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import Role from '#models/role'

test.group('Users update', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene users.update', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const target = await createUserWithPermissions([])

    const response = await client
      .put(`/api/users/${target.id}`)
      .loginAs(actor)
      .json({ fullName: 'Cambiado' })

    response.assertStatus(403)
  })

  test('200 si el actor tiene users.update y edita datos básicos', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['users.update'])
    const target = await createUserWithPermissions([])

    const response = await client
      .put(`/api/users/${target.id}`)
      .loginAs(actor)
      .json({ fullName: 'Cambiado' })

    response.assertStatus(200)
    assert.equal(response.body().data.fullName, 'Cambiado')
  })

  // 🔴 Este es EL test crítico que valida el fix de escalación de privilegios
  test('403 si el actor tiene users.update pero NO users.assign_role e intenta cambiar roleId', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['users.update'])
    const target = await createUserWithPermissions([])
    const otherRole = await Role.create({ name: 'otro-rol' })

    const response = await client
      .put(`/api/users/${target.id}`)
      .loginAs(actor)
      .json({ roleId: otherRole.id })

    response.assertStatus(403)
  })

  test('200 si el actor tiene users.assign_role y cambia el roleId de otro usuario', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['users.update', 'users.assign_role'])
    const target = await createUserWithPermissions([])
    const newRole = await Role.create({ name: 'nuevo-rol' })

    const response = await client
      .put(`/api/users/${target.id}`)
      .loginAs(actor)
      .json({ roleId: newRole.id })

    response.assertStatus(200)
    assert.equal(response.body().data.roleId, newRole.id)
  })

  test('403 si el actor con users.assign_role intenta cambiar SU PROPIO rol', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['users.update', 'users.assign_role'])
    const newRole = await Role.create({ name: 'nuevo-rol' })

    const response = await client
      .put(`/api/users/${actor.id}`)
      .loginAs(actor)
      .json({ roleId: newRole.id })

    response.assertStatus(403)
  })

  test('reenviar el mismo roleId actual no dispara el chequeo de assign_role', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['users.update']) // SIN assign_role
    const target = await createUserWithPermissions([])

    const response = await client
      .put(`/api/users/${target.id}`)
      .loginAs(actor)
      .json({ roleId: target.roleId, fullName: 'Solo nombre' }) // mismo rol, no debería fallar

    response.assertStatus(200)
  })

  test('404 si el usuario target no existe', async ({ client }) => {
    const actor = await createUserWithPermissions(['users.update'])
    const response = await client.put('/api/users/999999').loginAs(actor).json({ fullName: 'X' })

    response.assertStatus(404)
  })
})
