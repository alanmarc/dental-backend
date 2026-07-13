import Supplier from '#models/supplier'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import SupplierPolicy from '#policies/supplier_policy'
import { storeSupplierValidator } from '#validators/supplier/store_supplier_validator'
import { handleControllerError } from '#utils/error_handler'

export default class StoreSuppliersController {
  public async handle(ctx: HttpContext) {
    try {
      const actor = ctx.auth.user!
      await ctx.bouncer.with(SupplierPolicy).authorize('create')

      const data = await ctx.request.validateUsing(storeSupplierValidator)
      const hospitalId = actor.branch.hospitalId

      const supplier = await Supplier.create({
        ...data,
        hospitalId,
      })

      return ApiResponse.success(ctx, supplier.toJSON(), 'Proveedor creado', 201)
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
