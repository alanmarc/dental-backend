import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'

test.group('Patients delete/restore', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // DELETE TESTS
  test('403 sin permiso patients.delete', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const target = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.delete(`/api/patients/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y hace soft delete si tiene patients.delete.any y es del mismo hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['patients.delete.any'])
    const otherUser = await createUserWithPermissions([], actor.branchId)
    const target = await PatientFactory.merge({
      userId: otherUser.id,
      branchId: otherUser.branchId,
    }).create()

    const response = await client.delete(`/api/patients/${target.id}`).loginAs(actor)
    response.assertStatus(200)
    assert.isNotNull(response.body().data.deletedAt)
  })

  test('403 si el actor tiene patients.delete.any pero intenta eliminar un paciente de otro hospital', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['patients.delete.any'])
    const otherUser = await createUserWithPermissions([])
    const target = await PatientFactory.merge({
      userId: otherUser.id,
      branchId: otherUser.branchId,
    }).create()

    const response = await client.delete(`/api/patients/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y hace soft delete si tiene patients.delete.own y es su paciente', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['patients.delete.own'])
    const target = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.delete(`/api/patients/${target.id}`).loginAs(actor)
    response.assertStatus(200)
    assert.isNotNull(response.body().data.deletedAt)
  })

  test('403 si tiene patients.delete.own pero es el paciente de otro usuario', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['patients.delete.own'])
    const otherUser = await createUserWithPermissions([])
    const target = await PatientFactory.merge({
      userId: otherUser.id,
      branchId: otherUser.branchId,
    }).create()

    const response = await client.delete(`/api/patients/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  // RESTORE TESTS
  test('403 sin permiso patients.restore', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const target = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.put(`/api/patients/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y restaura si tiene patients.restore.any y es del mismo hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['patients.delete.any', 'patients.restore.any'])
    const otherUser = await createUserWithPermissions([], actor.branchId)
    const target = await PatientFactory.merge({
      userId: otherUser.id,
      branchId: otherUser.branchId,
    }).create()

    // Eliminarlo primero
    await client.delete(`/api/patients/${target.id}`).loginAs(actor)

    const response = await client.put(`/api/patients/${target.id}/restore`).loginAs(actor)
    response.assertStatus(200)
    assert.isNull(response.body().data.deletedAt)
  })

  test('403 si el actor tiene patients.restore.any pero intenta restaurar un paciente de otro hospital', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['patients.delete.any', 'patients.restore.any'])
    const otherUser = await createUserWithPermissions([]) // different hospital
    const target = await PatientFactory.merge({
      userId: otherUser.id,
      branchId: otherUser.branchId,
    }).create()

    // We can soft-delete the patient using a bypass or using another actor who has permission in the other hospital
    const deleter = await createUserWithPermissions(['patients.delete.any'], otherUser.branchId)
    await client.delete(`/api/patients/${target.id}`).loginAs(deleter)

    const response = await client.put(`/api/patients/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y restaura si tiene patients.restore.own y es su paciente', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['patients.delete.own', 'patients.restore.own'])
    const target = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    // Eliminarlo primero
    await client.delete(`/api/patients/${target.id}`).loginAs(actor)

    const response = await client.put(`/api/patients/${target.id}/restore`).loginAs(actor)
    response.assertStatus(200)
    assert.isNull(response.body().data.deletedAt)
  })

  test('403 si tiene patients.restore.own pero es el paciente de otro usuario', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['patients.delete.any', 'patients.restore.own'])
    const otherUser = await createUserWithPermissions([], actor.branchId)
    const target = await PatientFactory.merge({
      userId: otherUser.id,
      branchId: otherUser.branchId,
    }).create()

    // Eliminarlo primero (con delete.any)
    await client.delete(`/api/patients/${target.id}`).loginAs(actor)

    const response = await client.put(`/api/patients/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })
})
