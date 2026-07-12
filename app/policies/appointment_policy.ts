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
    if (actor.hasPermission('appointments.update.any')) {
      if (!appointment.branch) {
        await appointment.load('branch')
      }
      return actor.branch.hospitalId === appointment.branch.hospitalId
    }
    if (actor.hasPermission('appointments.update.own')) {
      return appointment.userId === actor.id
    }
    return false
  }

  async delete(actor: User, appointment: Appointment): Promise<AuthorizerResponse> {
    if (actor.hasPermission('appointments.delete.any')) {
      if (!appointment.branch) {
        await appointment.load('branch')
      }
      return actor.branch.hospitalId === appointment.branch.hospitalId
    }
    if (actor.hasPermission('appointments.delete.own')) {
      return appointment.userId === actor.id
    }
    return false
  }

  async restore(actor: User, appointment: Appointment): Promise<AuthorizerResponse> {
    if (actor.hasPermission('appointments.restore.any')) {
      if (!appointment.branch) {
        await appointment.load('branch')
      }
      return actor.branch.hospitalId === appointment.branch.hospitalId
    }
    if (actor.hasPermission('appointments.restore.own')) {
      return appointment.userId === actor.id
    }
    return false
  }
}
