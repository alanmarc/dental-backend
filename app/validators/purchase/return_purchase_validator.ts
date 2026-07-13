import vine from '@vinejs/vine'

export const returnPurchaseValidator = vine.compile(
  vine.object({
    items: vine
      .array(
        vine.object({
          purchaseItemId: vine.number().exists(async (db, value) => {
            const item = await db.from('purchase_items').where('id', value).first()
            return !!item
          }),
          quantity: vine.number().min(1),
        })
      )
      .minLength(1),
  })
)
