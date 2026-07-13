import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inventories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('branch_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('branches')
        .onDelete('RESTRICT')
      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('RESTRICT')
      table.integer('quantity').notNullable().defaultTo(0)
      table.timestamps(true, true)

      table.unique(['branch_id', 'product_id'])
      table.index('product_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
