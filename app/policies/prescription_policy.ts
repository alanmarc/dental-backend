import { BasePolicy } from '@adonisjs/bouncer'
import User from '#models/user'
import Prescription from '#models/prescription'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class PrescriptionPolicy extends BasePolicy {
  async view(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('prescriptions.view')
  }

  async create(actor: User): Promise<AuthorizerResponse> {
    return actor.hasPermission('prescriptions.create')
  }

  async update(actor: User, prescription: Prescription): Promise<AuthorizerResponse> {
    if (actor.hasPermission('prescriptions.update.any')) {
      if (!prescription.branch) {
        await prescription.load('branch')
      }
      return actor.branch.hospitalId === prescription.branch.hospitalId
    }
    if (actor.hasPermission('prescriptions.update.own')) {
      return prescription.userId === actor.id
    }
    return false
  }

  async delete(actor: User, prescription: Prescription): Promise<AuthorizerResponse> {
    if (actor.hasPermission('prescriptions.delete.any')) {
      if (!prescription.branch) {
        await prescription.load('branch')
      }
      return actor.branch.hospitalId === prescription.branch.hospitalId
    }
    if (actor.hasPermission('prescriptions.delete.own')) {
      return prescription.userId === actor.id
    }
    return false
  }

  async restore(actor: User, prescription: Prescription): Promise<AuthorizerResponse> {
    if (actor.hasPermission('prescriptions.restore.any')) {
      if (!prescription.branch) {
        await prescription.load('branch')
      }
      return actor.branch.hospitalId === prescription.branch.hospitalId
    }
    if (actor.hasPermission('prescriptions.restore.own')) {
      return prescription.userId === actor.id
    }
    return false
  }
}
