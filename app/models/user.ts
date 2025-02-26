import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import AccessToken from '#models/access_token'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'
import Role from './role.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @column()
  declare roleId: number | null

  //Relacion con el token -- TODO: REvisar que sea un acceso por usuario
  @hasMany(() => AccessToken)
  declare accessTokens: HasMany<typeof AccessToken>

  // Relación de un usuario (dentista/encargado) con múltiples pacientes
  @hasMany(() => Patient)
  declare patients: HasMany<typeof Patient>

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
