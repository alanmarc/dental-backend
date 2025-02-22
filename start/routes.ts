/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { type HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'
import users from '../routes/users.js'
import { middleware } from './kernel.js'
import patients from '../routes/patients.js'

const { default: AllTokensController } = await import('#controllers/all_tokens_controller')

const { default: AuthController } = await import('#controllers/auth_controller')

router
  .get('/', ({ response }: HttpContext) => {
    response.status(200).send({ message: '¡API DENTAL CRM - OK!' })
  })
  .prefix('api')
  .as('api')

router.post('/login', [AuthController, 'login']).prefix('api').as('auth.login')

router.get('/tokens', [AllTokensController]).prefix('api').as('tokens.index').use(middleware.auth())

router.group(users).prefix('api').as('api.users')
router.group(patients).prefix('api').as('api.patients')
