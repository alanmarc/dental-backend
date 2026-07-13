import vine from '@vinejs/vine'

export const storeSupplierValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1),
    phone: vine.string().trim().optional(),
    email: vine.string().trim().email().optional(),
    address: vine.string().trim().optional(),
  })
)
