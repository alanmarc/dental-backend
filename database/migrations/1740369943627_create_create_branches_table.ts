import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'branches'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('hospital_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('hospitals')
        .onDelete('RESTRICT')
      table.string('name').notNullable()
      table.string('phone').notNullable()
      table.string('email').notNullable()
      table.string('address').notNullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['hospital_id', 'deleted_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
