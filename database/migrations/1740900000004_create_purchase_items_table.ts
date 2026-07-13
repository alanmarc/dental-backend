import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'purchase_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('purchase_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('purchases')
        .onDelete('CASCADE')
      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('RESTRICT')
      table.integer('quantity').notNullable()
      table.decimal('unit_cost', 10, 2).nullable()
      table.timestamps(true, true)

      table.index('purchase_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
