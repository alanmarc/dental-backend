import { BasePolicy } from '@adonisjs/bouncer'
import User from '#models/user'
import MedicalHistory from '#models/medical_history'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class MedicalHistoryPolicy extends BasePolicy {
  async view(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('medical_histories.view')
  }

  async create(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('medical_histories.create')
  }

  async update(actor: User, history: MedicalHistory): Promise<AuthorizerResponse> {
    if (actor.hasPermission('medical_histories.update.any')) {
      if (!history.branch) {
        await history.load('branch')
      }
      return actor.branch.hospitalId === history.branch.hospitalId
    }
    if (actor.hasPermission('medical_histories.update.own')) {
      return history.userId === actor.id
    }
    return false
  }

  async delete(actor: User, history: MedicalHistory): Promise<AuthorizerResponse> {
    if (actor.hasPermission('medical_histories.delete.any')) {
      if (!history.branch) {
        await history.load('branch')
      }
      return actor.branch.hospitalId === history.branch.hospitalId
    }
    if (actor.hasPermission('medical_histories.delete.own')) {
      return history.userId === actor.id
    }
    return false
  }

  async restore(actor: User, history: MedicalHistory): Promise<AuthorizerResponse> {
    if (actor.hasPermission('medical_histories.restore.any')) {
      if (!history.branch) {
        await history.load('branch')
      }
      return actor.branch.hospitalId === history.branch.hospitalId
    }
    if (actor.hasPermission('medical_histories.restore.own')) {
      return history.userId === actor.id
    }
    return false
  }
}
