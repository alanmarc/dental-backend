import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Patient from '#models/patient'
import User from '#models/user'
import Branch from './branch.js'

export default class Appointment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare patientId: number

  @column()
  declare userId: number

  @column()
  declare branchId: number

  @column()
  declare dateTime: DateTime

  @column()
  declare duration: number

  @column()
  declare status: 'scheduled' | 'completed' | 'canceled' | 'missed'

  @column()
  declare reason: string

  @column()
  public notes?: string | null

  @column.dateTime()
  declare deletedAt: DateTime | null

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

  //Relacion
  @belongsTo(() => Branch, { foreignKey: 'branchId' })
  declare branch: BelongsTo<typeof Branch>

  // Scopes útiles para consultas
  static scheduledBetween = scope((query, start: DateTime, end: DateTime) => {
    query.whereBetween('date_time', [start.toSQL()!, end.toSQL()!])
  })

  static byBranch = scope((query, branchId: number) => {
    query.where('branch_id', branchId)
  })
}
