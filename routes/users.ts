import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: IndexUsersController } = await import('#controllers/user/index_users_controller')
const { default: StoreUserController } = await import('#controllers/user/store_user_controller')
const { default: UpdateUserController } = await import('#controllers/user/update_user_controller')
const { default: SoftDeleteUsersController } = await import(
  '#controllers/user/soft_delete_users_controller'
)
const { default: RestoreUsersController } = await import(
  '#controllers/user/restore_users_controller'
)

const users = (): void => {
  router
    .group(() => {
      router.post('/', [StoreUserController]).as('users.store')
      router.get('/', [IndexUsersController]).as('users.index')
      router.put('/:id', [UpdateUserController]).as('users.update')
      router.delete('/:id', [SoftDeleteUsersController]).as('users.delete')
      router.put('/:id/restore', [RestoreUsersController]).as('users.restore')
    })
    .prefix('/users')
    .use(middleware.auth())
}

export default users
