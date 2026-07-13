import User from '#models/user'
import Product from '#models/product'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class ProductPolicy extends BasePolicy {
  async view(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('products.view')
  }

  async create(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('products.create')
  }

  async update(actor: User, target: Product): Promise<AuthorizerResponse> {
    if (!actor.hasPermission('products.update')) return false
    if (!actor.branch) await actor.load('branch')
    return actor.branch.hospitalId === target.hospitalId
  }

  async delete(actor: User, target: Product): Promise<AuthorizerResponse> {
    if (!actor.hasPermission('products.delete')) return false
    if (!actor.branch) await actor.load('branch')
    return actor.branch.hospitalId === target.hospitalId
  }

  async restore(actor: User, target: Product): Promise<AuthorizerResponse> {
    if (!actor.hasPermission('products.restore')) return false
    if (!actor.branch) await actor.load('branch')
    return actor.branch.hospitalId === target.hospitalId
  }
}
