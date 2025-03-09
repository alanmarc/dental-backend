import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Patient from './patient.js'
import Appointment from './appointment.js'
import Hospital from './hospital.js'

export default class Branch extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare hospitalId: number

  @column()
  declare name: string

  @column()
  declare phone: string

  @column()
  declare email: string

  @column()
  declare address: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  //Una sucursal
  @belongsTo(() => Hospital)
  declare hospital: BelongsTo<typeof Hospital>

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @hasMany(() => Patient)
  declare patients: HasMany<typeof Patient>

  @hasMany(() => Appointment)
  declare appointments: HasMany<typeof Appointment>
}
