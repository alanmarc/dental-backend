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

router
  .get('/', ({ response }: HttpContext) => {
    response.status(200).send({ message: '¡API DENTAL CRM - OK!' })
  })
  .prefix('api')
  .as('api')

router.group(users).prefix('api').as('api')
