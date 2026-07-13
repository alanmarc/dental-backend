import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Hospital from '#models/hospital'

export default class Product extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare hospitalId: number

  @column()
  declare name: string

  @column()
  declare code: string | null

  @column()
  declare unit: string | null

  @column()
  declare allowsNegativeStock: boolean

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Hospital)
  declare hospital: BelongsTo<typeof Hospital>
}
