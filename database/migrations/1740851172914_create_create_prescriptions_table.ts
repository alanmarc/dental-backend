import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'prescriptions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table
        .integer('patient_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('patients')
        .onDelete('RESTRICT')
      table
        .integer('appointment_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('appointments')
        .onDelete('RESTRICT')
      table
        .integer('medical_history_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('medical_histories')
        .onDelete('RESTRICT')
      table
        .integer('branch_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('branches')
        .onDelete('RESTRICT')
      table.text('notes').nullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()

      table.timestamps(true, true)

      table.index(['branch_id', 'deleted_at'])
      table.index('patient_id')
      table.index('user_id')
      table.index('appointment_id')
      table.index('medical_history_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
