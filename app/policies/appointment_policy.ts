import { BasePolicy } from '@adonisjs/bouncer'
import User from '#models/user'
import Appointment from '#models/appointment'

export default class AppointmentPolicy extends BasePolicy {
  async view(user: User) {
    return ['admin', 'doctor', 'assistant'].includes(user.role.name)
  }

  async create(user: User) {
    return ['admin', 'doctor', 'assistant'].includes(user.role.name)
  }

  async delete(user: User, appointment: Appointment) {
    if (user.role.name === 'admin') {
      return true
    }
    return appointment.userId === user.id
  }

  async update(user: User) {
    return ['doctor', 'assistant'].includes(user.role.name)
  }
}
