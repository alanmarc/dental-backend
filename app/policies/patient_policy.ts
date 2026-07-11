import Patient from '#models/patient'
import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PatientPolicy extends BasePolicy {
  async view(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('patients.view')
  }

  async create(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('patients.create')
  }

  async update(actor: User, patient: Patient): Promise<AuthorizerResponse> {
    if (actor.hasPermission('patients.update.any')) return true
    if (actor.hasPermission('patients.update.own')) {
      return patient.userId === actor.id
    }
    return false
  }

  async delete(actor: User, patient: Patient): Promise<AuthorizerResponse> {
    if (actor.hasPermission('patients.delete.any')) return true
    if (actor.hasPermission('patients.delete.own')) {
      return patient.userId === actor.id
    }
    return false
  }

  async restore(actor: User, patient: Patient): Promise<AuthorizerResponse> {
    if (actor.hasPermission('patients.restore.any')) return true
    if (actor.hasPermission('patients.restore.own')) {
      return patient.userId === actor.id
    }
    return false
  }
}
