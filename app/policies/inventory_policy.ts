import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class InventoryPolicy extends BasePolicy {
  async view(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('inventory.view')
  }

  async adjust(actor: User): Promise<AuthorizerResponse> {
    return (
      actor.hasPermission('inventory.adjust.own') || actor.hasPermission('inventory.adjust.any')
    )
  }

  async transfer(actor: User): Promise<AuthorizerResponse> {
    return (
      actor.hasPermission('inventory.transfer.own') || actor.hasPermission('inventory.transfer.any')
    )
  }
}
