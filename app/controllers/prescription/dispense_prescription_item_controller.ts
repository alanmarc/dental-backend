import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import PrescriptionPolicy from '#policies/prescription_policy'
import { handleControllerError } from '#utils/error_handler'
import PrescriptionItem from '#models/prescription_item'
import { registerMovement } from '#services/inventory_service'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class DispensePrescriptionItemController {
  public async handle(ctx: HttpContext) {
    try {
      const actor = ctx.auth.user!

      // Fetch the prescription item with preloaded prescription and branch for scoping
      const item = await PrescriptionItem.query()
        .where('id', ctx.params.itemId)
        .preload('prescription', (q) => q.preload('branch'))
        .firstOrFail()

      await ctx.bouncer.with(PrescriptionPolicy).authorize('dispense', item)

      if (item.status !== 'pending') {
        return ApiResponse.error(ctx, 'Este ítem ya fue procesado', 422)
      }

      const trx = await db.transaction()
      try {
        // If product_id is associated, register inventory consumption
        if (item.productId !== null) {
          await registerMovement({
            branchId: item.prescription.branchId,
            productId: item.productId,
            type: 'consumption',
            quantity: 1, // standard consumption quantity is 1 unit
            direction: 'out',
            userId: actor.id,
            prescriptionId: item.prescriptionId,
            prescriptionItemId: item.id,
            trx,
          })
        }

        item.status = 'dispensed'
        item.dispensedAt = DateTime.utc()
        item.dispensedBy = actor.id

        item.useTransaction(trx)
        await item.save()

        await trx.commit()

        return ApiResponse.success(ctx, item.toJSON(), 'Medicamento dispensado exitosamente')
      } catch (err) {
        await trx.rollback()
        throw err
      }
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
