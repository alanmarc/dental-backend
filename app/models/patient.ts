import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import User from '#models/user' // Importamos el modelo User
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Branch from './branch.js'

export default class Patient extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column()
  declare email: string | null

  @column()
  declare dob: DateTime | null

  @column()
  declare phone: string | null

  @column()
  declare address: string | null

  @column()
  declare note: string | null

  @column()
  declare userId: number

  @column()
  declare branchId: number

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  //Un pacientea un Usuario (Doctor)
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  //Un paciente a una sola sucursal
  @belongsTo(() => Branch)
  declare branch: BelongsTo<typeof Branch>
}
