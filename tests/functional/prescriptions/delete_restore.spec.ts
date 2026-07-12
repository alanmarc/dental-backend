import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PrescriptionFactory } from '#database/factories/prescription_factory'
import { PatientFactory } from '#database/factories/patient_factory'
import Hospital from '#models/hospital'
import Branch from '#models/branch'

test.group('Prescriptions delete/restore', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 sin permiso prescriptions.delete', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const target = await PrescriptionFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.delete(`/api/prescriptions/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y hace soft delete si tiene prescriptions.delete.any y es del mismo hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['prescriptions.delete.any'])
    const otherDoctor = await createUserWithPermissions([], actor.branchId)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: actor.branchId,
    }).create()
    const target = await PrescriptionFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.delete(`/api/prescriptions/${target.id}`).loginAs(actor)

    response.assertStatus(200)
    assert.isNotNull(response.body().data.deletedAt)
  })

  test('403 si el actor tiene prescriptions.delete.any pero intenta eliminar de otro hospital', async ({
    client,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hospital A' })
    const branchA = await Branch.create({
      hospitalId: hospitalA.id,
      name: 'Sucursal A',
      phone: '1',
      email: 'a@test.com',
      address: 'Calle A',
    })
    const actor = await createUserWithPermissions(['prescriptions.delete.any'], branchA.id)

    const hospitalB = await Hospital.create({ name: 'Hospital B' })
    const branchB = await Branch.create({
      hospitalId: hospitalB.id,
      name: 'Sucursal B',
      phone: '2',
      email: 'b@test.com',
      address: 'Calle B',
    })
    const otherDoctor = await createUserWithPermissions([], branchB.id)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: branchB.id,
    }).create()

    const target = await PrescriptionFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: branchB.id,
    }).create()

    const response = await client.delete(`/api/prescriptions/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y hace soft delete si tiene prescriptions.delete.own y es su receta', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['prescriptions.delete.own'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const target = await PrescriptionFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.delete(`/api/prescriptions/${target.id}`).loginAs(actor)

    response.assertStatus(200)
    assert.isNotNull(response.body().data.deletedAt)
  })

  test('403 si tiene prescriptions.delete.own pero es la de otro doctor', async ({ client }) => {
    const actor = await createUserWithPermissions(['prescriptions.delete.own'])
    const otherDoctor = await createUserWithPermissions([], actor.branchId)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: actor.branchId,
    }).create()
    const target = await PrescriptionFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.delete(`/api/prescriptions/${target.id}`).loginAs(actor)
    response.assertStatus(403)
  })

  test('403 sin permiso prescriptions.restore', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const target = await PrescriptionFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.put(`/api/prescriptions/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y restaura si tiene prescriptions.restore.any y es del mismo hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['prescriptions.restore.any'])
    const otherDoctor = await createUserWithPermissions([], actor.branchId)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: actor.branchId,
    }).create()
    const target = await PrescriptionFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.put(`/api/prescriptions/${target.id}/restore`).loginAs(actor)

    response.assertStatus(200)
    assert.isNull(response.body().data.deletedAt)
  })

  test('403 si el actor tiene prescriptions.restore.any pero intenta restaurar de otro hospital', async ({
    client,
  }) => {
    const hospitalA = await Hospital.create({ name: 'Hospital A' })
    const branchA = await Branch.create({
      hospitalId: hospitalA.id,
      name: 'Sucursal A',
      phone: '1',
      email: 'a@test.com',
      address: 'Calle A',
    })
    const actor = await createUserWithPermissions(['prescriptions.restore.any'], branchA.id)

    const hospitalB = await Hospital.create({ name: 'Hospital B' })
    const branchB = await Branch.create({
      hospitalId: hospitalB.id,
      name: 'Sucursal B',
      phone: '2',
      email: 'b@test.com',
      address: 'Calle B',
    })
    const otherDoctor = await createUserWithPermissions([], branchB.id)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: branchB.id,
    }).create()

    const target = await PrescriptionFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: branchB.id,
    }).create()

    const response = await client.put(`/api/prescriptions/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y restaura si tiene prescriptions.restore.own y es su receta', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['prescriptions.restore.own'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const target = await PrescriptionFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.put(`/api/prescriptions/${target.id}/restore`).loginAs(actor)

    response.assertStatus(200)
    assert.isNull(response.body().data.deletedAt)
  })

  test('403 si tiene prescriptions.restore.own pero es la de otro doctor', async ({ client }) => {
    const actor = await createUserWithPermissions(['prescriptions.restore.own'])
    const otherDoctor = await createUserWithPermissions([], actor.branchId)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: actor.branchId,
    }).create()
    const target = await PrescriptionFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.put(`/api/prescriptions/${target.id}/restore`).loginAs(actor)
    response.assertStatus(403)
  })
})
