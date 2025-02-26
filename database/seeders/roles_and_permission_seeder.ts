import Permission from '#models/permission'
import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class RolesAndPermissionsSeeder extends BaseSeeder {
  public async run() {
    // Verificar si los roles ya existen
    const existingRoles = await Role.all()

    const roles = {
      admin:
        existingRoles.find((r) => r.name === 'admin') || (await Role.create({ name: 'admin' })),
      doctor:
        existingRoles.find((r) => r.name === 'doctor') || (await Role.create({ name: 'doctor' })),
      assistant:
        existingRoles.find((r) => r.name === 'assistant') ||
        (await Role.create({ name: 'assistant' })),
      patient:
        existingRoles.find((r) => r.name === 'patient') || (await Role.create({ name: 'patient' })),
    }

    // Verificar si los permisos ya existen
    const existingPermissions = await Permission.all()

    const permissions = {
      manageUsers:
        existingPermissions.find((p) => p.name === 'manage_users') ||
        (await Permission.create({ name: 'manage_users' })),
      manageAppointments:
        existingPermissions.find((p) => p.name === 'manage_appointments') ||
        (await Permission.create({ name: 'manage_appointments' })),
      viewAppointments:
        existingPermissions.find((p) => p.name === 'view_appointments') ||
        (await Permission.create({ name: 'view_appointments' })),
      managePatients:
        existingPermissions.find((p) => p.name === 'manage_patients') ||
        (await Permission.create({ name: 'manage_patients' })),
    }

    // Asignar permisos a roles sin duplicados
    await roles.admin.related('permissions').sync({
      [permissions.manageUsers.id]: {},
      [permissions.manageAppointments.id]: {},
      [permissions.viewAppointments.id]: {},
      [permissions.managePatients.id]: {},
    })

    await roles.doctor.related('permissions').sync({
      [permissions.manageAppointments.id]: {},
      [permissions.viewAppointments.id]: {},
      [permissions.managePatients.id]: {},
    })

    await roles.assistant.related('permissions').sync({
      [permissions.viewAppointments.id]: {},
      [permissions.managePatients.id]: {},
    })

    await roles.patient.related('permissions').sync({
      [permissions.viewAppointments.id]: {},
    })
  }
}
