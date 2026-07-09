import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  async view(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('users.view')
  }

  async create(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('users.create')
  }

  async update(actor: User, _target: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('users.update')
  }

  async assignRole(actor: User, target: User): Promise<AuthorizerResponse> {
    if (!actor.hasPermission('users.assign_role')) return false
    if (actor.id === target.id) return false
    return true
  }

  async delete(actor: User, target: User): Promise<AuthorizerResponse> {
    if (actor.id === target.id) return false
    return actor.hasPermission('users.delete')
  }

  async restore(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('users.restore')
  }
}
