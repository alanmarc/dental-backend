import vine from '@vinejs/vine'

export const adjustInventoryValidator = vine.compile(
  vine.object({
    productId: vine.number(),
    branchId: vine.number(),
    quantity: vine.number().positive(),
    direction: vine.enum(['in', 'out']),
    notes: vine.string().trim().optional(),
  })
)
