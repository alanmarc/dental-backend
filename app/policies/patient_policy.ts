import Patient from '#models/patient'
import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'

export default class PatientPolicy extends BasePolicy {
  async view(user: User) {
    return ['admin', 'doctor', 'assistant'].includes(user.role.name)
  }

  async create(user: User) {
    return ['admin', 'doctor', 'assistant'].includes(user.role.name)
  }

  async delete(user: User, patient: Patient) {
    if (user.role.name === 'admin') {
      return true
    }
    return patient.userId === user.id
  }

  async update(user: User) {
    return ['admin', 'doctor'].includes(user.role.name)
  }
}
