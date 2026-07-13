import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inventory_movements'

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
      table
        .enum('type', [
          'purchase',
          'purchase_return',
          'adjustment_in',
          'adjustment_out',
          'consumption',
          'patient_return',
          'transfer_out',
          'transfer_in',
        ])
        .notNullable()
      table.integer('quantity').notNullable() // always positive
      table
        .integer('purchase_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('purchases')
        .onDelete('RESTRICT')
      table
        .integer('transfer_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('inventory_transfers')
        .onDelete('RESTRICT')
      table
        .integer('appointment_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('appointments')
        .onDelete('RESTRICT')
      table
        .integer('prescription_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('prescriptions')
        .onDelete('RESTRICT')
      table
        .integer('prescription_item_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('prescription_items')
        .onDelete('RESTRICT')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.text('notes').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())

      table.index(['branch_id', 'created_at'])
      table.index('product_id')
      table.index('purchase_id')
      table.index('transfer_id')
      table.index('appointment_id')
      table.index('prescription_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
