import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Branch from '#models/branch'
import Product from '#models/product'

export default class Inventory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare branchId: number

  @column()
  declare productId: number

  @column()
  declare quantity: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}
