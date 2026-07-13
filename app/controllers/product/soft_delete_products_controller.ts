import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import ProductPolicy from '#policies/product_policy'
import { handleControllerError } from '#utils/error_handler'
import { DateTime } from 'luxon'

export default class SoftDeleteProductsController {
  public async handle(ctx: HttpContext) {
    try {
      const product = await Product.findOrFail(ctx.params.id)
      await ctx.bouncer.with(ProductPolicy).authorize('delete', product)

      product.deletedAt = DateTime.utc()
      await product.save()

      return ApiResponse.success(ctx, product.toJSON(), 'Producto eliminado (Soft)')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
