import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import ProductPolicy from '#policies/product_policy'
import { updateProductValidator } from '#validators/product/update_product_validator'
import { handleControllerError } from '#utils/error_handler'

export default class UpdateProductsController {
  public async handle(ctx: HttpContext) {
    try {
      const product = await Product.findOrFail(ctx.params.id)
      await ctx.bouncer.with(ProductPolicy).authorize('update', product)

      const data = await ctx.request.validateUsing(updateProductValidator)
      product.merge(data)
      await product.save()

      return ApiResponse.success(ctx, product.toJSON(), 'Producto actualizado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
