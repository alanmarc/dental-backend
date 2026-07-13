import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Branch from '#models/branch'
import Product from '#models/product'
import Purchase from '#models/purchase'
import InventoryTransfer from '#models/inventory_transfer'
import Appointment from '#models/appointment'
import Prescription from '#models/prescription'
import PrescriptionItem from '#models/prescription_item'
import User from '#models/user'

export default class InventoryMovement extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare branchId: number

  @column()
  declare productId: number

  @column()
  declare type:
    | 'purchase'
    | 'purchase_return'
    | 'adjustment_in'
    | 'adjustment_out'
    | 'consumption'
    | 'patient_return'
    | 'transfer_out'
    | 'transfer_in'

  @column()
  declare quantity: number

  @column()
  declare purchaseId: number | null

  @column()
  declare transferId: number | null

  @column()
  declare appointmentId: number | null

  @column()
  declare prescriptionId: number | null

  @column()
  declare prescriptionItemId: number | null

  @column()
  declare userId: number

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Purchase)
  declare purchase: BelongsTo<typeof Purchase>

  @belongsTo(() => InventoryTransfer, { foreignKey: 'transferId' })
  declare transfer: BelongsTo<typeof InventoryTransfer>

  @belongsTo(() => Appointment)
  declare appointment: BelongsTo<typeof Appointment>

  @belongsTo(() => Prescription)
  declare prescription: BelongsTo<typeof Prescription>

  @belongsTo(() => PrescriptionItem)
  declare prescriptionItem: BelongsTo<typeof PrescriptionItem>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
