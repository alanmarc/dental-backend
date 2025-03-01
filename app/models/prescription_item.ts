import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Prescription from '#models/prescription'

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

  @column()
  declare duration: number

  @column()
  declare instructions: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Prescription)
  declare prescription: BelongsTo<typeof Prescription>
}
