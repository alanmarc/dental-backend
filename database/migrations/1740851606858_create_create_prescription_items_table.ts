import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'prescription_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('prescription_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('prescriptions')
        .onDelete('CASCADE')
      table.string('medication_name').notNullable()
      table.string('dosage').notNullable()
      table.string('frequency').notNullable()
      table.integer('duration_days').notNullable()
      table.text('instructions').nullable()
      table.timestamps(true, true)

      table.index('prescription_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
