import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import ProductPolicy from '#policies/product_policy'
import { handleControllerError } from '#utils/error_handler'

export default class RestoreProductsController {
  public async handle(ctx: HttpContext) {
    try {
      const product = await Product.findOrFail(ctx.params.id)
      await ctx.bouncer.with(ProductPolicy).authorize('restore', product)

      product.deletedAt = null
      await product.save()

      return ApiResponse.success(ctx, product.toJSON(), 'Producto restaurado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
