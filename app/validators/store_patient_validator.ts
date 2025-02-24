import vine from '@vinejs/vine'

export const storePatientValidator = vine.compile(
  vine.object({
    userId: vine.number().exists(async (db, value) => {
      const user = await db.from('users').where('id', value).first()
      return !!user
    }),
    firstName: vine.string().trim(),
    lastName: vine.string().trim(),
  })
)
