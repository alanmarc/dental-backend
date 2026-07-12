import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'appointments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('patient_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('patients')
        .onDelete('RESTRICT')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.timestamp('date_time', { useTz: true }).notNullable()
      table.integer('duration').notNullable().defaultTo(30)
      table
        .enum('status', ['scheduled', 'completed', 'canceled', 'missed'])
        .notNullable()
        .defaultTo('scheduled')
      table.string('reason', 255).notNullable()
      table.text('notes').nullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table
        .integer('branch_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('branches')
        .onDelete('RESTRICT')
      table.timestamps(true, true)

      table.index(['user_id', 'date_time'])
      table.index(['branch_id', 'deleted_at'])
      table.index('patient_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
