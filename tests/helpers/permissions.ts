import Role from '#models/role'
import Permission from '#models/permission'
import { UserFactory } from '#database/factories/user_factory'
import Hospital from '#models/hospital'
import Branch from '#models/branch'

export async function createUserWithPermissions(permissionNames: string[]) {
  const role = await Role.create({ name: `test-role-${Date.now()}` })
  const permissions = await Promise.all(
    permissionNames.map((name) => Permission.firstOrCreate({ name }, { name }))
  )
  await role.related('permissions').sync(permissions.map((p) => p.id))

  const hospital = await Hospital.create({ name: `Hospital-${Date.now()}` })
  const branch = await Branch.create({
    hospitalId: hospital.id,
    name: `Sucursal-${Date.now()}`,
    phone: '555-1234',
    email: 'test@branch.com',
    address: 'Calle Test 123',
  })

  return UserFactory.merge({ roleId: role.id, branchId: branch.id }).create()
}
