import { BasePolicy } from '@adonisjs/bouncer'
import User from '#models/user'
import MedicalHistory from '#models/medical_history'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class MedicalHistoriePolicy extends BasePolicy {
  async view(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('medical_histories.view')
  }

  async create(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('medical_histories.create')
  }

  async update(actor: User, history: MedicalHistory): Promise<AuthorizerResponse> {
    if (actor.hasPermission('medical_histories.update.any')) return true
    if (actor.hasPermission('medical_histories.update.own')) {
      return history.userId === actor.id
    }
    return false
  }

  async delete(actor: User, history: MedicalHistory): Promise<AuthorizerResponse> {
    if (actor.hasPermission('medical_histories.delete.any')) return true
    if (actor.hasPermission('medical_histories.delete.own')) {
      return history.userId === actor.id
    }
    return false
  }

  async restore(actor: User, history: MedicalHistory): Promise<AuthorizerResponse> {
    if (actor.hasPermission('medical_histories.restore.any')) return true
    if (actor.hasPermission('medical_histories.restore.own')) {
      return history.userId === actor.id
    }
    return false
  }
}
