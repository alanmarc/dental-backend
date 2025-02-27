import vine from '@vinejs/vine'

export const updateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().optional(),
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      })
      .optional(),
    roleId: vine
      .number()
      .exists(async (db, value) => {
        const role = await db.from('roles').where('id', value).first()
        return !!role
      })
      .optional(),
  })
)
