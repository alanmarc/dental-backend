import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'medical_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('patient_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('patients')
        .onDelete('CASCADE')
      table
        .integer('appointment_id')
        .unsigned()
        .references('id')
        .inTable('appointments')
        .onDelete('CASCADE')
      table.text('diagnosis').nullable()
      table.text('treatment').nullable()
      table.text('notes').nullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table
        .integer('branch_id')
        .unsigned()
        .references('id')
        .inTable('branches')
        .onDelete('SET NULL')
        .nullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
