import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'

export default class UserPolicy extends BasePolicy {
  async view(user: User) {
    return ['admin', 'doctor', 'assistant'].includes(user.role.name)
  }

  async create(user: User) {
    return ['admin'].includes(user.role.name)
  }

  async delete(user: User) {
    return ['admin'].includes(user.role.name)
  }

  async update(user: User) {
    return ['admin'].includes(user.role.name)
  }
}
