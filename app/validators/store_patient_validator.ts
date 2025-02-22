import vine from '@vinejs/vine'

export const storePatientValidator = vine.compile(
  vine.object({
    userId: vine.number(),
    firstName: vine.string().trim(),
    lastName: vine.string().trim(),
  })
)
