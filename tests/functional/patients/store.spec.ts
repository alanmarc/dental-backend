import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import Hospital from '#models/hospital'
import Branch from '#models/branch'
import Role from '#models/role'
import Permission from '#models/permission'

async function createBranch() {
  const hospital = await Hospital.create({ name: 'Hospital de Prueba' })
  return await Branch.create({
    hospitalId: hospital.id,
    name: 'Sucursal Sur',
    phone: '555-1234',
    email: 'sur@prueba.com',
    address: 'Av. Test 456',
  })
}

test.group('Patients store', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 si el actor no tiene patients.create', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const otherUser = await createUserWithPermissions([])

    const response = await client.post('/api/patients').loginAs(actor).json({
      userId: otherUser.id,
      firstName: 'Juan',
      lastName: 'Pérez',
    })

    response.assertStatus(403)
  })

  test('201 y crea el paciente si el actor tiene patients.create y el userId es un doctor', async ({
    client,
    assert,
  }) => {
    const actor = await createUserWithPermissions(['patients.create'])
    const branch = await createBranch()

    // Crear rol de doctor y asignar al actor para que pase la validación
    const doctorRole = await Role.firstOrCreate({ name: 'doctor' }, { name: 'doctor' })
    const perm = await Permission.firstOrCreate(
      { name: 'patients.create' },
      { name: 'patients.create' }
    )
    await doctorRole.related('permissions').sync([perm.id])

    actor.roleId = doctorRole.id
    actor.branchId = branch.id
    await actor.save()

    const response = await client.post('/api/patients').loginAs(actor).json({
      userId: actor.id,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@perez.com',
      phone: '123456789',
    })

    response.assertStatus(201)
    assert.equal(response.body().data.firstName, 'Juan')
    assert.equal(response.body().data.branchId, branch.id)
  })

  test('422 si el userId no pertenece a un usuario con rol doctor', async ({ client }) => {
    const actor = await createUserWithPermissions(['patients.create'])
    const nonDoctorUser = await createUserWithPermissions([]) // tiene un rol de prueba dinámico, no 'doctor'

    const response = await client.post('/api/patients').loginAs(actor).json({
      userId: nonDoctorUser.id,
      firstName: 'Juan',
      lastName: 'Pérez',
    })

    response.assertStatus(422)
  })

  test('422 si el userId no existe', async ({ client }) => {
    const actor = await createUserWithPermissions(['patients.create'])
    const response = await client.post('/api/patients').loginAs(actor).json({
      userId: 999999, // ID no existente
      firstName: 'Juan',
      lastName: 'Pérez',
    })

    response.assertStatus(422)
  })

  test('401 sin autenticación', async ({ client }) => {
    const response = await client.post('/api/patients').json({
      userId: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
    })
    response.assertStatus(401)
  })
})
