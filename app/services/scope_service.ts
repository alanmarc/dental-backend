import User from '#models/user'
import Branch from '#models/branch'

export async function getBranchIdsForActorHospital(actor: User): Promise<number[]> {
  const branchIds = await Branch.query().where('hospital_id', actor.branch.hospitalId).select('id')
  return branchIds.map((b) => b.id)
}
