import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Prescription from '#models/prescription'
import User from '#models/user'
import Product from '#models/product'

export default class PrescriptionItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare prescriptionId: number

  @column()
  declare medicationName: string

  @column()
  declare dosage: string

  @column()
  declare frequency: string

  @column({ columnName: 'duration_days' })
  declare durationDays: number

  @column()
  declare instructions: string | null

  @column()
  declare status: 'pending' | 'dispensed' | 'declined'

  @column.dateTime()
  declare dispensedAt: DateTime | null

  @column()
  declare dispensedBy: number | null

  @column()
  declare productId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Prescription)
  declare prescription: BelongsTo<typeof Prescription>

  @belongsTo(() => User, { foreignKey: 'dispensedBy' })
  declare dispenser: BelongsTo<typeof User>

  @belongsTo(() => Product)
  declare product: BelongsTo<typeof Product>
}
