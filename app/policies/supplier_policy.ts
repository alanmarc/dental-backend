import User from '#models/user'
import Supplier from '#models/supplier'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class SupplierPolicy extends BasePolicy {
  async view(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('suppliers.view')
  }

  async create(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('suppliers.create')
  }

  async update(actor: User, target: Supplier): Promise<AuthorizerResponse> {
    if (!actor.hasPermission('suppliers.update')) return false
    if (!actor.branch) await actor.load('branch')
    return actor.branch.hospitalId === target.hospitalId
  }

  async delete(actor: User, target: Supplier): Promise<AuthorizerResponse> {
    if (!actor.hasPermission('suppliers.delete')) return false
    if (!actor.branch) await actor.load('branch')
    return actor.branch.hospitalId === target.hospitalId
  }

  async restore(actor: User, target: Supplier): Promise<AuthorizerResponse> {
    if (!actor.hasPermission('suppliers.restore')) return false
    if (!actor.branch) await actor.load('branch')
    return actor.branch.hospitalId === target.hospitalId
  }
}
