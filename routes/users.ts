import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const { default: GetUsersController } = await import('#controllers/user/get_users_controller')
const { default: StoreUserController } = await import('#controllers/user/store_user_controller')

const users = (): void => {
  router
    .group(() => {
      router.post('/', [StoreUserController]).as('users.store')
      router.get('/', [GetUsersController]).as('users.index')
    })
    .prefix('/users')
    .use(middleware.auth())
}

export default users
