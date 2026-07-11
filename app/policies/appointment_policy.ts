import { BasePolicy } from '@adonisjs/bouncer'
import User from '#models/user'
import Appointment from '#models/appointment'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class AppointmentPolicy extends BasePolicy {
  async view(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('appointments.view')
  }

  async create(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('appointments.create')
  }

  async update(actor: User, appointment: Appointment): Promise<AuthorizerResponse> {
    if (actor.hasPermission('appointments.update.any')) return true
    if (actor.hasPermission('appointments.update.own')) {
      return appointment.userId === actor.id
    }
    return false
  }

  async delete(actor: User, appointment: Appointment): Promise<AuthorizerResponse> {
    if (actor.hasPermission('appointments.delete.any')) return true
    if (actor.hasPermission('appointments.delete.own')) {
      return appointment.userId === actor.id
    }
    return false
  }

  async restore(actor: User, appointment: Appointment): Promise<AuthorizerResponse> {
    if (actor.hasPermission('appointments.restore.any')) return true
    if (actor.hasPermission('appointments.restore.own')) {
      return appointment.userId === actor.id
    }
    return false
  }
}
