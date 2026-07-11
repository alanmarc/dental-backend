import Role from '#models/role'
import Permission from '#models/permission'
import { UserFactory } from '#database/factories/user_factory'
import Hospital from '#models/hospital'
import Branch from '#models/branch'

export async function createBranch(hospitalId?: number) {
  let finalHospitalId = hospitalId
  if (!finalHospitalId) {
    const hospital = await Hospital.create({ name: `Hospital-${Date.now()}` })
    finalHospitalId = hospital.id
  }
  return await Branch.create({
    hospitalId: finalHospitalId,
    name: `Sucursal-${Date.now()}`,
    phone: '555-1234',
    email: 'test@branch.com',
    address: 'Calle Test 123',
  })
}

export async function createUserWithPermissions(permissionNames: string[], branchId?: number) {
  const role = await Role.create({ name: `test-role-${Date.now()}` })
  const permissions: Permission[] = []
  for (const name of permissionNames) {
    const p = await Permission.firstOrCreate({ name }, { name })
    permissions.push(p)
  }
  await role.related('permissions').sync(permissions.map((p) => p.id))

  let finalBranchId = branchId
  if (!finalBranchId) {
    const branch = await createBranch()
    finalBranchId = branch.id
  }

  return UserFactory.merge({ roleId: role.id, branchId: finalBranchId }).create()
}
