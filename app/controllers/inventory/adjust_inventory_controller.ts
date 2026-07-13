import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import InventoryPolicy from '#policies/inventory_policy'
import Product from '#models/product'
import Branch from '#models/branch'
import { registerMovement } from '#services/inventory_service'
import { adjustInventoryValidator } from '#validators/inventory/adjust_inventory_validator'
import { handleControllerError } from '#utils/error_handler'

export default class AdjustInventoryController {
  public async handle(ctx: HttpContext) {
    try {
      const actor = ctx.auth.user!
      await ctx.bouncer.with(InventoryPolicy).authorize('adjust')

      const data = await ctx.request.validateUsing(adjustInventoryValidator)
      const { productId, branchId, quantity, direction, notes } = data

      if (!actor.branch) await actor.load('branch')

      const branch = await Branch.query().where('id', branchId).whereNull('deleted_at').first()
      if (!branch) {
        return ApiResponse.error(ctx, 'Sucursal no encontrada', 422)
      }

      if (branch.hospitalId !== actor.branch.hospitalId) {
        return ApiResponse.error(ctx, 'No puedes operar sobre una sucursal de otro hospital', 422)
      }

      if (!actor.hasPermission('inventory.adjust.any') && branchId !== actor.branchId) {
        return ApiResponse.error(ctx, 'No puedes ajustar inventario de otra sucursal', 422)
      }

      const product = await Product.query().where('id', productId).whereNull('deleted_at').first()
      if (!product) {
        return ApiResponse.error(ctx, 'Producto no encontrado', 422)
      }

      if (product.hospitalId !== branch.hospitalId) {
        return ApiResponse.error(
          ctx,
          'El producto y la sucursal deben pertenecer al mismo hospital',
          422
        )
      }

      // 3. Register movement inside a transaction
      const trx = await db.transaction()
      try {
        const type = direction === 'in' ? 'adjustment_in' : 'adjustment_out'
        const { movement, inventory } = await registerMovement({
          branchId,
          productId,
          type,
          quantity,
          direction,
          userId: actor.id,
          notes,
          trx,
        })

        await trx.commit()

        return ApiResponse.success(
          ctx,
          {
            movement: movement.toJSON(),
            newQuantity: inventory.quantity,
          },
          'Inventario ajustado correctamente'
        )
      } catch (error) {
        await trx.rollback()
        throw error
      }
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
