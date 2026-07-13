import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import ProductPolicy from '#policies/product_policy'
import { handleControllerError } from '#utils/error_handler'

export default class IndexProductsController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)
      const actor = ctx.auth.user!

      await ctx.bouncer.with(ProductPolicy).authorize('view')

      let query = Product.query().whereNull('deleted_at')

      if (!actor.hasPermission('products.view.any')) {
        query = query.where('hospital_id', actor.branch.hospitalId)
      }

      const products = await query.paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        products.toJSON().data,
        products.toJSON().meta,
        'Productos encontrados'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
