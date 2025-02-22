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
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('date_time', { useTz: true }).notNullable()
      table.integer('duration').notNullable().defaultTo(30)
      table
        .enum('status', ['scheduled', 'completed', 'canceled', 'missed'])
        .notNullable()
        .defaultTo('scheduled')

      table.string('reason', 255).notNullable()
      table.text('notes').nullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
