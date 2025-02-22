import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from '#models/patient'
import User from '#models/user'

export default class Appointment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare patientId: number

  @column()
  declare userId: number

  @column()
  declare dateTime: DateTime

  @column()
  declare duration: number

  @column()
  declare status: 'scheduled' | 'completed' | 'canceled' | 'missed'

  @column()
  declare reason: string

  @column()
  public notes?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relación con el modelo de Paciente
  @belongsTo(() => Patient, { foreignKey: 'patientId' })
  declare patient: BelongsTo<typeof Patient>

  // Relación con el modelo de Usuario (Dentista o encargado)
  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
