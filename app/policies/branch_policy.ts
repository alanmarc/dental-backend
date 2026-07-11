import Branch from '#models/branch'
import User from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class BranchPolicy extends BasePolicy {
  async view(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('branches.view')
  }

  async create(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('branches.create.any') || actor.hasPermission('branches.create.own')
  }

  async update(actor: User, branch: Branch): Promise<AuthorizerResponse> {
    if (actor.hasPermission('branches.update.any')) return true
    if (actor.hasPermission('branches.update.own')) {
      return actor.branch?.hospitalId === branch.hospitalId
    }
    return false
  }

  async delete(actor: User, branch: Branch): Promise<AuthorizerResponse> {
    if (actor.hasPermission('branches.delete.any')) return true
    if (actor.hasPermission('branches.delete.own')) {
      return actor.branch?.hospitalId === branch.hospitalId
    }
    return false
  }

  async restore(actor: User, branch: Branch): Promise<AuthorizerResponse> {
    if (actor.hasPermission('branches.restore.any')) return true
    if (actor.hasPermission('branches.restore.own')) {
      return actor.branch?.hospitalId === branch.hospitalId
    }
    return false
  }
}
