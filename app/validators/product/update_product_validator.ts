import vine from '@vinejs/vine'

export const updateProductValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).optional(),
    code: vine.string().trim().optional(),
    unit: vine.string().trim().optional(),
    allowsNegativeStock: vine.boolean().optional(),
  })
)
