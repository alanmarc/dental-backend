import type { HttpContext } from '@adonisjs/core/http'
import ApiResponse from '#utils/api_response'
import PrescriptionPolicy from '#policies/prescription_policy'
import { handleControllerError } from '#utils/error_handler'
import PrescriptionItem from '#models/prescription_item'

export default class DeclinePrescriptionItemController {
  public async handle(ctx: HttpContext) {
    try {
      // Fetch the prescription item with preloaded prescription and branch for scoping
      const item = await PrescriptionItem.query()
        .where('id', ctx.params.itemId)
        .preload('prescription', (q) => q.preload('branch'))
        .firstOrFail()

      await ctx.bouncer.with(PrescriptionPolicy).authorize('dispense', item)

      if (item.status !== 'pending') {
        return ApiResponse.error(ctx, 'Este ítem ya fue procesado', 422)
      }

      item.status = 'declined'
      item.dispensedAt = null
      item.dispensedBy = null
      await item.save()

      return ApiResponse.success(ctx, item.toJSON(), 'Medicamento declinado exitosamente')
    } catch (error) {
      return handleControllerError(ctx, error)
    }
  }
}
