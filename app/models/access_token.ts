// import { DateTime } from 'luxon'
// import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
// import User from '#models/user'
// import type { BelongsTo } from '@adonisjs/lucid/types/relations'

// export default class AccessToken extends BaseModel {
//   @column({ isPrimary: true })
//   declare id: number

//   @column()
//   declare userId: number

//   @column()
//   declare token: string

//   @column.dateTime()
//   declare expiresAt: DateTime | null

//   @column.dateTime({ autoCreate: true })
//   declare createdAt: DateTime

//   @column.dateTime({ autoCreate: true, autoUpdate: true })
//   declare updatedAt: DateTime

//   @belongsTo(() => User)
//   declare user: BelongsTo<typeof User>
// }
