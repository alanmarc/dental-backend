import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'purchases'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('supplier_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('suppliers')
        .onDelete('RESTRICT')
      table
        .integer('branch_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('branches')
        .onDelete('RESTRICT')
      table.enum('status', ['draft', 'received', 'cancelled']).notNullable().defaultTo('draft')
      table.string('invoice_number').nullable()
      table.text('notes').nullable()
      table
        .integer('created_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.timestamp('received_at', { useTz: true }).nullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.timestamps(true, true)

      table.index(['branch_id', 'deleted_at'])
      table.index('supplier_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
