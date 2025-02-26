import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Permission from './permission.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @manyToMany(() => Permission, {
    pivotTable: 'role_permission',
    pivotForeignKey: 'role_id',
    pivotRelatedForeignKey: 'permission_id',
  })
  declare permissions: ManyToMany<typeof Permission>
}
