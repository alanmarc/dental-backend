import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Supplier from '#models/supplier'
import Branch from '#models/branch'
import User from '#models/user'
import PurchaseItem from '#models/purchase_item'
import InventoryMovement from '#models/inventory_movement'

export default class Purchase extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare supplierId: number

  @column()
  declare branchId: number

  @column()
  declare status: 'draft' | 'received' | 'cancelled'

  @column()
  declare invoiceNumber: string | null

  @column()
  declare notes: string | null

  @column()
  declare createdBy: number

  @column.dateTime()
  declare receivedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Supplier)
  declare supplier: BelongsTo<typeof Supplier>

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => PurchaseItem)
  declare items: HasMany<typeof PurchaseItem>

  @hasMany(() => InventoryMovement)
  declare movements: HasMany<typeof InventoryMovement>
}
