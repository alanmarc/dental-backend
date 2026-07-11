import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { RoleFactory } from '#database/factories/role_factory'
import Hospital from '#models/hospital'
import Branch from '#models/branch'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    const hospital = await Hospital.create({ name: `Hospital-${Date.now()}` })
    const branch = await Branch.create({
      hospitalId: hospital.id,
      name: `Sucursal-${Date.now()}`,
      phone: faker.phone.number(),
      email: faker.internet.email(),
      address: faker.location.streetAddress(),
    })

    return {
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'password123',
      branchId: branch.id,
    }
  })
  .relation('role', () => RoleFactory) // requiere que Role tenga hasMany(User) o similar; si no, asigna roleId manual (ver abajo)
  .build()
