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

  async update(actor: User, target: User): Promise<AuthorizerResponse> {
    if (!actor.hasPermission('users.update')) return false
    if (!actor.branch) {
      await actor.load('branch')
    }
    if (!target.branch) {
      await target.load('branch')
    }
    return actor.branch.hospitalId === target.branch.hospitalId
  }

  async assignRole(actor: User, target: User): Promise<AuthorizerResponse> {
    if (actor.id === target.id) return false
    if (!actor.hasPermission('users.assign_role')) return false
    if (!actor.branch) {
      await actor.load('branch')
    }
    if (!target.branch) {
      await target.load('branch')
    }
    return actor.branch.hospitalId === target.branch.hospitalId
  }

  async delete(actor: User, target: User): Promise<AuthorizerResponse> {
    if (actor.id === target.id) return false
    if (!actor.hasPermission('users.delete')) return false
    if (!actor.branch) {
      await actor.load('branch')
    }
    if (!target.branch) {
      await target.load('branch')
    }
    return actor.branch.hospitalId === target.branch.hospitalId
  }

  async restore(actor: User, target: User): Promise<AuthorizerResponse> {
    if (!actor.hasPermission('users.restore')) return false
    if (!actor.branch) {
      await actor.load('branch')
    }
    if (!target.branch) {
      await target.load('branch')
    }
    return actor.branch.hospitalId === target.branch.hospitalId
  }
}
