import vine from '@vinejs/vine'

export const storePurchaseValidator = vine.compile(
  vine.object({
    supplierId: vine.number().exists(async (db, value) => {
      const supplier = await db.from('suppliers').where('id', value).whereNull('deleted_at').first()
      return !!supplier
    }),
    branchId: vine.number().exists(async (db, value) => {
      const branch = await db.from('branches').where('id', value).whereNull('deleted_at').first()
      return !!branch
    }),
    invoiceNumber: vine.string().trim().optional(),
    notes: vine.string().trim().optional(),
    items: vine
      .array(
        vine.object({
          productId: vine.number().exists(async (db, value) => {
            const product = await db
              .from('products')
              .where('id', value)
              .whereNull('deleted_at')
              .first()
            return !!product
          }),
          quantity: vine.number().min(1),
          unitCost: vine.number().min(0).optional(),
        })
      )
      .minLength(1),
  })
)
