import { BasePolicy } from '@adonisjs/bouncer'
import User from '#models/user'

export default class MedicalHistoriePolicy extends BasePolicy {
  async view(user: User) {
    return ['admin', 'doctor', 'assistant'].includes(user.role.name)
  }

  async create(user: User) {
    return ['doctor'].includes(user.role.name)
  }

  async delete(user: User) {
    return ['doctor'].includes(user.role.name)
  }

  async update(user: User) {
    return ['doctor'].includes(user.role.name)
  }
}
