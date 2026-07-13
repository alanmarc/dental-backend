import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import ProductPolicy from '#policies/product_policy'
import { storeProductValidator } from '#validators/product/store_product_validator'
import { handleControllerError } from '#utils/error_handler'

export default class StoreProductsController {
  public async handle(ctx: HttpContext) {
    try {
      const actor = ctx.auth.user!
      await ctx.bouncer.with(ProductPolicy).authorize('create')

      const data = await ctx.request.validateUsing(storeProductValidator)
      const hospitalId = actor.branch.hospitalId

      const product = await Product.create({
        ...data,
        hospitalId,
      })

      return ApiResponse.success(ctx, product.toJSON(), 'Producto creado', 201)
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
