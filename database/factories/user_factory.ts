import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { RoleFactory } from '#database/factories/role_factory'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      fullName: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'password123',
    }
  })
  .relation('role', () => RoleFactory) // requiere que Role tenga hasMany(User) o similar; si no, asigna roleId manual (ver abajo)
  .build()
