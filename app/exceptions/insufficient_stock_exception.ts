import { Exception } from '@adonisjs/core/exceptions'

export default class InsufficientStockException extends Exception {
  static status = 422
  static code = 'E_INSUFFICIENT_STOCK'

  constructor(message = 'Stock insuficiente') {
    super(message, {
      status: 422,
      code: 'E_INSUFFICIENT_STOCK',
    })
  }
}
