import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PrescriptionFactory } from '#database/factories/prescription_factory'
import { PatientFactory } from '#database/factories/patient_factory'
import Role from '#models/role'
import Permission from '#models/permission'
import Hospital from '#models/hospital'
import Branch from '#models/branch'

test.group('Prescriptions update', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene ningún permiso de actualización', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    actor.roleId = doctorRole.id
    await actor.save()

    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const target = await PrescriptionFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .put(`/api/prescriptions/${target.id}`)
      .loginAs(actor)
      .json({ notes: 'Nuevas notas' })

    response.assertStatus(403)
  })

  test('403 si el actor tiene update.own pero intenta editar la de otro doctor', async ({
    client,
  }) => {
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'prescriptions.update.own' },
      { name: 'prescriptions.update.own' }
    )
    await doctorRole.related('permissions').sync([perm.id])

    const actor = await createUserWithPermissions([])
    actor.roleId = doctorRole.id
    await actor.save()

    const otherDoctor = await createUserWithPermissions([], actor.branchId)
    otherDoctor.roleId = doctorRole.id
    await otherDoctor.save()

    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: actor.branchId,
    }).create()
    const target = await PrescriptionFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .put(`/api/prescriptions/${target.id}`)
      .loginAs(actor)
      .json({ notes: 'Nuevas notas' })

    response.assertStatus(403)
  })

  test('200 si el actor tiene update.own y edita SU propia receta', async ({ client, assert }) => {
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'prescriptions.update.own' },
      { name: 'prescriptions.update.own' }
    )
    await doctorRole.related('permissions').sync([perm.id])

    const actor = await createUserWithPermissions([])
    actor.roleId = doctorRole.id
    await actor.save()

    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const target = await PrescriptionFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .put(`/api/prescriptions/${target.id}`)
      .loginAs(actor)
      .json({ notes: 'Nuevas notas' })

    response.assertStatus(200)
    assert.equal(response.body().data.notes, 'Nuevas notas')
  })

  test('200 si el actor tiene update.any y edita cualquier receta del mismo hospital', async ({
    client,
    assert,
  }) => {
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'prescriptions.update.any' },
      { name: 'prescriptions.update.any' }
    )
    await doctorRole.related('permissions').sync([perm.id])

    const actor = await createUserWithPermissions([])
    actor.roleId = doctorRole.id
    await actor.save()

    const actorBranch = await Branch.findOrFail(actor.branchId)
    const branchA1 = await Branch.create({
      hospitalId: actorBranch.hospitalId,
      name: 'Sucursal A1',
      phone: '1',
      email: 'a1@test.com',
      address: 'Calle A1',
    })

    const otherDoctor = await createUserWithPermissions([], branchA1.id)
    otherDoctor.roleId = doctorRole.id
    await otherDoctor.save()

    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: branchA1.id,
    }).create()

    const target = await PrescriptionFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: branchA1.id,
    }).create()

    const response = await client
      .put(`/api/prescriptions/${target.id}`)
      .loginAs(actor)
      .json({ notes: 'Nuevas notas por admin' })

    response.assertStatus(200)
    assert.equal(response.body().data.notes, 'Nuevas notas por admin')
  })

  test('403 si el actor tiene update.any pero intenta editar una receta de otro hospital', async ({
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
    const actor = await createUserWithPermissions(['prescriptions.update.any'], branchA.id)
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    actor.roleId = doctorRole.id
    await actor.save()

    const hospitalB = await Hospital.create({ name: 'Hospital B' })
    const branchB = await Branch.create({
      hospitalId: hospitalB.id,
      name: 'Sucursal B',
      phone: '2',
      email: 'b@test.com',
      address: 'Calle B',
    })

    const otherDoctor = await createUserWithPermissions([], branchB.id)
    otherDoctor.roleId = doctorRole.id
    await otherDoctor.save()

    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: branchB.id,
    }).create()

    const target = await PrescriptionFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: branchB.id,
    }).create()

    const response = await client
      .put(`/api/prescriptions/${target.id}`)
      .loginAs(actor)
      .json({ notes: 'Intento malicioso' })

    response.assertStatus(403)
  })

  test('422 si se intenta actualizar a un paciente de otra sucursal', async ({ client }) => {
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'prescriptions.update.any' },
      { name: 'prescriptions.update.any' }
    )
    await doctorRole.related('permissions').sync([perm.id])

    const actor = await createUserWithPermissions([])
    actor.roleId = doctorRole.id
    await actor.save()

    const hospital = await Hospital.create({ name: 'Hospital A' })
    const branchB = await Branch.create({
      hospitalId: hospital.id,
      name: 'Sucursal B',
      phone: '2',
      email: 'b@test.com',
      address: 'Calle B',
    })

    const patientB = await PatientFactory.merge({
      userId: actor.id,
      branchId: branchB.id,
    }).create()

    const patientA = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const target = await PrescriptionFactory.merge({
      userId: actor.id,
      patientId: patientA.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .put(`/api/prescriptions/${target.id}`)
      .loginAs(actor)
      .json({ patientId: patientB.id })

    response.assertStatus(422)
    response.assertTextIncludes('El paciente y el doctor pertenecen a sucursales distintas')
  })

  test('404 si la receta no existe', async ({ client }) => {
    const actor = await createUserWithPermissions(['prescriptions.update.any'])
    const response = await client
      .put('/api/prescriptions/99999')
      .loginAs(actor)
      .json({ notes: 'N/A' })

    response.assertStatus(404)
  })
})
