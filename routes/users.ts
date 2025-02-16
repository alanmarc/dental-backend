import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const users = (): void => {
  router
    .group(() => {
      router
        .post('/', async (ctx) => {
          const { default: StoreUserController } = await import(
            '#controllers/store_user_controller'
          )
          return new StoreUserController().handle(ctx)
        })
        .as('users.store')

      router
        .get('/', async (ctx) => {
          const { default: GetUsersController } = await import('#controllers/get_users_controller')
          return new GetUsersController().index(ctx) // Pasar ctx completo
        })
        .as('users.index')
    })
    .prefix('/users')
    .use(middleware.auth())
}

export default users
