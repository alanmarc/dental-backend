import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddDeletedAtToPatients extends BaseSchema {
  protected tableName = 'appointments'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('deleted_at')
    })
  }
}
