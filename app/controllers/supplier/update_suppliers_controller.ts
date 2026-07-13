import Supplier from '#models/supplier'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import SupplierPolicy from '#policies/supplier_policy'
import { updateSupplierValidator } from '#validators/supplier/update_supplier_validator'
import { handleControllerError } from '#utils/error_handler'

export default class UpdateSuppliersController {
  public async handle(ctx: HttpContext) {
    try {
      const supplier = await Supplier.findOrFail(ctx.params.id)
      await ctx.bouncer.with(SupplierPolicy).authorize('update', supplier)

      const data = await ctx.request.validateUsing(updateSupplierValidator)
      supplier.merge(data)
      await supplier.save()

      return ApiResponse.success(ctx, supplier.toJSON(), 'Proveedor actualizado')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
