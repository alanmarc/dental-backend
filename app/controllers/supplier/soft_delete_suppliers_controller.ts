import Supplier from '#models/supplier'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import SupplierPolicy from '#policies/supplier_policy'
import { handleControllerError } from '#utils/error_handler'
import { DateTime } from 'luxon'

export default class SoftDeleteSuppliersController {
  public async handle(ctx: HttpContext) {
    try {
      const supplier = await Supplier.findOrFail(ctx.params.id)
      await ctx.bouncer.with(SupplierPolicy).authorize('delete', supplier)

      supplier.deletedAt = DateTime.utc()
      await supplier.save()

      return ApiResponse.success(ctx, supplier.toJSON(), 'Proveedor eliminado (Soft)')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
