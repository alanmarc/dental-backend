import Permission from '#models/permission'
import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { PERMISSIONS } from '../../app/constants/permissions.js'

export default class RolesAndPermissionsSeeder extends BaseSeeder {
  public async run() {
    const roles = await this.upsertRoles(['super_admin', 'admin', 'doctor', 'assistant', 'patient'])
    const permissions = await this.upsertPermissions(this.flattenPermissions())

    const permByName = (name: string) => permissions.find((p) => p.name === name)!

    await roles.super_admin
      .related('permissions')
      .sync(
        this.pivotFor(
          [
            ...this.flattenPermissions(),
            PERMISSIONS.users.viewAny,
            PERMISSIONS.patients.viewAny,
            PERMISSIONS.appointments.viewAny,
            PERMISSIONS.medicalHistories.viewAny,
            PERMISSIONS.branches.viewAny,
            PERMISSIONS.prescriptions.viewAny,
          ],
          permByName
        )
      )

    await roles.admin
      .related('permissions')
      .sync(
        this.pivotFor(
          [
            PERMISSIONS.users.view,
            PERMISSIONS.users.create,
            PERMISSIONS.users.update,
            PERMISSIONS.users.delete,
            PERMISSIONS.users.restore,
            PERMISSIONS.users.assignRole,
            PERMISSIONS.patients.view,
            PERMISSIONS.patients.create,
            PERMISSIONS.patients.updateAny,
            PERMISSIONS.patients.deleteAny,
            PERMISSIONS.patients.restoreAny,
            PERMISSIONS.appointments.view,
            PERMISSIONS.appointments.create,
            PERMISSIONS.appointments.updateAny,
            PERMISSIONS.appointments.deleteAny,
            PERMISSIONS.appointments.restoreAny,
            PERMISSIONS.medicalHistories.view,
            PERMISSIONS.medicalHistories.create,
            PERMISSIONS.medicalHistories.updateAny,
            PERMISSIONS.medicalHistories.deleteAny,
            PERMISSIONS.medicalHistories.restoreAny,
            PERMISSIONS.prescriptions.view,
            PERMISSIONS.prescriptions.viewAny,
            PERMISSIONS.prescriptions.create,
            PERMISSIONS.prescriptions.updateAny,
            PERMISSIONS.prescriptions.deleteAny,
            PERMISSIONS.prescriptions.restoreAny,
            PERMISSIONS.branches.view,
            PERMISSIONS.branches.createOwn,
            PERMISSIONS.branches.updateOwn,
            PERMISSIONS.branches.deleteOwn,
            PERMISSIONS.branches.restoreOwn,
          ],
          permByName
        )
      )

    await roles.doctor
      .related('permissions')
      .sync(
        this.pivotFor(
          [
            PERMISSIONS.patients.view,
            PERMISSIONS.patients.create,
            PERMISSIONS.patients.updateOwn,
            PERMISSIONS.patients.deleteOwn,
            PERMISSIONS.patients.restoreOwn,
            PERMISSIONS.appointments.view,
            PERMISSIONS.appointments.create,
            PERMISSIONS.appointments.updateOwn,
            PERMISSIONS.appointments.deleteOwn,
            PERMISSIONS.appointments.restoreOwn,
            PERMISSIONS.medicalHistories.view,
            PERMISSIONS.medicalHistories.create,
            PERMISSIONS.medicalHistories.updateOwn,
            PERMISSIONS.medicalHistories.deleteOwn,
            PERMISSIONS.medicalHistories.restoreOwn,
            PERMISSIONS.prescriptions.view,
            PERMISSIONS.prescriptions.create,
            PERMISSIONS.prescriptions.updateOwn,
            PERMISSIONS.prescriptions.deleteOwn,
            PERMISSIONS.prescriptions.restoreOwn,
          ],
          permByName
        )
      )

    await roles.assistant.related('permissions').sync(
      this.pivotFor(
        [
          PERMISSIONS.patients.view,
          PERMISSIONS.patients.create,
          PERMISSIONS.appointments.view,
          PERMISSIONS.appointments.create,
          PERMISSIONS.appointments.updateOwn,
        ],
        permByName
      )
      // Nota: sin delete/restore de patients, sin assign_role, sin manage_users
    )

    await roles.patient.related('permissions').sync(
      this.pivotFor(
        [
          PERMISSIONS.appointments.view, // scoping a "sus propias" citas va en la policy, no aquí
        ],
        permByName
      )
    )
  }

  private pivotFor(names: string[], resolve: (n: string) => Permission) {
    return names.reduce(
      (acc, name) => {
        acc[resolve(name).id] = {}
        return acc
      },
      {} as Record<number, {}>
    )
  }

  private flattenPermissions(): string[] {
    return Object.values(PERMISSIONS).flatMap((group) => Object.values(group))
  }

  private async upsertRoles(names: string[]) {
    const existing = await Role.all()
    const result: Record<string, Role> = {}
    for (const name of names) {
      result[name] = existing.find((r) => r.name === name) ?? (await Role.create({ name }))
    }
    return result as {
      super_admin: Role
      admin: Role
      doctor: Role
      assistant: Role
      patient: Role
    }
  }

  private async upsertPermissions(names: string[]) {
    const existing = await Permission.all()
    const missing = names.filter((n) => !existing.find((p) => p.name === n))
    if (missing.length) {
      await Permission.createMany(missing.map((name) => ({ name })))
    }
    return Permission.all()
  }
}
