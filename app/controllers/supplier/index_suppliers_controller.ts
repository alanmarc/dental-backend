import Supplier from '#models/supplier'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import SupplierPolicy from '#policies/supplier_policy'
import { handleControllerError } from '#utils/error_handler'

export default class IndexSuppliersController {
  public async handle(ctx: HttpContext) {
    try {
      const page = ctx.request.input('page', 1)
      const limit = ctx.request.input('limit', 10)
      const actor = ctx.auth.user!

      await ctx.bouncer.with(SupplierPolicy).authorize('view')

      let query = Supplier.query().whereNull('deleted_at')

      if (!actor.hasPermission('suppliers.view.any')) {
        query = query.where('hospital_id', actor.branch.hospitalId)
      }

      const suppliers = await query.paginate(page, limit)

      return ApiResponse.paginate(
        ctx,
        suppliers.toJSON().data,
        suppliers.toJSON().meta,
        'Proveedores encontrados'
      )
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
