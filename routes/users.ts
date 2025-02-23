import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: IndexUsersController } = await import('#controllers/user/index_users_controller')
const { default: StoreUserController } = await import('#controllers/user/store_user_controller')
const { default: UpdateUsersController } = await import('#controllers/user/update_users_controller')

const users = (): void => {
  router
    .group(() => {
      router.post('/', [StoreUserController]).as('users.store')
      router.get('/', [IndexUsersController]).as('users.index')
      router.put('/:id', [UpdateUsersController]).as('users.update')
    })
    .prefix('/users')
    .use(middleware.auth())
}

export default users
