import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: IndexBranchesController } =
  await import('#controllers/branch/index_branches_controller')
const { default: StoreBranchesController } =
  await import('#controllers/branch/store_branches_controller')
const { default: UpdateBranchesController } =
  await import('#controllers/branch/update_branches_controller')
const { default: SoftDeleteBranchesController } =
  await import('#controllers/branch/soft_delete_branches_controller')
const { default: RestoreBranchesController } =
  await import('#controllers/branch/restore_branches_controller')

const branches = (): void => {
  router
    .group(() => {
      router.post('/', [StoreBranchesController]).as('store')
      router.get('/', [IndexBranchesController]).as('index')
      router.put('/:id', [UpdateBranchesController]).as('update')
      router.delete('/:id', [SoftDeleteBranchesController]).as('delete')
      router.put('/:id/restore', [RestoreBranchesController]).as('restore')
    })
    .prefix('/branches')
    .use([middleware.auth(), middleware.loadPermissions()])
}

export default branches
