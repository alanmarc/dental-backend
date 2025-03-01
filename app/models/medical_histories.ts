import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Patient from '#models/patient'
import Appointment from '#models/appointment'

export default class MedicalHistories extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare patientId: number

  @column()
  declare appointmentId: number

  @column()
  declare diagnosis: string | null

  @column()
  declare treatment: string | null

  @column()
  declare notes: string | null

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
}
