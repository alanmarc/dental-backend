import Supplier from '#models/supplier'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import SupplierPolicy from '#policies/supplier_policy'
import { handleControllerError } from '#utils/error_handler'

export default class RestoreSuppliersController {
  public async handle(ctx: HttpContext) {
    try {
      const supplier = await Supplier.findOrFail(ctx.params.id)
      await ctx.bouncer.with(SupplierPolicy).authorize('restore', supplier)

      supplier.deletedAt = null
      await supplier.save()

      return ApiResponse.success(ctx, supplier.toJSON(), 'Proveedor restaurado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
