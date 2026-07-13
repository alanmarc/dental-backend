import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import PurchasePolicy from '#policies/purchase_policy'
import { handleControllerError } from '#utils/error_handler'
import { storePurchaseValidator } from '#validators/purchase/store_purchase_validator'
import Purchase from '#models/purchase'
import PurchaseItem from '#models/purchase_item'
import Product from '#models/product'
import Branch from '#models/branch'
import db from '@adonisjs/lucid/services/db'

export default class StorePurchasesController {
  public async handle(ctx: HttpContext) {
    try {
      const actor = ctx.auth.user!
      await ctx.bouncer.with(PurchasePolicy).authorize('create')

      const data = await ctx.request.validateUsing(storePurchaseValidator)

      if (!actor.branch) await actor.load('branch')

      const branch = await Branch.query().where('id', data.branchId).whereNull('deleted_at').first()
      if (!branch) {
        return ApiResponse.error(ctx, 'Sucursal no encontrada', 422)
      }

      if (branch.hospitalId !== actor.branch.hospitalId) {
        return ApiResponse.error(
          ctx,
          'No puedes crear compras para un hospital distinto al tuyo',
          422
        )
      }

      if (!actor.hasPermission('purchases.create.any') && data.branchId !== actor.branchId) {
        return ApiResponse.error(ctx, 'No puedes crear compras para otra sucursal', 422)
      }
      const products = await Promise.all(
        data.items.map((item) => Product.findOrFail(item.productId))
      )

      for (const product of products) {
        if (product.hospitalId !== branch.hospitalId) {
          return ApiResponse.error(
            ctx,
            `El producto ${product.name} no pertenece al mismo hospital que la sucursal`,
            422
          )
        }
      }

      // 3. Create purchase and items within transaction
      const trx = await db.transaction()
      try {
        const purchase = new Purchase()
        purchase.supplierId = data.supplierId
        purchase.branchId = data.branchId
        purchase.createdBy = actor.id
        purchase.invoiceNumber = data.invoiceNumber || null
        purchase.notes = data.notes || null
        purchase.status = 'draft'

        purchase.useTransaction(trx)
        await purchase.save()

        for (const item of data.items) {
          const purchaseItem = new PurchaseItem()
          purchaseItem.purchaseId = purchase.id
          purchaseItem.productId = item.productId
          purchaseItem.quantity = item.quantity
          purchaseItem.unitCost = item.unitCost || null

          purchaseItem.useTransaction(trx)
          await purchaseItem.save()
        }

        await trx.commit()

        await purchase.load('items')

        return ApiResponse.success(ctx, purchase.toJSON(), 'Compra creada en borrador', 201)
      } catch (err) {
        await trx.rollback()
        throw err
      }
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
