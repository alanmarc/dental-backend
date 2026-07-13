import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Product from '#models/product'
import Branch from '#models/branch'
import User from '#models/user'

export default class InventoryTransfer extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  @column()
  declare fromBranchId: number

  @column()
  declare toBranchId: number

  @column()
  declare quantity: number

  @column()
  declare status: 'completed' | 'cancelled'

  @column()
  declare requestedBy: number

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>

  @belongsTo(() => Branch, { foreignKey: 'fromBranchId' })
  declare fromBranch: BelongsTo<typeof Branch>

  @belongsTo(() => Branch, { foreignKey: 'toBranchId' })
  declare toBranch: BelongsTo<typeof Branch>

  @belongsTo(() => User, { foreignKey: 'requestedBy' })
  declare requester: BelongsTo<typeof User>
}
