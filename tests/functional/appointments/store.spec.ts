import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'
import { UserFactory } from '#database/factories/user_factory'
import Role from '#models/role'
import Permission from '#models/permission'
import Hospital from '#models/hospital'
import Branch from '#models/branch'
import { DateTime } from 'luxon'

test.group('Appointments store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene appointments.create', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    actor.roleId = doctorRole.id
    await actor.save()

    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .post('/api/appointments')
      .loginAs(actor)
      .json({
        userId: actor.id,
        patientId: patient.id,
        dateTime: DateTime.now().plus({ days: 1 }).toISO(),
        duration: 30,
        status: 'scheduled',
        reason: 'Consulta general',
      })

    response.assertStatus(403)
  })

  test('201 y crea la cita si el actor tiene appointments.create', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['appointments.create'])
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'appointments.create' },
      { name: 'appointments.create' }
    )
    await doctorRole.related('permissions').sync([perm.id])
    actor.roleId = doctorRole.id
    await actor.save()

    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const futureTime = DateTime.now()
      .plus({ days: 1 })
      .set({ hour: 10, minute: 0, second: 0, millisecond: 0 })

    const response = await client.post('/api/appointments').loginAs(actor).json({
      userId: actor.id,
      patientId: patient.id,
      dateTime: futureTime.toISO(),
      duration: 30,
      status: 'scheduled',
      reason: 'Consulta dental',
    })

    response.assertStatus(201)
    assert.equal(response.body().data.reason, 'Consulta dental')
    assert.equal(response.body().data.branchId, actor.branchId)
  })

  test('422 si hay conflicto de horario en la sucursal', async ({ client }) => {
    const actor = await createUserWithPermissions(['appointments.create'])
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'appointments.create' },
      { name: 'appointments.create' }
    )
    await doctorRole.related('permissions').sync([perm.id])
    actor.roleId = doctorRole.id
    await actor.save()

    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const futureTime = DateTime.now()
      .plus({ days: 1 })
      .set({ hour: 10, minute: 0, second: 0, millisecond: 0 })

    // Crear la primera cita
    await client.post('/api/appointments').loginAs(actor).json({
      userId: actor.id,
      patientId: patient.id,
      dateTime: futureTime.toISO(),
      duration: 30,
      status: 'scheduled',
      reason: 'Cita 1',
    })

    // Intentar crear la segunda cita al mismo tiempo (traslapada)
    const response = await client
      .post('/api/appointments')
      .loginAs(actor)
      .json({
        userId: actor.id,
        patientId: patient.id,
        dateTime: futureTime.plus({ minutes: 15 }).toISO(), // Se traslapa con la cita de 10:00 a 10:30
        duration: 30,
        status: 'scheduled',
        reason: 'Cita traslapada',
      })

    response.assertStatus(422)
    response.assertTextIncludes('Horario ocupado en esta sucursal')
  })

  test('201 si dos doctores distintos de la misma sucursal agendan citas a la misma hora', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['appointments.create'])
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'appointments.create' },
      { name: 'appointments.create' }
    )
    await doctorRole.related('permissions').sync([perm.id])

    // Crear dos doctores en la misma sucursal (branch del actor)
    const doctorA = await UserFactory.merge({
      roleId: doctorRole.id,
      branchId: actor.branchId,
    }).create()

    const doctorB = await UserFactory.merge({
      roleId: doctorRole.id,
      branchId: actor.branchId,
    }).create()

    // Crear dos pacientes en la misma sucursal
    const patientA = await PatientFactory.merge({
      userId: doctorA.id,
      branchId: actor.branchId,
    }).create()

    const patientB = await PatientFactory.merge({
      userId: doctorB.id,
      branchId: actor.branchId,
    }).create()

    const futureTime = DateTime.now()
      .plus({ days: 1 })
      .set({ hour: 10, minute: 0, second: 0, millisecond: 0 })

    // Agendar cita para doctorA
    const resA = await client.post('/api/appointments').loginAs(actor).json({
      userId: doctorA.id,
      patientId: patientA.id,
      dateTime: futureTime.toISO(),
      duration: 30,
      status: 'scheduled',
      reason: 'Cita Doctor A',
    })
    resA.assertStatus(201)

    // Agendar cita para doctorB a la misma hora (debería permitirse)
    const resB = await client.post('/api/appointments').loginAs(actor).json({
      userId: doctorB.id,
      patientId: patientB.id,
      dateTime: futureTime.toISO(),
      duration: 30,
      status: 'scheduled',
      reason: 'Cita Doctor B',
    })
    resB.assertStatus(201)
    assert.equal(resB.body().data.branchId, actor.branchId)
  })

  test('422 si el paciente y el doctor pertenecen a sucursales distintas', async ({ client }) => {
    const actor = await createUserWithPermissions(['appointments.create'])
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })

    // Crear un doctor en branch A
    const hospital = await Hospital.create({ name: 'Test Hospital' })
    const branchA = await Branch.create({
      hospitalId: hospital.id,
      name: 'Sucursal A',
      phone: '123',
      email: 'a@test.com',
      address: 'Calle A',
    })

    const doctor = await UserFactory.merge({
      roleId: doctorRole.id,
      branchId: branchA.id,
    }).create()

    // Crear un paciente en branch B (diferente sucursal)
    const branchB = await Branch.create({
      hospitalId: hospital.id,
      name: 'Sucursal B',
      phone: '456',
      email: 'b@test.com',
      address: 'Calle B',
    })

    const patient = await PatientFactory.merge({
      userId: doctor.id,
      branchId: branchB.id,
    }).create()

    const futureTime = DateTime.now().plus({ days: 1 })

    const response = await client.post('/api/appointments').loginAs(actor).json({
      userId: doctor.id,
      patientId: patient.id,
      dateTime: futureTime.toISO(),
      duration: 30,
      status: 'scheduled',
      reason: 'Consulta cruzada',
    })

    response.assertStatus(422)
    response.assertTextIncludes('El paciente y el doctor pertenecen a sucursales distintas')
  })

  test('422 si los IDs no existen', async ({ client }) => {
    const actor = await createUserWithPermissions(['appointments.create'])
    const response = await client
      .post('/api/appointments')
      .loginAs(actor)
      .json({
        userId: 999999,
        patientId: 999999,
        dateTime: DateTime.now().plus({ days: 1 }).toISO(),
        duration: 30,
        status: 'scheduled',
        reason: 'Consulta general',
      })

    response.assertStatus(422)
  })

  test('401 sin autenticación', async ({ client }) => {
    const response = await client.post('/api/appointments').json({
      userId: 1,
      patientId: 1,
      dateTime: DateTime.now().plus({ days: 1 }).toISO(),
      duration: 30,
      status: 'scheduled',
      reason: 'X',
    })
    response.assertStatus(401)
  })
})
