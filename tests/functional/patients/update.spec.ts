import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'

test.group('Patients update', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene ningún permiso de actualización de pacientes', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions([])
    const target = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .put(`/api/patients/${target.id}`)
      .loginAs(actor)
      .json({ firstName: 'Cambiado' })

    response.assertStatus(403)
  })

  test('200 si el actor tiene patients.update.any y edita cualquier paciente del mismo hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['patients.update.any'])
    const otherUser = await createUserWithPermissions([], actor.branchId)
    const target = await PatientFactory.merge({
      userId: otherUser.id,
      branchId: otherUser.branchId,
    }).create()

    const response = await client
      .put(`/api/patients/${target.id}`)
      .loginAs(actor)
      .json({ firstName: 'Nombre Nuevo' })

    response.assertStatus(200)
    assert.equal(response.body().data.firstName, 'Nombre Nuevo')
  })

  test('403 si el actor tiene patients.update.any pero intenta editar un paciente de otro hospital', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['patients.update.any'])
    const otherUser = await createUserWithPermissions([])
    const target = await PatientFactory.merge({
      userId: otherUser.id,
      branchId: otherUser.branchId,
    }).create()

    const response = await client
      .put(`/api/patients/${target.id}`)
      .loginAs(actor)
      .json({ firstName: 'Intento de Hack' })

    response.assertStatus(403)
  })

  test('200 si el actor tiene patients.update.own y edita SU propio paciente', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['patients.update.own'])
    const target = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .put(`/api/patients/${target.id}`)
      .loginAs(actor)
      .json({ firstName: 'Nombre Propio' })

    response.assertStatus(200)
    assert.equal(response.body().data.firstName, 'Nombre Propio')
  })

  test('403 si el actor tiene patients.update.own pero intenta editar el paciente de otro doctor', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['patients.update.own'])
    const otherUser = await createUserWithPermissions([])
    const target = await PatientFactory.merge({
      userId: otherUser.id,
      branchId: otherUser.branchId,
    }).create()

    const response = await client
      .put(`/api/patients/${target.id}`)
      .loginAs(actor)
      .json({ firstName: 'No Permitido' })

    response.assertStatus(403)
  })

  test('404 si el paciente no existe', async ({ client }) => {
    const actor = await createUserWithPermissions(['patients.update.any'])
    const response = await client
      .put('/api/patients/999999')
      .loginAs(actor)
      .json({ firstName: 'X' })

    response.assertStatus(404)
  })
})
