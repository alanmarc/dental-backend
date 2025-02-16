import router from '@adonisjs/core/services/router'

const StoreUserController = () => import('#controllers/store_user_controller')

const users = (): void => {
  router
    .group(() => {
      router.post('/', [StoreUserController]).as('users.store')
    })
    .prefix('/users')
}

export default users
