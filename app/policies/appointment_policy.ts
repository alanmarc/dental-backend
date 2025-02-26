import { BasePolicy } from '@adonisjs/bouncer'
import User from '#models/user'
import Appointment from '#models/appointment'

export default class AppointmentPolicy extends BasePolicy {
  async view(user: User) {
    // Solo los usuarios con rol "admin" o "doctor" pueden ver las citas
    return ['admin', 'doctor'].includes(user.role.name)
  }

  async create(user: User) {
    // Solo doctores y asistentes pueden crear citas
    return ['doctor', 'assistant'].includes(user.role.name)
  }

  async delete(user: User, appointment: Appointment) {
    // Un admin puede eliminar cualquier cita
    if (user.role.name === 'admin') {
      return true
    }

    // Un doctor solo puede eliminar sus propias citas
    return appointment.userId === user.id
  }
}
