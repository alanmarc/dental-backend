import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Purchase from '#models/purchase'
import Product from '#models/product'

export default class PurchaseItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare purchaseId: number

  @column()
  declare productId: number

  @column()
  declare quantity: number

  @column()
  declare unitCost: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Purchase)
  declare purchase: BelongsTo<typeof Purchase>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}
