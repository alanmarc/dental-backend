import vine from '@vinejs/vine'

export const updateSupplierValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).optional(),
    phone: vine.string().trim().optional(),
    email: vine.string().trim().email().optional(),
    address: vine.string().trim().optional(),
  })
)
