import User from '#models/user'
import Purchase from '#models/purchase'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PurchasePolicy extends BasePolicy {
  async view(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('purchases.view')
  }

  async create(actor: User): Promise<AuthorizerResponse> {
    return (
      actor.hasPermission('purchases.create.own') || actor.hasPermission('purchases.create.any')
    )
  }

  async receive(actor: User, purchase: Purchase): Promise<AuthorizerResponse> {
    if (actor.hasPermission('purchases.receive.any')) {
      if (!actor.branch) await actor.load('branch')
      if (!purchase.branch) await purchase.load('branch')
      return actor.branch.hospitalId === purchase.branch.hospitalId
    }

    if (actor.hasPermission('purchases.receive.own')) {
      return purchase.branchId === actor.branchId
    }

    return false
  }

  async cancel(actor: User, purchase: Purchase): Promise<AuthorizerResponse> {
    if (actor.hasPermission('purchases.cancel.any')) {
      if (!actor.branch) await actor.load('branch')
      if (!purchase.branch) await purchase.load('branch')
      return actor.branch.hospitalId === purchase.branch.hospitalId
    }

    if (actor.hasPermission('purchases.cancel.own')) {
      return purchase.branchId === actor.branchId
    }

    return false
  }
}
