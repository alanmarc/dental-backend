import Role from '#models/role'
import Permission from '#models/permission'
import { UserFactory } from '#database/factories/user_factory'

export async function createUserWithPermissions(permissionNames: string[]) {
  const role = await Role.create({ name: `test-role-${Date.now()}` })
  const permissions = await Promise.all(
    permissionNames.map((name) => Permission.firstOrCreate({ name }, { name }))
  )
  await role.related('permissions').sync(permissions.map((p) => p.id))
  return UserFactory.merge({ roleId: role.id }).create()
}
