import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'suppliers'

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
      table.string('phone').nullable()
      table.string('email').nullable()
      table.string('address').nullable()
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.timestamps(true, true)

      table.index(['hospital_id', 'deleted_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
