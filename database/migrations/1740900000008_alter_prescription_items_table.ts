import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'prescription_items'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('status', ['pending', 'dispensed', 'declined']).notNullable().defaultTo('pending')
      table.timestamp('dispensed_at', { useTz: true }).nullable()
      table
        .integer('dispensed_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['dispensed_by'])
      table.dropColumn('dispensed_by')
      table.dropColumn('dispensed_at')
      table.dropColumn('status')
    })
  }
}
