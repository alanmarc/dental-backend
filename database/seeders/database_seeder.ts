import { BaseSeeder } from '@adonisjs/lucid/seeders'
import InitialDataSeeder from './initial_datum_seeder.js'
import RolesAndPermissionsSeeder from './roles_and_permission_seeder.js'

export default class DatabaseSeeder extends BaseSeeder {
  public async run() {
    await new RolesAndPermissionsSeeder(this.client).run()
    await new InitialDataSeeder(this.client).run()
  }
}
