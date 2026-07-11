import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class HospitalPolicy extends BasePolicy {
  async view(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('hospitals.view')
  }

  async create(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('hospitals.create')
  }

  async update(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('hospitals.update')
  }

  async delete(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('hospitals.delete')
  }

  async restore(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('hospitals.restore')
  }
}
