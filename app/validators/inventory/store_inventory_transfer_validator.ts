import vine from '@vinejs/vine'

export const storeInventoryTransferValidator = vine.compile(
  vine.object({
    productId: vine.number().exists(async (db, value) => {
      const product = await db.from('products').where('id', value).whereNull('deleted_at').first()
      return !!product
    }),
    fromBranchId: vine.number().exists(async (db, value) => {
      const branch = await db.from('branches').where('id', value).whereNull('deleted_at').first()
      return !!branch
    }),
    toBranchId: vine.number().exists(async (db, value) => {
      const branch = await db.from('branches').where('id', value).whereNull('deleted_at').first()
      return !!branch
    }),
    quantity: vine.number().min(1),
    notes: vine.string().trim().optional(),
  })
)
