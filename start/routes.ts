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
import appointments from '../routes/appointments.js'
import medicalHistories from '../routes/medical_histories.js'
import hospitals from '../routes/hospitals.js'
import branches from '../routes/branches.js'
import prescriptions from '../routes/prescriptions.js'
import products from '../routes/products.js'
import suppliers from '../routes/suppliers.js'

const { default: AllTokensController } = await import('#controllers/all_tokens_controller')
const { default: AuthController } = await import('#controllers/auth_controller')

router
  .get('/', ({ response }: HttpContext) => {
    response.status(200).send({ message: '¡API DENTAL CRM - OK!' })
  })
  .prefix('api')
  .as('api')

router
  .group(() => {
    router.post('/login', [AuthController, 'login']).as('auth.login')

    router.get('/tokens', [AllTokensController]).as('tokens.index').use(middleware.auth())
    router.group(users).as('users')
    router.group(patients).as('patients')
    router.group(appointments).as('appointments')
    router.group(medicalHistories).as('medical_histories')
    router.group(hospitals).as('hospitals')
    router.group(branches).as('branches')
    router.group(prescriptions).as('prescriptions')
    router.group(products).as('products')
    router.group(suppliers).as('suppliers')
  })
  .prefix('api')
  .as('api')
