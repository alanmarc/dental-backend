import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'
import { AppointmentFactory } from '#database/factories/appointment_factory'
import { UserFactory } from '#database/factories/user_factory'
import Role from '#models/role'
import Hospital from '#models/hospital'
import Branch from '#models/branch'

test.group('Appointments update', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene ningún permiso de actualización de citas', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .put(`/api/appointments/${target.id}`)
      .loginAs(actor)
      .json({ reason: 'Motivo modificado' })

    response.assertStatus(403)
  })

  test('200 si el actor tiene appointments.update.any y edita cualquier cita del mismo hospital', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['appointments.update.any'])
    const otherDoctor = await createUserWithPermissions([], actor.branchId)
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client
      .put(`/api/appointments/${target.id}`)
      .loginAs(actor)
      .json({ reason: 'Editado por admin' })

    response.assertStatus(200)
    assert.equal(response.body().data.reason, 'Editado por admin')
  })

  test('403 si el actor tiene appointments.update.any pero intenta editar cita de otro hospital', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['appointments.update.any'])
    const otherDoctor = await createUserWithPermissions([])
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client
      .put(`/api/appointments/${target.id}`)
      .loginAs(actor)
      .json({ reason: 'Editado por admin de otro hospital' })

    response.assertStatus(403)
  })

  test('200 si el actor tiene appointments.update.own y edita SU propia cita', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['appointments.update.own'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .put(`/api/appointments/${target.id}`)
      .loginAs(actor)
      .json({ reason: 'Editado por mí' })

    response.assertStatus(200)
    assert.equal(response.body().data.reason, 'Editado por mí')
  })

  test('403 si el actor tiene appointments.update.own pero intenta editar la cita de otro doctor', async ({
    client,
  }) => {
    const actor = await createUserWithPermissions(['appointments.update.own'])
    const otherDoctor = await createUserWithPermissions([])
    const patient = await PatientFactory.merge({
      userId: otherDoctor.id,
      branchId: otherDoctor.branchId,
    }).create()
    const target = await AppointmentFactory.merge({
      userId: otherDoctor.id,
      patientId: patient.id,
      branchId: otherDoctor.branchId,
    }).create()

    const response = await client
      .put(`/api/appointments/${target.id}`)
      .loginAs(actor)
      .json({ reason: 'No permitido' })

    response.assertStatus(403)
  })

  test('422 si se intenta actualizar el doctor a uno de otra sucursal', async ({ client }) => {
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })

    const hospital = await Hospital.create({ name: 'Test Hospital' })
    const branchA = await Branch.create({
      hospitalId: hospital.id,
      name: 'Sucursal A',
      phone: '123',
      email: 'a@test.com',
      address: 'Calle A',
    })
    const actor = await createUserWithPermissions(['appointments.update.any'], branchA.id)
    const branchB = await Branch.create({
      hospitalId: hospital.id,
      name: 'Sucursal B',
      phone: '456',
      email: 'b@test.com',
      address: 'Calle B',
    })

    const doctorA = await UserFactory.merge({
      roleId: doctorRole.id,
      branchId: branchA.id,
    }).create()

    const doctorB = await UserFactory.merge({
      roleId: doctorRole.id,
      branchId: branchB.id,
    }).create()

    const patientA = await PatientFactory.merge({
      userId: doctorA.id,
      branchId: branchA.id,
    }).create()

    const target = await AppointmentFactory.merge({
      userId: doctorA.id,
      patientId: patientA.id,
      branchId: branchA.id,
    }).create()

    // Intentar cambiar el doctor a doctorB (que está en sucursal B, diferente a la del paciente que está en sucursal A)
    const response = await client
      .put(`/api/appointments/${target.id}`)
      .loginAs(actor)
      .json({ userId: doctorB.id })

    response.assertStatus(422)
    response.assertTextIncludes('El paciente y el doctor pertenecen a sucursales distintas')
  })
  test('422 si se intenta actualizar el paciente a uno de otra sucursal', async ({ client }) => {
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })

    const hospital = await Hospital.create({ name: 'Test Hospital' })
    const branchA = await Branch.create({
      hospitalId: hospital.id,
      name: 'Sucursal A',
      phone: '123',
      email: 'a@test.com',
      address: 'Calle A',
    })
    const actor = await createUserWithPermissions(['appointments.update.any'], branchA.id)
    const branchB = await Branch.create({
      hospitalId: hospital.id,
      name: 'Sucursal B',
      phone: '456',
      email: 'b@test.com',
      address: 'Calle B',
    })

    const doctorA = await UserFactory.merge({
      roleId: doctorRole.id,
      branchId: branchA.id,
    }).create()

    const patientA = await PatientFactory.merge({
      userId: doctorA.id,
      branchId: branchA.id,
    }).create()

    const patientB = await PatientFactory.merge({
      userId: doctorA.id,
      branchId: branchB.id,
    }).create()

    const target = await AppointmentFactory.merge({
      userId: doctorA.id,
      patientId: patientA.id,
      branchId: branchA.id,
    }).create()

    // Intentar cambiar el paciente a patientB (que está en sucursal B, mientras que doctorA está en sucursal A)
    const response = await client
      .put(`/api/appointments/${target.id}`)
      .loginAs(actor)
      .json({ patientId: patientB.id })

    response.assertStatus(422)
    response.assertTextIncludes('El paciente y el doctor pertenecen a sucursales distintas')
  })

  test('404 si la cita no existe', async ({ client }) => {
    const actor = await createUserWithPermissions(['appointments.update.any'])
    const response = await client
      .put('/api/appointments/999999')
      .loginAs(actor)
      .json({ reason: 'X' })

    response.assertStatus(404)
  })
})
