import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Hospital from '#models/hospital'
import Branch from '#models/branch'

test.group('Database integrity', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('no se puede borrar un hospital con sucursales asociadas', async ({ assert }) => {
    const hospital = await Hospital.create({ name: 'Test' })
    await Branch.create({
      hospitalId: hospital.id,
      name: 'B',
      phone: '000',
      email: 'b@test.com',
      address: 'x',
    })

    await assert.rejects(() => hospital.delete())
  })
})
