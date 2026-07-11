import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { createUserWithPermissions } from '#tests/helpers/permissions'
import { AppointmentFactory } from '#database/factories/appointment_factory'
import { PatientFactory } from '#database/factories/patient_factory'

test.group('Appointments index', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('403 sin permiso appointments.view', async ({ client }) => {
    const actor = await createUserWithPermissions([])
    const response = await client.get('/api/appointments').loginAs(actor)
    response.assertStatus(403)
  })

  test('200 y respeta paginación con appointments.view', async ({ client, assert }) => {
    const actor = await createUserWithPermissions(['appointments.view'])
    const patient = await PatientFactory.merge({
      userId: actor.id,
      branchId: actor.branchId,
    }).create()

    // Crear algunas citas de prueba de forma secuencial para evitar advertencias de pg concurrente
    for (let i = 0; i < 15; i++) {
      await AppointmentFactory.merge({
        userId: actor.id,
        patientId: patient.id,
        branchId: actor.branchId,
      }).create()
    }

    const response = await client.get('/api/appointments?page=1&limit=5').loginAs(actor)

    response.assertStatus(200)
    assert.lengthOf(response.body().data, 5)
  })
})
