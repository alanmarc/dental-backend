import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inventory_transfers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('RESTRICT')
      table
        .integer('from_branch_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('branches')
        .onDelete('RESTRICT')
      table
        .integer('to_branch_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('branches')
        .onDelete('RESTRICT')
      table.integer('quantity').notNullable()
      table.enum('status', ['completed', 'cancelled']).notNullable().defaultTo('completed')
      table
        .integer('requested_by')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.text('notes').nullable()
      table.timestamps(true, true)

      table.index('from_branch_id')
      table.index('to_branch_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
