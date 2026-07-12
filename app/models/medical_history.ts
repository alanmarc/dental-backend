import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Patient from '#models/patient'
import Appointment from '#models/appointment'
import Branch from './branch.js'
import Prescription from '#models/prescription'

export default class MedicalHistory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare patientId: number

  @column()
  declare appointmentId: number | null

  @column()
  declare branchId: number

  @column()
  declare diagnosis: string | null

  @column()
  declare treatment: string | null

  @column()
  declare notes: string | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relación con el doctor (Usuario)
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Relación con el paciente
  @belongsTo(() => Patient)
  declare patient: BelongsTo<typeof Patient>

  // Relación con la cita
  @belongsTo(() => Appointment)
  declare appointment: BelongsTo<typeof Appointment>

  // Relación con la sucursal
  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @hasMany(() => Prescription)
  declare prescriptions: HasMany<typeof Prescription>
}
