import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { PatientFactory } from '#database/factories/patient_factory'
import { AppointmentFactory } from '#database/factories/appointment_factory'
import { MedicalHistoryFactory } from '#database/factories/medical_history_factory'
import Role from '#models/role'
import Permission from '#models/permission'
import Hospital from '#models/hospital'
import Branch from '#models/branch'

test.group('Prescriptions store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene prescriptions.create', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    actor.roleId = doctorRole.id
    await actor.save()

    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .post('/api/prescriptions')
      .loginAs(actor)
      .json({
        userId: actor.id,
        patientId: patient.id,
        items: [
          {
            medicationName: 'Amoxicilina',
            dosage: '500mg',
            frequency: 'Cada 8 horas',
            durationDays: 7,
          },
        ],
      })

    response.assertStatus(403)
  })

  test('201 y crea la receta si el actor tiene prescriptions.create', async ({
    client,
    assert,
  }) => {
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'prescriptions.create' },
      { name: 'prescriptions.create' }
    )
    await doctorRole.related('permissions').sync([perm.id])

    const actor = await createUserWithPermissions([])
    actor.roleId = doctorRole.id
    await actor.save()

    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const response = await client
      .post('/api/prescriptions')
      .loginAs(actor)
      .json({
        userId: actor.id,
        patientId: patient.id,
        notes: 'Notas de receta',
        items: [
          {
            medicationName: 'Paracetamol',
            dosage: '1g',
            frequency: 'Cada 8 horas',
            durationDays: 3,
            instructions: 'Tomar con abundante agua',
          },
        ],
      })

    response.assertStatus(201)
    assert.equal(response.body().data.userId, actor.id)
    assert.equal(response.body().data.patientId, patient.id)
    assert.equal(response.body().data.branchId, actor.branchId)
    assert.lengthOf(response.body().data.items, 1)
    assert.equal(response.body().data.items[0].medicationName, 'Paracetamol')
    assert.equal(response.body().data.items[0].durationDays, 3)
  })

  test('422 si se intenta crear con un paciente de otra sucursal', async ({ client }) => {
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'prescriptions.create' },
      { name: 'prescriptions.create' }
    )
    await doctorRole.related('permissions').sync([perm.id])

    const actor = await createUserWithPermissions([])
    actor.roleId = doctorRole.id
    await actor.save()

    const hospital = await Hospital.create({ name: 'Test Hospital' })
    const branchB = await Branch.create({
      hospitalId: hospital.id,
      name: 'Sucursal B',
      phone: '456',
      email: 'b@test.com',
      address: 'Calle B',
    })

    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: branchB.id,
    }).create()

    const response = await client
      .post('/api/prescriptions')
      .loginAs(actor)
      .json({
        userId: actor.id,
        patientId: patient.id,
        items: [
          {
            medicationName: 'Amoxicilina',
            dosage: '500mg',
            frequency: 'Cada 8 horas',
            durationDays: 7,
          },
        ],
      })

    response.assertStatus(422)
    response.assertTextIncludes('El paciente y el doctor pertenecen a sucursales distintas')
  })

  test('422 si se intenta crear con una cita de otra sucursal', async ({ client }) => {
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'prescriptions.create' },
      { name: 'prescriptions.create' }
    )
    await doctorRole.related('permissions').sync([perm.id])

    const actor = await createUserWithPermissions([])
    actor.roleId = doctorRole.id
    await actor.save()

    const hospital = await Hospital.create({ name: 'Test Hospital' })
    const branchB = await Branch.create({
      hospitalId: hospital.id,
      name: 'Sucursal B',
      phone: '456',
      email: 'b@test.com',
      address: 'Calle B',
    })

    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const appointment = await AppointmentFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: branchB.id,
    }).create()

    const response = await client
      .post('/api/prescriptions')
      .loginAs(actor)
      .json({
        userId: actor.id,
        patientId: patient.id,
        appointmentId: appointment.id,
        items: [
          {
            medicationName: 'Amoxicilina',
            dosage: '500mg',
            frequency: 'Cada 8 horas',
            durationDays: 7,
          },
        ],
      })

    response.assertStatus(422)
    response.assertTextIncludes('La cita y el doctor pertenecen a sucursales distintas')
  })

  test('422 si se intenta crear con un historial de otra sucursal', async ({ client }) => {
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'prescriptions.create' },
      { name: 'prescriptions.create' }
    )
    await doctorRole.related('permissions').sync([perm.id])

    const actor = await createUserWithPermissions([])
    actor.roleId = doctorRole.id
    await actor.save()

    const hospital = await Hospital.create({ name: 'Test Hospital' })
    const branchB = await Branch.create({
      hospitalId: hospital.id,
      name: 'Sucursal B',
      phone: '456',
      email: 'b@test.com',
      address: 'Calle B',
    })

    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const medicalHistory = await MedicalHistoryFactory.merge({
      userId: actor.id,
      patientId: patient.id,
      branchId: branchB.id,
      appointmentId: null,
    }).create()

    const response = await client
      .post('/api/prescriptions')
      .loginAs(actor)
      .json({
        userId: actor.id,
        patientId: patient.id,
        medicalHistoryId: medicalHistory.id,
        items: [
          {
            medicationName: 'Amoxicilina',
            dosage: '500mg',
            frequency: 'Cada 8 horas',
            durationDays: 7,
          },
        ],
      })

    response.assertStatus(422)
    response.assertTextIncludes('El historial médico y el doctor pertenecen a sucursales distintas')
  })

  test('422 si los datos de entrada son inválidos (items vacío)', async ({ client }) => {
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'prescriptions.create' },
      { name: 'prescriptions.create' }
    )
    await doctorRole.related('permissions').sync([perm.id])

    const actor = await createUserWithPermissions([])
    actor.roleId = doctorRole.id
    await actor.save()

    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    const response = await client.post('/api/prescriptions').loginAs(actor).json({
      userId: actor.id,
      patientId: patient.id,
      items: [],
    })

    response.assertStatus(422)
  })
})
