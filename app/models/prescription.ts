import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Patient from '#models/patient'
import Appointment from '#models/appointment'
import PrescriptionItem from '#models/prescription_item'
import Branch from '#models/branch'
import MedicalHistory from '#models/medical_history'

export default class Prescription extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare patientId: number

  @column()
  declare appointmentId: number | null

  @column()
  declare medicalHistoryId: number | null

  @column()
  declare branchId: number

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deleted_at' })
  declare deletedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Patient)
  declare patient: BelongsTo<typeof Patient>

  @belongsTo(() => Appointment)
  declare appointment: BelongsTo<typeof Appointment>

  @belongsTo(() => MedicalHistory)
  declare medicalHistory: BelongsTo<typeof MedicalHistory>

  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>

  @hasMany(() => PrescriptionItem)
  declare items: HasMany<typeof PrescriptionItem>
}
