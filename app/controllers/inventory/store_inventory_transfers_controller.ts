import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import InventoryPolicy from '#policies/inventory_policy'
import Product from '#models/product'
import Branch from '#models/branch'
import InventoryTransfer from '#models/inventory_transfer'
import { registerMovement } from '#services/inventory_service'
import { storeInventoryTransferValidator } from '#validators/inventory/store_inventory_transfer_validator'
import { handleControllerError } from '#utils/error_handler'

export default class StoreInventoryTransfersController {
  public async handle(ctx: HttpContext) {
    try {
      const actor = ctx.auth.user!
      await ctx.bouncer.with(InventoryPolicy).authorize('transfer')

      const data = await ctx.request.validateUsing(storeInventoryTransferValidator)
      const { productId, fromBranchId, toBranchId, quantity, notes } = data

      if (fromBranchId === toBranchId) {
        return ApiResponse.error(ctx, 'La sucursal de origen y destino no pueden ser iguales', 422)
      }

      if (!actor.branch) await actor.load('branch')

      // Fetch branches to validate hospital alignment
      const [fromBranch, toBranch] = await Promise.all([
        Branch.query().where('id', fromBranchId).whereNull('deleted_at').first(),
        Branch.query().where('id', toBranchId).whereNull('deleted_at').first(),
      ])

      if (!fromBranch || !toBranch) {
        return ApiResponse.error(ctx, 'Sucursal de origen o destino no encontrada', 422)
      }

      if (
        fromBranch.hospitalId !== actor.branch.hospitalId ||
        toBranch.hospitalId !== actor.branch.hospitalId
      ) {
        return ApiResponse.error(ctx, 'No puedes operar sobre una sucursal de otro hospital', 422)
      }

      // Scoping: own branch check if no transfer.any
      if (!actor.hasPermission('inventory.transfer.any')) {
        if (fromBranchId !== actor.branchId && toBranchId !== actor.branchId) {
          return ApiResponse.error(ctx, 'No tienes permiso para realizar este traspaso', 403)
        }
      }

      // Validate product existence and hospital alignment
      const product = await Product.query().where('id', productId).whereNull('deleted_at').first()
      if (!product) {
        return ApiResponse.error(ctx, 'Producto no encontrado', 422)
      }

      if (product.hospitalId !== fromBranch.hospitalId) {
        return ApiResponse.error(
          ctx,
          'El producto no pertenece al mismo hospital que las sucursales del traspaso',
          422
        )
      }

      const trx = await db.transaction()
      try {
        const transfer = new InventoryTransfer()
        transfer.productId = productId
        transfer.fromBranchId = fromBranchId
        transfer.toBranchId = toBranchId
        transfer.quantity = quantity
        transfer.requestedBy = actor.id
        transfer.status = 'completed'
        transfer.notes = notes || null

        transfer.useTransaction(trx)
        await transfer.save()

        // Register output from source branch
        await registerMovement({
          branchId: fromBranchId,
          productId,
          type: 'transfer_out',
          quantity,
          direction: 'out',
          userId: actor.id,
          transferId: transfer.id,
          trx,
        })

        // Register input into destination branch
        await registerMovement({
          branchId: toBranchId,
          productId,
          type: 'transfer_in',
          quantity,
          direction: 'in',
          userId: actor.id,
          transferId: transfer.id,
          trx,
        })

        await trx.commit()

        await transfer.load('movements')

        return ApiResponse.success(ctx, transfer.toJSON(), 'Traspaso completado exitosamente', 201)
      } catch (err) {
        await trx.rollback()
        throw err
      }
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
